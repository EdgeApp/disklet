# Disklet

> A tiny, composable filesystem API.

If you are writing a cross-platform Javascript application, and would like to store data in ordinary files, Disklet provides a nice little API for you to use. It provides a consistent storage interface across the following backends:

* Browser LocalStorage
* Node.js filesystem
* Memory

Disklet tries to stay out of the way so you can focus on you data, not path manipulation or other filesystem details. If you try to write to a folder that doesn't exist, for example, Disklet will automatically create it for you.

The API is intentionally minimalistic, and doesn't support advanced features like symlinks or permissions. It provides:

* Reading / writing / deleting files
* Creating / listing / deleting folders

Here's how Disklet looks in action (using ES2017 `async/await` syntax):

```javascript
import { makeMemoryFolder, locateFile, mapAllFiles } from 'disklet'

async function demo () {
  // Let's make an in-memory filesystem:
  const root = makeMemoryFolder()

  // Writing a file automatically creates any necessary folders:
  await root.folder('notes').file('hi.txt').setText('Hello')

  // If you would rather use paths, we have helpers for that too:
  await locateFile(root, 'notes/hi.txt').getText() // 'Hello'

  // Folders can list their own contents:
  await root.folder('notes').listFiles() // ['hi.txt']
  await root.listFolders() // ['notes']

  // We can easily iterate over files and folders:
  await root.file('a.txt').setText('a')
  await root.file('b.txt').setText('b')
  await mapAllFiles(root, file => file.getText()) // ['a', 'b', 'Hello']

  // Removing folders is easy:
  await root.delete()
}
```

