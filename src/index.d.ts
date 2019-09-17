export interface DiskletListing {
  [path: string]: 'file' | 'folder'
}

export interface Disklet {
  // Like `rm -r path`:
  delete(path: string): Promise<unknown>

  // Like `cat path`:
  getData(path: string): Promise<Uint8Array>
  getText(path: string): Promise<string>

  // Like `ls -l path`:
  list(path?: string): Promise<DiskletListing>

  // Like `mkdir -p $(dirname path); echo data > path`:
  setData(path: string, data: ArrayLike<number>): Promise<unknown>
  setText(path: string, text: string): Promise<unknown>
}

type LogOperation =
  | 'delete'
  | 'get data'
  | 'get text'
  | 'list'
  | 'set data'
  | 'set text'

interface LogOptions {
  callback?: (path: string, operation: LogOperation) => unknown
  verbose?: boolean
}

interface MemoryStorage {
  [key: string]: string | Uint8Array
}

// The Typescript DOM library isn't available on React Native,
// so work around that:
interface WebStorage {
  readonly length: number;
  getItem(key: string): string | null;
  key(index: number): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

// Storage backends:
declare function makeLocalStorageDisklet(
  storage?: WebStorage,
  opts?: { prefix?: string }
): Disklet
declare function makeMemoryDisklet(storage?: MemoryStorage): Disklet
declare function makeNodeDisklet(path: string): Disklet
declare function makeReactNativeDisklet(): Disklet

// Helpers:
declare function deepList(
  disklet: Disklet,
  path?: string
): Promise<DiskletListing>
declare function logDisklet(disklet: Disklet, opts?: LogOptions): Disklet
declare function mergeDisklets(master: Disklet, fallback: Disklet): Disklet
declare function navigateDisklet(disklet: Disklet, path: string): Disklet

// legacy API ----------------------------------------------------------------

export interface Folder {
  delete(): Promise<void>
  file(name: string): File
  folder(name: string): Folder
  listFiles(): Promise<string[]>
  listFolders(): Promise<string[]>
}

export interface File {
  delete(): Promise<void>
  getData(): Promise<Uint8Array>
  getText(): Promise<string>
  setData(data: ArrayLike<number>): Promise<void>
  setText(text: string): Promise<void>
}

// Helper functions:

declare function locateFile(folder: Folder, path: string): File
declare function locateFolder(folder: Folder, path: string): Folder

declare function mapAllFiles(
  folder: Folder,
  callback: (file: File, path: string, parentFolder: Folder) => any
): Promise<any[]>

declare function mapFiles(
  folder: Folder,
  callback: (file: File, name: string, parent: Folder) => any
): Promise<any[]>

declare function mapFolders(
  folder: Folder,
  callback: (folder: Folder, name: string, parent: Folder) => any
): Promise<any[]>

// Folder types:

interface LocalStorageOpts {
  prefix?: string
}

type LoggedFolderOperations =
  | 'delete file'
  | 'delete folder'
  | 'get data'
  | 'get text'
  | 'list files'
  | 'list folders'
  | 'set data'
  | 'set text'

interface LoggedFolderOpts {
  callback?: (path: string, operation: LoggedFolderOperations) => void
  verbose?: boolean
}

declare function makeLocalStorageFolder(
  storage?: object,
  opts?: LocalStorageOpts
): Folder

declare function makeLoggedFolder(
  folder: Folder,
  opts?: LoggedFolderOpts
): Folder

declare function makeMemoryFolder(storage?: object): Folder
declare function makeNodeFolder(path: string): Folder
declare function makeUnionFolder(master: Folder, fallback: Folder): Folder
