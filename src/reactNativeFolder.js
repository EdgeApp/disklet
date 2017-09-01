import { checkName } from './utility.js'
import RNFS from 'react-native-fs'

const pathUtil = require('path/')

function mkdir (path) {
  return RNFS.mkdir(path)
}

function readdir (path) {
  return RNFS.readdir(path)
}

function readFile (path, opts) {
  return RNFS.readFile(path, opts)
}

function stat (path) {
  return RNFS.stat(path)
}

function unlink (path) {
  return RNFS.unlink(path)
}

function rmdir (path) {
  return unlink(path)
}

function writeFile (path, data, opts) {
  return RNFS.writeFile(path, data, opts)
}

// Helpers: -----------------------------------------------------------------

function badError (err) {
  if (
    err.code === 'ENOENT' ||
    err.code === 'ENSCOCOAERRORDOMAIN260'
  ) {
    return false
  }
  return true
}

/**
 * If node.js returns a missing-file error (`ENOENT`),
 * translate that into the fallback value and proceed.
 */
function ignoreMissing (fallback) {
  return err => {
    if (badError(err)) {
      throw err
    }
    return fallback
  }
}

/**
 * Reads a directory, returning a list of names and a list of stat objects.
 * Returns empty lists if the directory doesn't exist.
 */
function readdirStat (path) {
  return readdir(path)
    .catch(ignoreMissing([]))
    .then(names =>
      Promise.all(
        names.map(name => stat(pathUtil.join(path, name)))
      ).then(stats => ({ names, stats }))
    )
}

/**
 * Recursively creates a directory.
 */
function mkdirDeep (path) {
  return mkdir(path).catch(err => {
    if (badError(err)) throw err
    return mkdirDeep(pathUtil.dirname(path)).then(() => mkdir(path))
  })
}

/**
 * Writes a file, creating its directory if needed.
 */
function writeFileDeep (path, data, opts) {
  return writeFile(path, data, opts).catch(err => {
    if (badError(err)) throw err
    return mkdirDeep(pathUtil.dirname(path)).then(() =>
      writeFile(path, data, opts)
    )
  })
}

class RNFile {
  constructor (path) {
    this._path = path
  }

  delete () {
    return unlink(this._path).catch(ignoreMissing())
  }

  getData () {
    return readFile(this._path, null)
  }

  getText () {
    return readFile(this._path, 'utf8')
  }

  setData (data) {
    return writeFileDeep(this._path, Uint8Array.from(data), null)
  }

  setText (text) {
    return writeFileDeep(this._path, text, 'utf8')
  }
}

class RNFolder {
  constructor (path) {
    this._path = path
  }

  delete () {
    return readdirStat(this._path)
      .then(lists => {
        const { names, stats } = lists
        const files = names.filter((name, i) => stats[i].isFile())
        const folders = names.filter((name, i) => stats[i].isDirectory())

        // Recursively delete children:
        return Promise.all([
          ...files.map(name => this.file(name).delete()),
          ...folders.map(name => this.folder(name).delete())
        ])
      })
      .then(() => rmdir(this._path))
      .catch(ignoreMissing())
  }

  file (name) {
    checkName(name)
    return new RNFile(pathUtil.join(this._path, name))
  }

  folder (name) {
    checkName(name)
    return new RNFolder(pathUtil.join(this._path, name))
  }

  listFiles () {
    return readdirStat(this._path).then(lists => {
      const { names, stats } = lists
      return names.filter((name, i) => stats[i].isFile())
    })
  }

  listFolders () {
    return readdirStat(this._path).then(lists => {
      const { names, stats } = lists
      return names.filter((name, i) => stats[i].isDirectory())
    })
  }
}

export function makeReactNativeFolder () {
  return new RNFolder(pathUtil.resolve(RNFS.DocumentDirectoryPath))
}
