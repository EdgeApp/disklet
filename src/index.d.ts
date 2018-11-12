export type DiskletListing = { [path: string]: 'file' | 'folder' }

export type Disklet = {
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

export function deepList(
  disklet: Disklet,
  path?: string
): Promise<DiskletListing>

type LogOperation =
  | 'delete'
  | 'get data'
  | 'get text'
  | 'list'
  | 'set data'
  | 'set text'

type LogOptions = {
  callback?: (path: string, operation: LogOperation) => unknown
  verbose?: boolean
}

type MemoryStorage = { [key: string]: string | Uint8Array }

export function logDisklet(disklet: Disklet, opts?: LogOptions): Disklet
export function mergeDisklets(master: Disklet, fallback: Disklet): Disklet
export function navigateDisklet(disklet: Disklet, path: string): Disklet

export function makeLocalStorageDisklet(
  storage?: Storage,
  opts?: { prefix?: string }
): Disklet
export function makeMemoryDisklet(storage?: MemoryStorage): Disklet
export function makeNodeDisklet(path: string): Disklet
export function makeReactNativeDisklet(): Disklet

// legacy API ----------------------------------------------------------------

export interface Folder {
  delete(): Promise<void>
  file(name: string): File
  folder(name: string): Folder
  listFiles(): Promise<Array<string>>
  listFolders(): Promise<Array<string>>
}

export interface File {
  delete(): Promise<void>
  getData(): Promise<Uint8Array>
  getText(): Promise<string>
  setData(data: ArrayLike<number>): Promise<void>
  setText(text: string): Promise<void>
}

// Helper functions:

export function locateFile(folder: Folder, path: string): File
export function locateFolder(folder: Folder, path: string): Folder

export function mapAllFiles(
  folder: Folder,
  callback: (file: File, path: string, parentFolder: Folder) => any
): Promise<Array<any>>

export function mapFiles(
  folder: Folder,
  callback: (file: File, name: string, parent: Folder) => any
): Promise<Array<any>>

export function mapFolders(
  folder: Folder,
  callback: (folder: Folder, name: string, parent: Folder) => any
): Promise<Array<any>>

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

export function makeLocalStorageFolder(
  storage?: object,
  opts?: LocalStorageOpts
): Folder

export function makeLoggedFolder(
  folder: Folder,
  opts?: LoggedFolderOpts
): Folder

export function makeMemoryFolder(storage?: object): Folder
export function makeNodeFolder(path: string): Folder
export function makeUnionFolder(master: Folder, fallback: Folder): Folder
