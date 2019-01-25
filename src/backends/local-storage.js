// @flow

import { base64 } from 'rfc4648'

import { type ArrayLike, type Disklet, type DiskletListing } from '../index.js'
import { normalizePath } from '../paths.js'

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
  const { prefix = '' } = opts
  const trim = prefix.length + 1

  const normalize = (path: string) => prefix + normalizePath(path)

  return {
    delete (path: string): Promise<mixed> {
      const key = normalize(path)

      // Try deleteing as a file:
      if (storage.getItem(key) != null) storage.removeItem(key)

      // Try deleting as a folder:
      const prefix = key + '/'
      for (const key of storageKeys(storage)) {
        if (key.indexOf(prefix) === 0) storage.removeItem(key)
      }
      return Promise.resolve()
    },

    getData (path: string): Promise<Uint8Array> {
      return this.getText(path).then(text => base64.parse(text))
    },

    getText (path: string): Promise<string> {
      const key = normalize(path)

      const item = storage.getItem(key)
      return item != null
        ? Promise.resolve(item)
        : Promise.reject(new Error(`Cannot load "${key}"`))
    },

    async list (path: string = ''): Promise<DiskletListing> {
      const key = normalize(path)
      const out: DiskletListing = {}

      // Try the path as a file:
      if (storage.getItem(key) != null) out[key.slice(trim)] = 'file'

      // Try the path as a folder:
      const prefix = key + '/'
      for (const key of storageKeys(storage)) {
        if (key.indexOf(prefix) !== 0) continue

        const slash = key.indexOf('/', prefix.length)
        if (slash < 0) out[key.slice(trim)] = 'file'
        else out[key.slice(trim, slash)] = 'folder'
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

      storage.setItem(normalize(path), text)
      return Promise.resolve()
    }
  }
}
