// @flow

import { type ArrayLike, type Disklet, type DiskletListing } from '../index.js'
import { normalizePath } from '../internals.js'

type MemoryStorage = { [key: string]: string | Uint8Array }

/**
 * Emulates a filesystem in memory.
 */
export function makeMemoryDisklet (storage: MemoryStorage = {}): Disklet {
  return {
    delete (path: string): Promise<mixed> {
      const key = normalizePath(path)

      // Try deleteing as a file:
      if (storage[key] != null) delete storage[key]

      // Try deleting as a folder:
      const prefix = key + '/'
      for (const key of Object.keys(storage)) {
        if (key.indexOf(prefix) === 0) delete storage[key]
      }
      return Promise.resolve()
    },

    getData (path: string): Promise<Uint8Array> {
      const key = normalizePath(path)
      const item = storage[key]
      if (item == null) {
        return Promise.reject(new Error(`Cannot load "${key}"`))
      }
      if (typeof item === 'string') {
        return Promise.reject(new Error(`"${key}" is a text file.`))
      }
      return Promise.resolve(item)
    },

    getText (path: string): Promise<string> {
      const key = normalizePath(path)
      const item = storage[key]
      if (item == null) {
        return Promise.reject(new Error(`Cannot load "${key}"`))
      }
      if (typeof item !== 'string') {
        return Promise.reject(new Error(`"${key}" is a binary file.`))
      }
      return Promise.resolve(item)
    },

    async list (path: string = ''): Promise<DiskletListing> {
      const key = normalizePath(path)
      const out: DiskletListing = {}

      // Try the path as a file:
      if (storage[key] != null) out[key.slice(1)] = 'file'

      // Try the path as a folder:
      const prefix = key + '/'
      for (const key of Object.keys(storage)) {
        if (key.indexOf(prefix) !== 0) continue

        const slash = key.indexOf('/', prefix.length)
        if (slash < 0) {
          out[key.slice(1)] = 'file'
        } else {
          out[key.slice(1, slash)] = 'folder'
        }
      }

      return Promise.resolve(out)
    },

    setData (path: string, data: ArrayLike<number>) {
      // We use `any` here becase Flow is too dumb to know that `ArrayLike`
      // is a perfectly acceptable argument to `Uint8Array.from`:
      const flowHack: any = data
      const array = Uint8Array.from(flowHack)

      storage[normalizePath(path)] = array
      return Promise.resolve()
    },

    setText (path: string, text: string): Promise<mixed> {
      if (typeof text !== 'string') {
        return Promise.reject(new TypeError('setText expects a string'))
      }

      storage[normalizePath(path)] = text
      return Promise.resolve()
    }
  }
}
