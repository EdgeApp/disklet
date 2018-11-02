// @flow

import { type DiskletFolder } from '../index.js'

export function makeNodeFolder (path: string): DiskletFolder {
  throw new Error('Not available on React Native')
}

export function makeReactNativeFolder (): DiskletFolder {
  throw new Error('Not available on node.js')
}
