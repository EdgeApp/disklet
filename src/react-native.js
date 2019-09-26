// @flow

import { makeNodeDisklet } from './backends/dummy.js'
import { makeLocalStorageDisklet } from './backends/local-storage.js'
import { makeMemoryDisklet } from './backends/memory.js'
import { makeReactNativeDisklet } from './backends/react-native.js'
import { type DiskletFolder, downgradeDisklet } from './legacy/legacy.js'

export * from './helpers/helpers.js'
export * from './legacy/legacy.js'
export * from './types.js'
export {
  makeLocalStorageDisklet,
  makeMemoryDisklet,
  makeNodeDisklet,
  makeReactNativeDisklet
}

// legacy API ----------------------------------------------------------------

export function makeLocalStorageFolder(
  storage: Storage,
  opts?: { prefix?: string }
): DiskletFolder {
  return downgradeDisklet(makeLocalStorageDisklet(storage, opts))
}

export function makeMemoryFolder(storage?: Object): DiskletFolder {
  return downgradeDisklet(makeMemoryDisklet(storage))
}

export function makeNodeFolder(path: string): DiskletFolder {
  return downgradeDisklet(makeNodeDisklet(path))
}

export function makeReactNativeFolder(): DiskletFolder {
  return downgradeDisklet(makeReactNativeDisklet())
}
