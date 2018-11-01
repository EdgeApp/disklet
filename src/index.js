// @flow

export {
  locateFile,
  locateFolder,
  mapAllFiles,
  mapFiles,
  mapFolders
} from './helpers.js'

export { makeLocalStorageFolder } from './localStorageFolder.js'
export { makeLoggedFolder } from './loggedFolder.js'
export { makeMemoryFolder } from './memoryFolder.js'
export { makeNodeFolder } from './nodeFolder.js'
export { makeReactNativeFolder } from './reactNativeFolder.js'
export { makeUnionFolder } from './unionFolder.js'

export type ArrayLike<T> =
  | $ReadOnlyArray<T>
  | {
      +length: number,
      +[n: number]: T
    }

export type DiskletFile = {
  delete(): Promise<mixed>,
  getData(): Promise<Uint8Array>,
  getText(): Promise<string>,
  setData(data: ArrayLike<number>): Promise<mixed>,
  setText(text: string): Promise<mixed>
}

export type DiskletFolder = {
  delete(): Promise<mixed>,
  file(name: string): DiskletFile,
  folder(name: string): DiskletFolder,
  listFiles(): Promise<Array<string>>,
  listFolders(): Promise<Array<string>>
}
