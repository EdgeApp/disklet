// @flow

import { makeLocalStorageFolder } from './backends/local-storage.js'
import { makeMemoryFolder } from './backends/memory.js'
import { makeNodeFolder } from './backends/node.js'
import { makeReactNativeFolder } from './backends/react-native.js'
import {
  locateFile,
  locateFolder,
  mapAllFiles,
  mapFiles,
  mapFolders
} from './helpers.js'
import { makeLoggedFolder } from './loggedFolder.js'
import { makeUnionFolder } from './unionFolder.js'

export {
  locateFile,
  locateFolder,
  makeLocalStorageFolder,
  makeLoggedFolder,
  makeMemoryFolder,
  makeNodeFolder,
  makeReactNativeFolder,
  makeUnionFolder,
  mapAllFiles,
  mapFiles,
  mapFolders
}

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
