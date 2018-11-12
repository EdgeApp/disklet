// @flow

// $FlowFixMe - This library won't be installed in non-RN environments:
import RNFS from 'react-native-fs'
import { base64 } from 'rfc4648'

import {
  type ArrayLike,
  type DiskletFile,
  type DiskletFolder
} from '../index.js'
import { checkName } from '../utility.js'

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

const pathUtil = {
  join (a, b) {
    return a + '/' + b
  },
  dirname (a) {
    return a.replace(/\/[^/]*$/, '')
  }
}

function badError (err) {
  if (
    err.code === 'ENOENT' ||
    err.code === 'ENSCOCOAERRORDOMAIN260' ||
    err.code === 'EUNSPECIFIED'
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
 * If `stat` fails, return a bogus (but safe) result.
 */
function makeFakeStat (isDir) {
  return {
    isDirectory () {
      return isDir
    },
    isFile () {
      return false
    }
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
        names.map(name =>
          stat(pathUtil.join(path, name)).catch(e =>
            makeFakeStat(e.code === 'EISDIR')
          )
        )
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
  _path: string

  constructor (path: string) {
    this._path = path
  }

  delete (): Promise<mixed> {
    return unlink(this._path).catch(ignoreMissing())
  }

  getData (): Promise<Uint8Array> {
    return readFile(this._path, 'base64').then(data => base64.parse(data))
  }

  getText (): Promise<string> {
    return readFile(this._path, 'utf8')
  }

  setData (data: ArrayLike<number>): Promise<mixed> {
    return writeFileDeep(this._path, base64.stringify(data), 'base64')
  }

  setText (text): Promise<mixed> {
    return writeFileDeep(this._path, text, 'utf8')
  }

  getPath (): string {
    return this._path
  }
}

class RNFolder {
  _path: string

  constructor (path: string) {
    this._path = path
  }

  delete (): Promise<mixed> {
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

  file (name): DiskletFile {
    checkName(name)
    return new RNFile(pathUtil.join(this._path, name))
  }

  folder (name): DiskletFolder {
    checkName(name)
    return new RNFolder(pathUtil.join(this._path, name))
  }

  listFiles (): Promise<Array<string>> {
    return readdirStat(this._path).then(lists => {
      const { names, stats } = lists
      return names.filter((name, i) => stats[i].isFile())
    })
  }

  listFolders (): Promise<Array<string>> {
    return readdirStat(this._path).then(lists => {
      const { names, stats } = lists
      return names.filter((name, i) => stats[i].isDirectory())
    })
  }
}

export function makeReactNativeFolder (): DiskletFolder {
  return new RNFolder(RNFS.DocumentDirectoryPath)
}