The library has tree-shaking support, so tools like [rollup.js](https://rollupjs.org/) or [Webpack 2](https://webpack.js.org/) can automatically trim away any features you don't use. Even with all features present, the library is only about 2.5K (min + gzip).

Disklet does require a `Promise` implementation, but is plain ES5 otherwise. The library also includes TypeScript typings if you need them.

## API overview

The `Folder` interface has the following methods:

* delete()
* file(name)
* folder(name)
* listFiles()
* listFolders()

The `File` interface has the following methods:

* delete()
* getData()
* getText()
* setData(data)
* setText(text)

The library also provides the following helper functions:

* locateFile(folder, path)
* locateFolder(folder, path)
* mapAllFiles(folder, callback)
* mapFiles(folder, callback)
* mapFolders(folder, callback)

The following functions create new `Folder` objects:

* makeLocalStorageFolder(storage = window.localStorage, opts = {})
* makeMemoryFolder(storage = {})
* makeNodeFolder(path)
* makeUnionFolder(master, fallback)

## Design concepts

### Path handling

In Disklet, navigating between folders involves calling functions rather than concatenating strings. Besides being simpler, this also helps your application become more composable. In a path-based system, every component must have global knowledge of where it's files are located, all the way down to the current working directory or filesystem root. With Disklet, each component can simply receive a `Folder` object telling it where to put its data. The component doesn't need to know where or how the `Folder` stores its data; that's the outer component's job. This is great for unit testing, where the tests can just create their components with memory-based folders instead of a disk-based ones.

This is also why Disklet's folder navigation only runs in one direction, from outer folders to inner folders. If you pass a `Folder` object into a component, you automatically know that it will only write files to that location. This makes programs easier to reason about, since the only way to "escape" is to bypass Disklet entirely.

### Text vs. Data

The one wart in the Disklet API is the distinction between binary files and text files. The `localStorage` backend can only store text, so it converts binary data to base64. The disk-based backends can only store binary data, so they encode text to utf8. If you save a file in one format and load it in the other, the results depend on the platform. This is an unfortunate side-effect of running in multiple environments.

### Composition

Disklet folders are also composable. With only 5 methods each, it is easy to wrap the `File` and `Folder` interfaces with new functionality. One example of this is the union folder, which provides a combined view of two folders. It is simple to write wrappers that provide automatic encryption, logging, or other services while providing the same basic API. The Airbitz core, where Disklet was first developed, uses this capability extensively.

## API reference

### Folder methods

#### `delete(): Promise<void>`

Recursively deletes the folder and all its contents.

#### `file(name: string): File`

Navigates to the named file. The file does not need to exist yet.

#### `folder(name: string): Folder`

Navigates to the named folder. The folder does not need to exist yet.

#### `listFiles(): Promise<Array<string>>`

Lists the file names in this folder. Returns an empty list if this folder doesn't exist yet.

#### `listFolders(): Promise<Array<string>>`

Lists the sub-folder names in this folder. Returns an empty list if this folder doesn't exist yet.

### File methods

#### `delete(): Promise<void>`

Deletes this file. Does nothing if the file doesn't exist.

#### `getData(): Promise<Uint8Array>`

Loads the file's contents as binary data.

#### `getText(): Promise<string>`

Loads the file's contents as text.

#### `setData(data: ArrayLike<number>): Promise<void>`

Writes the file to disk from an array of bytes. This will recursively create any folders needed to hold the file.

#### `setData(text: string): Promise<void>`

Writes the file to disk from a string. Will recursively create any folders needed to hold the file.

### Helper functions

#### `locateFile(folder: Folder, path: string): File`

Navigates to the file given by the `path`.

The path can contain `.` and `..` components, although trying to "escape" the parent folder using too many `..` components will raise an error.

#### `locateFolder(folder: Folder, path: string): Folder`

Navigates to the folder given by the `path`.

The path can contain `.` and `..` components, although trying to "escape" the parent folder using too many `..` components will raise an error.

#### `mapAllFiles(folder: Folder, callback: (file: File, path: string, parent: Folder) => any): Promise<Array<any>>`

This function applies the provided callback function to each file in a folder, recursively. The callback receives a file object, file path (including folders), and direct parent folder, mimicking the `Array.map` callback order.

The callback method can be asynchronous, and any results will be combined into a single array for the return value.

#### `mapFiles(folder: Folder, callback: (file: File, name: string, parent: Folder) => any): Promise<Array<any>>`

This function applies the provided callback function to each file in a folder without recursion. The callback receives a file object, file name, and parent folder, mimicking the `Array.map` callback order.

The callback method can be asynchronous, and any results will be combined into a single array for the return value.

#### `mapFolders(folder: Folder, callback: (folder: Folder, name: string, parent: Folder) => any): Promise<Array<any>>`

This function applies the provided callback function to each file in a folder without recursion. The callback receives a file object, file name, and parent folder, mimicking the `Array.map` callback order.

The callback method can be asynchronous, and any results will be combined into a single array for the return value.

### Creating Folders

#### `makeLocalStorageFolder(storage = window.localStorage, opts = {}): Folder`

A localStorage folder keeps it's contents in the browser's localStorage.

The file paths are the localStorage keys, and the values are strings. If a `prefix` is provided via the `opts` parameter, then all localStorage keys will begin with the provided string. Binary data is transformed to base64, since localStorage can only handle strings.

#### `makeMemoryFolder(storage = {}): Folder`

A memory folder stores its contents in a Javascript object.

The file paths are the object keys, and the file contents are stored as-is (arrays for `setData` and strings for `setText`). All paths start with `/`, so they will never conflict with "magic" Javascript names like `__proto__`.

#### `makeNodeFolder(path: string): Folder`

The Node.js folder backend writes files and folders directly to disk. It requires a starting path that everything will be located under.

Binary data is written as-is, while text is stored in utf-8.

#### `makeUnionFolder(master: Folder, fallback: Folder): Folder`

This folder creates a unified view of two sub-folders. When reading files, the union tries the `master` folder first, and then the `fallback` folder if anything goes wrong. All modifications go to the `master` folder.

The union folder uses "whiteout" files to mark deletions. These are empty files with the extension `._x_`. This way, files in the fallback folder won't show through when the corresponding file is deleted in the master folder.
