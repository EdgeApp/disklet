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

interface LocalStorageOpts {
  prefix?: string
}

export function makeMemoryFolder(storage?: object): Folder
export function makeLocalStorageFolder(storage?: object, opts?: LocalStorageOpts): Folder
export function makeUnionFolder(master: Folder, fallback: Folder): Folder

export function locateFile(folder: Folder, path: string): File
export function locateFolder(folder: Folder, path: string): Folder

export function mapFiles(
  folder: Folder,
  callback: (file: File, name: string, folder: Folder) => any
): Promise<Array<any>>

export function mapAllFiles(
  folder: Folder,
  callback: (file: File, path: string, parentFolder: Folder) => any
): Promise<Array<any>>
