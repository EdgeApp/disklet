// @flow

import {
  type ArrayLike,
  type DiskletFile,
  type DiskletFolder
} from '../index.js'
import { checkName } from '../utility.js'

type MemoryStorage = { [path: string]: string | Uint8Array }

/**
 * A single file stored in memory.
 */
class MemoryFile {
  _storage: MemoryStorage
  _path: string

  constructor (storage: MemoryStorage, path: string) {
    this._storage = storage
    this._path = path
  }

  delete (): Promise<mixed> {
    delete this._storage[this._path]
    return Promise.resolve()
  }

  getData (): Promise<Uint8Array> {
    const item = this._storage[this._path]
    if (item == null) {
      return Promise.reject(new Error(`Cannot load "${this._path}"`))
    }
    if (typeof item === 'string') {
      return Promise.reject(new Error(`"${this._path}" is a text file.`))
    }
    return Promise.resolve(item)
  }

  getText (): Promise<string> {
    const item = this._storage[this._path]
    if (item == null) {
      return Promise.reject(new Error(`Cannot load "${this._path}"`))
    }
    if (typeof item !== 'string') {
      return Promise.reject(new Error(`"${this._path}" is a binary file.`))
    }
    return Promise.resolve(item)
  }

  setData (data: ArrayLike<number>) {
    // We use `any` here becase Flow is too dumb to know that `ArrayLike`
    // is a perfectly acceptable argument to `Uint8Array.from`:
    const flowHack: any = data
    this._storage[this._path] = Uint8Array.from(flowHack)
    return Promise.resolve()
  }

  setText (text: string): Promise<mixed> {
    if (typeof text !== 'string') {
      return Promise.reject(new TypeError('Expected a string'))
    }

    this._storage[this._path] = text
    return Promise.resolve()
  }

  getPath (): string {
    return this._path
  }
}

/**
 * Emulates a filesystem in memory.
 */
class MemoryFolder {
  _storage: MemoryStorage
  _path: string

  constructor (storage: MemoryStorage, path: string) {
    this._storage = storage
    this._path = path + '/'
  }

  delete (): Promise<mixed> {
    const test = new RegExp(`^${this._path}`)
    Object.keys(this._storage).forEach(key => {
      if (test.test(key)) {
        delete this._storage[key]
      }
    })
    return Promise.resolve()
  }

  file (name: string): DiskletFile {
    checkName(name)
    return new MemoryFile(this._storage, this._path + name)
  }

  folder (name: string): DiskletFolder {
    checkName(name)
    return new MemoryFolder(this._storage, this._path + name)
  }

  listFiles (): Promise<Array<string>> {
    const test = new RegExp(`^${this._path}([^/]+)$`)

    const names = []
    Object.keys(this._storage).forEach(key => {
      const results = test.exec(key)
      if (results != null) names.push(results[1])
    })

    return Promise.resolve(names)
  }

  listFolders (): Promise<Array<string>> {
    const test = new RegExp(`^${this._path}([^/]+)/.+`)

    const names = {}
    Object.keys(this._storage).forEach(key => {
      const results = test.exec(key)
      if (results != null) names[results[1]] = true
    })

    return Promise.resolve(Object.keys(names))
  }
}

export function makeMemoryFolder (storage: MemoryStorage = {}) {
  return new MemoryFolder(storage, '')
}
