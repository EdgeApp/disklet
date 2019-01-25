// @flow

import { base64 } from 'rfc4648'

import { type ArrayLike, type Disklet, type DiskletListing } from '../index.js'
import { folderizePath, normalizePath } from '../paths.js'

/**
 * Lists the keys in a localStorage object.
 */
function storageKeys (storage): Array<string> {
  const out = []
  for (let i = 0; i < storage.length; ++i) {
    const key = storage.key(i)
    if (key) out.push(key)
  }
  return out
}

/**
 * Emulates a filesystem in memory.
 */
export function makeLocalStorageDisklet (
  storage: Storage = window.localStorage,
  opts: { prefix?: string } = {}
): Disklet {
  const prefix = opts.prefix != null ? folderizePath(opts.prefix) : '/'

  return {
    delete (path: string): Promise<mixed> {
      const file = normalizePath(path)

      // Try deleteing as a file:
      if (storage.getItem(prefix + file) != null) {
        storage.removeItem(prefix + file)
      }

      // Try deleting as a folder:
      const folder = folderizePath(file)
      for (const key of storageKeys(storage)) {
        if (key.indexOf(prefix + folder) === 0) storage.removeItem(key)
      }
      return Promise.resolve()
    },

    getData (path: string): Promise<Uint8Array> {
      return this.getText(path).then(text => base64.parse(text))
    },

    getText (path: string): Promise<string> {
      const file = normalizePath(path)

      const item = storage.getItem(prefix + file)
      if (item == null) {
        return Promise.reject(new Error(`Cannot load "${file}"`))
      }
      return Promise.resolve(item)
    },

    async list (path: string = ''): Promise<DiskletListing> {
      const file = normalizePath(path)
      const out: DiskletListing = {}

      // Try the path as a file:
      if (storage.getItem(prefix + file) != null) out[file] = 'file'

      // Try the path as a folder:
      const folder = folderizePath(file)
      for (const key of storageKeys(storage)) {
        if (key.indexOf(prefix + folder) !== 0) continue

        const slash = key.indexOf('/', prefix.length + folder.length)
        if (slash < 0) out[key.slice(prefix.length)] = 'file'
        else out[key.slice(prefix.length, slash)] = 'folder'
      }

      return Promise.resolve(out)
    },

    setData (path: string, data: ArrayLike<number>) {
      return this.setText(path, base64.stringify(data))
    },

    setText (path: string, text: string): Promise<mixed> {
      if (typeof text !== 'string') {
        return Promise.reject(new TypeError('setText expects a string'))
      }

      storage.setItem(prefix + normalizePath(path), text)
      return Promise.resolve()
    }
  }
}
