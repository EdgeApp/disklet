# Disklet

> A tiny, composable filesystem API.

Every Javascript environment seems to provide its own unique storage solution. If you are writing a cross-platform Javascript application, and just want to store data in ordinary files, there is no standard API to do so. Disklet aims to solve this problem by providing a consistent API across the following platforms:

* Memory

The API is intentionally minimalistic, and doesn't support advanced features like symlinks or permissions. It provides:

* Reading / writing / deleting files
* Creating / listing / deleting folders

Here's how it looks in action (using ES2017 `async/await` syntax):

```javascript
import { makeMemoryFolder, locateFile, mapAllFiles } from 'disklet'

async function demo () {
  const root = makeMemoryFolder()

  // Navigate to `notes/todo.txt` (the folder doesn't need to exist):
  const todoFile = root.folder('notes').file('todo.txt')

  // Writing a file automatically creates any necessary folders:
  await todoFile.setText('Buy groceries')

  // Folders can list their own contents:
  await root.listFolders() // ['notes']
  await root.listFiles() // []
  await root.folder('notes').listFiles() // ['todo.txt']

  // If you would rather use paths, we have a helper for that:
  await locateFile(root, 'notes/message.txt').setText('Hello')

  // We also have iteration helpers:
  await mapAllFiles(root, async function (file, path, folder) {
    console.log(await file.getText())
  })

  // Delete the `notes/todo.txt` file:
  await root.folder('notes').file('todo.txt').delete()

  // Delete the `notes` folder:
  await root.folder('notes').delete()
}
```

The library has tree-shaking support, so tools like [rollup.js](https://rollupjs.org/) or [Webpack 2](https://webpack.js.org/) can automatically trim away any features you don't use.

Disklet requires a `Promise` implementation, but is otherwise plain ES5.

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

* makeMemoryFolder(storage = {})
* makeUnionFolder(master, fallback)

## Design goals

Disklet is optimized for managing application data, as opposed to user documents. Application data is generally hidden from the user, and has an application-controlled layout. Since the application knows where things are supposed to be, it typically assembles the file paths itself, rather than receiving them from the user.

In Disklet, navigating between folders usually involves calling functions rather than concatenating strings. Besides being more convenient, this also helps applications code be more modular. In a path-based system, every component must have global knowledge of where it's files are located, all the way down to the current working directory or filesystem root. With Disklet, each component can simply receive a `Folder` object telling it where to put its data. The component doesn't need to know where or how the `Folder` stores its data; that's the outer component's job. This is great for unit testing, where the tests can just create their components with memory-based folders instead of a disk-based ones.

This is also why Disklet's folder navigation only runs in one direction, from outer folders to inner folders. If you pass a `Folder` object into a component, you automatically know that it will only write files to that location. The only way to "escape" is to bypass Disklet entirely. This makes programs easier to reason about.

Disklet also knows how to create and delete folders recursively. This is a small thing, but it makes the API much easier to use.

Disklet folders are also composable. With only 5 methods each, it is easy to wrap the `File` and `Folder` interfaces with new functionality. One example of this is the union folder, which provides a combined view of two folders. It is simple to write wrappers that provide automatic encryption, logging, or other services while providing the same basic API. The Airbitz core, where Disklet was first developed, uses this capability extensively.

The one wart in the Disklet API is the distinction between binary files and text files. The `localStorage` backend can only store text, so it converts binary data to base64. The disk-based backends can only store binary data, so they encode text to utf8. If you save a file in one format and load it in the other, the results depend on the platform. This is an unfortunate side-effect of running in multiple environments.

## API details

### Folder types

#### `makeMemoryFolder(storage = {}): Folder`

A memory folder stores its contents in a Javascript object.

The file paths are the object keys, and the file contents are stored as-is (arrays for `setData` and strings for `setText`). All paths start with `/`, so they will never conflict with "magic" Javascript names like `__proto__`.

#### `makeUnionFolder(master: Folder, fallback: Folder): Folder`

This folder creates a unified view of two sub-folders. When reading files, the union tries the `master` folder first, and then the `fallback` folder if anything goes wrong. All modifications go to the `master` folder.

To implement deletions, the union folder uses "whiteout" files. These are zero-length files with the extension `._x_`. If a whiteout file exists, the normal file with the corresponding name will not be shown, even if it exists in the fallback folder.

### Folder methods

#### `delete(): Promise<void>`

Recursively deletes the folder and all its contents.

#### `file(name: string): File`

Navigates to the named file. The file name must not contain slashes. Otherwise, this method will never fail, even if the file does not exist.

#### `folder(name: string): Folder`

Navigates to the named folder. The folder name must not contain slashes. Otherwise, this method will never fail, even if the folder does not exist.

#### `listFiles(): Promise<Array<string>>`

Lists the file names in this folder.

#### `listFolders(): Promise<Array<string>>`

Lists the sub-folder names in this folder.

### File methods

#### `delete(): Promise<void>`

Deletes this file.

#### `getData(): Promise<Uint8Array>`

Loads the file's contents as binary data.

#### `getText(): Promise<string>`

Loads the file's contents as text.

#### `setData(data: ArrayLike<number>): Promise<void>`

Writes the file to disk from an array of binary data. Will recursively create any folders needed to hold the file.

#### `setData(text: string): Promise<void>`

Writes the file to disk from a string. Will recursively create any folders needed to hold the file.

### Helper functions

#### `locateFile(folder: Folder, path: string): File`

Navigates to the file given by the `path`.

The path can contain `./` and `../` components, although it is an error to try to "escape" the parent folder using too many `../` components.

#### `locateFolder(folder: Folder, path: string): Folder`

Navigates to the folder given by the `path`.

The path can contain `./` and `../` components, although it is an error to try to "escape" the parent folder using too many `../` components.

#### `mapFiles(folder: Folder, callback: (file: File, name: string, folder: Folder) => any): Promise<Array<any>>`

This function applies the provided callback function to each file in a folder. The file object, file name, and parent folder are provided to the callback, mimicking the `Array.map` callback order.

The callback method can be asynchronous, and the results will be combined into a single array for the return value.

#### `mapAllFiles(folder: Folder, callback: (file: File, path: string, folder: Folder) => any): Promise<Array<any>>`

This function applies the provided callback function to each file in a folder, recursively. The file object, file path (including folders), and direct parent folder are provided to the callback, mimicking the `Array.map` callback order.

The callback method can be asynchronous, and the results will be combined into a single array for the return value.
