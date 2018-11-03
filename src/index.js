// @flow

import { makeLocalStorageFolder } from './backends/local-storage.js'
import { makeMemoryFolder } from './backends/memory.js'
import { makeNodeFolder } from './backends/node.js'
import { makeReactNativeFolder } from './backends/react-native.js'

export * from './legacy/legacy.js'
export {
  makeLocalStorageFolder,
  makeMemoryFolder,
  makeNodeFolder,
  makeReactNativeFolder
}

export type ArrayLike<T> =
  | $ReadOnlyArray<T>
  | {
      +length: number,
      +[n: number]: T
    }
