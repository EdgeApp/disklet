// @flow

import { base64 } from 'rfc4648'

import {
  type ArrayLike,
  type DiskletFile,
  type DiskletFolder
} from '../index.js'
import { checkName } from '../utility.js'

const Data = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

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
 * A single file stored in localStorage.
 */
class LocalStorageFile {
  _storage: Storage
  _path: string

  constructor (storage: Storage, path: string) {
    this._storage = storage
    this._path = path
  }

  delete (): Promise<mixed> {
    this._storage.removeItem(this._path)
    return Promise.resolve()
  }

  getData (): Promise<Uint8Array> {
    return this.getText().then(text => base64.parse(text, { out: Data }))
  }

  getText (): Promise<string> {
    const item = this._storage.getItem(this._path)
    return item != null
      ? Promise.resolve(item)
      : Promise.reject(new Error(`Cannot load "${this._path}"`))
  }

  setText (text: string): Promise<mixed> {
    if (typeof text !== 'string') {
      return Promise.reject(new TypeError('Expected a string'))
    }

    this._storage.setItem(this._path, text)
    return Promise.resolve()
  }

  setData (data: ArrayLike<number>): Promise<mixed> {
    return this.setText(base64.stringify(data))
  }

  getPath (): string {
    return this._path
  }
}

/**
 * Emulates a filesystem inside a localStorage instance.
 */
class LocalStorageFolder {
  _storage: Storage
  _path: string

  constructor (storage: Storage, path: string) {
    this._storage = storage
    this._path = path + '/'
  }

  delete (): Promise<mixed> {
    const test = new RegExp(`^${this._path}`)
    storageKeys(this._storage).forEach(key => {
      if (test.test(key)) {
        this._storage.removeItem(key)
      }
    })
    return Promise.resolve()
  }

  file (name: string): DiskletFile {
    checkName(name)
    return new LocalStorageFile(this._storage, this._path + name)
  }

  folder (name: string): DiskletFolder {
    checkName(name)
    return new LocalStorageFolder(this._storage, this._path + name)
  }

  listFiles (): Promise<Array<string>> {
    const test = new RegExp(`^${this._path}([^/]+)$`)

    const names = []
    storageKeys(this._storage).forEach(key => {
      const results = test.exec(key)
      if (results != null) names.push(results[1])
    })

    return Promise.resolve(names)
  }

  listFolders (): Promise<Array<string>> {
    const test = new RegExp(`^${this._path}([^/]+)/.+`)

    const names = {}
    storageKeys(this._storage).forEach(key => {
      const results = test.exec(key)
      if (results != null) names[results[1]] = true
    })

    return Promise.resolve(Object.keys(names))
  }
}

export function makeLocalStorageFolder (
  storage: Storage = window.localStorage,
  opts: { prefix?: string } = {}
): DiskletFolder {
  const { prefix = '' } = opts
  return new LocalStorageFolder(storage, prefix)
}
