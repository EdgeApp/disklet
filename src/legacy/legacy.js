// @flow

import {
  makeLocalStorageDisklet,
  makeMemoryDisklet,
  makeNodeDisklet,
  makeReactNativeDisklet
} from '../backends/backends.js'
import { type ArrayLike } from '../index.js'
import { downgradeDisklet } from './downgrade.js'
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
  downgradeDisklet,
  locateFile,
  locateFolder,
  makeLoggedFolder,
  makeUnionFolder,
  mapAllFiles,
  mapFiles,
  mapFolders
}

// legacy API ----------------------------------------------------------------

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

// downgrade -----------------------------------------------------------------

export function makeLocalStorageFolder (
  storage: Storage,
  opts?: { prefix?: string }
): DiskletFolder {
  return downgradeDisklet(makeLocalStorageDisklet(storage, opts))
}

export function makeMemoryFolder (storage?: Object): DiskletFolder {
  return downgradeDisklet(makeMemoryDisklet(storage))
}

export function makeNodeFolder (path: string): DiskletFolder {
  return downgradeDisklet(makeNodeDisklet(path))
}

export function makeReactNativeFolder (): DiskletFolder {
  return downgradeDisklet(makeReactNativeDisklet())
}
