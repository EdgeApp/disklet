// @flow

import { type ArrayLike, type Disklet, type DiskletListing } from './index.js'
import { normalizePath } from './paths.js'

type LogOperation =
  | 'delete'
  | 'get data'
  | 'get text'
  | 'list'
  | 'set data'
  | 'set text'

type LogOptions = {
  callback?: (path: string, operation: LogOperation) => mixed,
  verbose?: boolean
}

export function logDisklet(disklet: Disklet, opts: LogOptions = {}): Disklet {
  const {
    callback = (path, operation) => console.log(`${operation} "${path}"`),
    verbose
  } = opts

  const log = (operation: LogOperation, path: string) => {
    if (verbose || /set|delete/.test(operation)) {
      callback(path, operation)
    }
  }

  return {
    delete(path: string): Promise<mixed> {
      log('delete', normalizePath(path))
      return disklet.delete(path)
    },

    getData(path: string): Promise<Uint8Array> {
      log('get data', normalizePath(path))
      return disklet.getData(path)
    },

    getText(path: string): Promise<string> {
      log('get text', normalizePath(path))
      return disklet.getText(path)
    },

    list(path?: string): Promise<DiskletListing> {
      log('list', path != null ? normalizePath(path) : '')
      return disklet.list(path)
    },

    setData(path: string, data: ArrayLike<number>): Promise<mixed> {
      log('set data', normalizePath(path))
      return disklet.setData(path, data)
    },

    setText(path: string, text: string): Promise<mixed> {
      log('set text', normalizePath(path))
      return disklet.setText(path, text)
    }
  }
}
