import { checkName } from './utility.js'
import { base64 } from 'rfc4648'

const Data = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

/**
 * Lists the keys in a localStorage object.
 */
function storageKeys (storage) {
  const keys = []
  for (let i = 0; i < storage.length; ++i) {
    keys.push(storage.key(i))
  }
  return keys
}

/**
 * A single file stored in localStorage.
 */
class LocalStorageFile {
  constructor (storage, path) {
    this._storage = storage
    this._path = path
  }

  delete () {
    this._storage.removeItem(this._path)
    return Promise.resolve()
  }

  getData () {
    return this.getText().then(text => base64.parse(text, { out: Data }))
  }

  getText () {
    const item = this._storage.getItem(this._path)
    return item != null
      ? Promise.resolve(item)
      : Promise.reject(new Error(`Cannot load "${this._path}"`))
  }

  setText (text) {
    if (typeof text !== 'string') {
      return Promise.reject(new TypeError('Expected a string'))
    }

    this._storage.setItem(this._path, text)
    return Promise.resolve()
  }

  setData (data) {
    return this.setText(base64.stringify(data))
  }
}

/**
 * Emulates a filesystem inside a localStorage instance.
 */
class LocalStorageFolder {
  constructor (storage, path) {
    this._storage = storage
    this._path = path + '/'
  }

  delete () {
    const test = new RegExp(`^${this._path}`)
    storageKeys(this._storage).forEach(key => {
      if (test.test(key)) {
        this._storage.removeItem(key)
      }
    })
    return Promise.resolve()
  }

  file (name) {
    checkName(name)
    return new LocalStorageFile(this._storage, this._path + name)
  }

  folder (name) {
    checkName(name)
    return new LocalStorageFolder(this._storage, this._path + name)
  }

  listFiles () {
    const test = new RegExp(`^${this._path}([^/]+)$`)

    const names = []
    storageKeys(this._storage).forEach(key => {
      const results = test.exec(key)
      if (results != null) names.push(results[1])
    })

    return Promise.resolve(names)
  }

  listFolders () {
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
  storage = window.localStorage,
  opts = {}
) {
  return new LocalStorageFolder(storage, opts.prefix || '')
}
