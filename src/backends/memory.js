import { checkName } from '../utility.js'

/**
 * A single file stored in memory.
 */
class MemoryFile {
  constructor (storage, path) {
    this._storage = storage
    this._path = path
  }

  delete () {
    delete this._storage[this._path]
    return Promise.resolve()
  }

  getData () {
    const item = this._storage[this._path]
    return item != null
      ? Promise.resolve(item)
      : Promise.reject(new Error(`Cannot load "${this._path}"`))
  }

  getText () {
    const item = this._storage[this._path]
    return item != null
      ? Promise.resolve(item)
      : Promise.reject(new Error(`Cannot load "${this._path}"`))
  }

  setData (data) {
    this._storage[this._path] = data
    return Promise.resolve()
  }

  setText (text) {
    if (typeof text !== 'string') {
      return Promise.reject(new TypeError('Expected a string'))
    }

    this._storage[this._path] = text
    return Promise.resolve()
  }

  getPath () {
    return this._path
  }
}

/**
 * Emulates a filesystem in memory.
 */
class MemoryFolder {
  constructor (storage, path) {
    this._storage = storage
    this._path = path + '/'
  }

  delete () {
    const test = new RegExp(`^${this._path}`)
    Object.keys(this._storage).forEach(key => {
      if (test.test(key)) {
        delete this._storage[key]
      }
    })
    return Promise.resolve()
  }

  file (name) {
    checkName(name)
    return new MemoryFile(this._storage, this._path + name)
  }

  folder (name) {
    checkName(name)
    return new MemoryFolder(this._storage, this._path + name)
  }

  listFiles () {
    const test = new RegExp(`^${this._path}([^/]+)$`)

    const names = []
    Object.keys(this._storage).forEach(key => {
      const results = test.exec(key)
      if (results != null) names.push(results[1])
    })

    return Promise.resolve(names)
  }

  listFolders () {
    const test = new RegExp(`^${this._path}([^/]+)/.+`)

    const names = {}
    Object.keys(this._storage).forEach(key => {
      const results = test.exec(key)
      if (results != null) names[results[1]] = true
    })

    return Promise.resolve(Object.keys(names))
  }
}

export function makeMemoryFolder (storage = {}) {
  return new MemoryFolder(storage, '')
}
