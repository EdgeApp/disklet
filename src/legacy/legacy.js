// @flow

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
