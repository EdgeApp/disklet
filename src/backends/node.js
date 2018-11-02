// @flow

import fs from 'fs'
import pathUtil from 'path'

import {
  type ArrayLike,
  type DiskletFile,
  type DiskletFolder
} from '../index.js'
import { checkName } from '../utility.js'

// Promise versions of node.js file operations: -----------------------------

function mkdir (path) {
  return new Promise((resolve, reject) =>
    fs.mkdir(
      path,
      void 0,
      err => (err && err.code !== 'EEXIST' ? reject(err) : resolve())
    )
  )
}

function rmdir (path) {
  return new Promise((resolve, reject) =>
    fs.rmdir(path, (err, out) => (err ? reject(err) : resolve(out)))
  )
}

function readdir (path) {
  return new Promise((resolve, reject) =>
    fs.readdir(path, (err, out) => (err ? reject(err) : resolve(out)))
  )
}

function stat (path) {
  return new Promise((resolve, reject) =>
    fs.stat(path, (err, out) => (err ? reject(err) : resolve(out)))
  )
}

function unlink (path) {
  return new Promise((resolve, reject) =>
    fs.unlink(path, (err, out) => (err ? reject(err) : resolve(out)))
  )
}

function writeFile (path, data, opts) {
  return new Promise((resolve, reject) =>
    fs.writeFile(
      path,
      data,
      opts,
      (err, out) => (err ? reject(err) : resolve(out))
    )
  )
}

// Helpers: -----------------------------------------------------------------

/**
 * If node.js returns a missing-file error (`ENOENT`),
 * translate that into the fallback value and proceed.
 */
function ignoreMissing (fallback) {
  return err => {
    if (err.code !== 'ENOENT') throw err
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
      Promise.all(names.map(name => stat(pathUtil.join(path, name)))).then(
        stats => ({ names, stats })
      )
    )
}

/**
 * Recursively creates a directory.
 */
function mkdirDeep (path) {
  return mkdir(path).catch(err => {
    if (err.code !== 'ENOENT') throw err
    return mkdirDeep(pathUtil.dirname(path)).then(() => mkdir(path))
  })
}

/**
 * Writes a file, creating its directory if needed.
 */
function writeFileDeep (path, data, opts) {
  return writeFile(path, data, opts).catch(err => {
    if (err.code !== 'ENOENT') throw err
    return mkdirDeep(pathUtil.dirname(path)).then(() =>
      writeFile(path, data, opts)
    )
  })
}

class NodeFile {
  _path: string

  constructor (path: string) {
    this._path = path
  }

  delete (): Promise<mixed> {
    return unlink(this._path).catch(ignoreMissing())
  }

  getData (): Promise<Uint8Array> {
    return new Promise((resolve, reject) =>
      fs.readFile(
        this._path,
        {},
        (err, out) => (err ? reject(err) : resolve(out))
      )
    )
  }

  getText (): Promise<string> {
    return new Promise((resolve, reject) =>
      fs.readFile(
        this._path,
        'utf8',
        (err, out) => (err ? reject(err) : resolve(out))
      )
    )
  }

  setData (data: ArrayLike<number>): Promise<mixed> {
    const flowHack: any = data
    return writeFileDeep(this._path, Buffer.from(flowHack), {})
  }

  setText (text: string): Promise<mixed> {
    return writeFileDeep(this._path, text, 'utf8')
  }

  getPath (): string {
    return this._path
  }
}

class NodeFolder {
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

  file (name: string): DiskletFile {
    checkName(name)
    return new NodeFile(pathUtil.join(this._path, name))
  }

  folder (name: string): DiskletFolder {
    checkName(name)
    return new NodeFolder(pathUtil.join(this._path, name))
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

export function makeNodeFolder (path: string): DiskletFolder {
  return new NodeFolder(pathUtil.resolve(path))
}
