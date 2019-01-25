// @flow

import fs from 'fs'
import pathUtil from 'path'

import { type ArrayLike, type Disklet, type DiskletListing } from '../index.js'
import { normalizePath } from '../paths.js'

// Promise versions of node.js file operations: -----------------------------

function mkdir (path) {
  return new Promise((resolve, reject) =>
    fs.mkdir(
      path,
      void 0,
      err => (err != null && err.code !== 'EEXIST' ? reject(err) : resolve())
    )
  )
}

function rmdir (path) {
  return new Promise((resolve, reject) =>
    fs.rmdir(path, (err, out) => (err != null ? reject(err) : resolve(out)))
  )
}

function readdir (path) {
  return new Promise((resolve, reject) =>
    fs.readdir(path, (err, out) => (err != null ? reject(err) : resolve(out)))
  )
}

function unlink (path) {
  return new Promise((resolve, reject) =>
    fs.unlink(path, (err, out) => (err != null ? reject(err) : resolve(out)))
  )
}

function writeFile (path, data, opts) {
  return new Promise((resolve, reject) =>
    fs.writeFile(
      path,
      data,
      opts,
      (err, out) => (err != null ? reject(err) : resolve(out))
    )
  )
}

// Helpers: -----------------------------------------------------------------

/**
 * Recursively deletes a file or directory.
 */
function deepDelete (path: string): Promise<mixed> {
  return getType(path).then(type => {
    if (type === 'file') {
      return unlink(path)
    }
    if (type === 'folder') {
      return readdir(path)
        .then(names =>
          Promise.all(names.map(name => deepDelete(pathUtil.join(path, name))))
        )
        .then(() => rmdir(path))
    }
  })
}

/**
 * Recursively creates a directory.
 */
function deepMkdir (path) {
  return mkdir(path).catch(err => {
    if (err.code !== 'ENOENT') throw err
    return deepMkdir(pathUtil.dirname(path)).then(() => mkdir(path))
  })
}

/**
 * Writes a file, creating its directory if needed.
 */
function deepWriteFile (path, data, opts) {
  return writeFile(path, data, opts).catch(err => {
    if (err.code !== 'ENOENT') throw err
    return deepMkdir(pathUtil.dirname(path)).then(() =>
      writeFile(path, data, opts)
    )
  })
}

/**
 * Returns a path's type, or '' if anything goes wrong.
 */
function getType (path: string): Promise<'file' | 'folder' | ''> {
  return new Promise(resolve =>
    fs.stat(path, (err, out) => {
      if (err != null) resolve('')
      else if (out.isFile()) resolve('file')
      else if (out.isDirectory()) resolve('folder')
      else resolve('')
    })
  )
}

// --------------------------------------------------------------------------

export function makeNodeDisklet (path: string): Disklet {
  const root = pathUtil.resolve(path)
  function locate (path: string) {
    return pathUtil.join(root, normalizePath(path, true).replace(/\/$/, ''))
  }

  return {
    delete (path: string): Promise<mixed> {
      return deepDelete(locate(path))
    },

    getData (path: string): Promise<Uint8Array> {
      return new Promise((resolve, reject) =>
        fs.readFile(
          locate(path),
          {},
          (err, out) => (err != null ? reject(err) : resolve(out))
        )
      )
    },

    getText (path: string): Promise<string> {
      return new Promise((resolve, reject) =>
        fs.readFile(
          locate(path),
          'utf8',
          (err, out) => (err != null ? reject(err) : resolve(out))
        )
      )
    },

    list (path: string = ''): Promise<DiskletListing> {
      const nativePath = locate(path)
      const prefix = normalizePath(path, true)

      return getType(nativePath).then(type => {
        const out: DiskletListing = {}

        if (type === 'file') {
          out[prefix.replace(/\/$/, '')] = 'file'
          return out
        }
        if (type === 'folder') {
          return readdir(nativePath).then(names =>
            Promise.all(
              names.map(name => getType(pathUtil.join(nativePath, name)))
            ).then(types => {
              for (let i = 0; i < names.length; ++i) {
                if (types[i] !== '') out[prefix + names[i]] = types[i]
              }
              return out
            })
          )
        }
        return out
      })
    },

    setData (path: string, data: ArrayLike<number>): Promise<mixed> {
      const flowHack: any = data
      return deepWriteFile(locate(path), Buffer.from(flowHack), {})
    },

    setText (path: string, text: string): Promise<mixed> {
      return deepWriteFile(locate(path), text, 'utf8')
    }
  }
}
