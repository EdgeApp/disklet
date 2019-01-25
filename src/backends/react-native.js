// @flow

// $FlowFixMe - This library won't be installed in non-RN environments:
import RNFS from 'react-native-fs'
import { base64 } from 'rfc4648'

import { type ArrayLike, type Disklet, type DiskletListing } from '../index.js'
import { folderizePath, normalizePath } from '../paths.js'

// Helpers: -----------------------------------------------------------------

function dirname (a) {
  return a.replace(/\/[^/]*$/, '')
}

/**
 * Recursively deletes a file or directory.
 */
function deepDelete (path: string): Promise<mixed> {
  return getType(path).then(type => {
    if (type === 'file') {
      return RNFS.unlink(path)
    }
    if (type === 'folder') {
      return RNFS.readdir(path)
        .then(names =>
          Promise.all(names.map(name => deepDelete(path + '/' + name)))
        )
        .then(() => RNFS.unlink(path))
    }
  })
}

/**
 * Recursively creates a directory.
 */
function deepMkdir (path) {
  return RNFS.mkdir(path).catch(err => {
    if (err.code !== 'ENOENT') throw err
    return deepMkdir(dirname(path)).then(() => RNFS.mkdir(path))
  })
}

/**
 * Writes a file, creating its directory if needed.
 */
function deepWriteFile (path, data, opts) {
  return RNFS.writeFile(path, data, opts).catch(err => {
    if (err.code !== 'ENOENT') throw err
    return deepMkdir(dirname(path)).then(() => RNFS.writeFile(path, data, opts))
  })
}

/**
 * Returns a path's type, or '' if anything goes wrong.
 */
function getType (path: string): Promise<'file' | 'folder' | ''> {
  return RNFS.stat(path).then(
    out => {
      if (out.isFile()) return 'file'
      if (out.isDirectory()) return 'folder'
      return ''
    },
    e => {
      if (e.code === 'EISDIR') return 'folder'
      return ''
    }
  )
}

// --------------------------------------------------------------------------

export function makeReactNativeDisklet (): Disklet {
  function locate (path: string) {
    return RNFS.DocumentDirectoryPath + '/' + normalizePath(path)
  }

  return {
    delete (path: string): Promise<mixed> {
      return deepDelete(locate(path))
    },

    getData (path: string): Promise<Uint8Array> {
      return RNFS.readFile(locate(path), 'base64').then(data =>
        base64.parse(data)
      )
    },

    getText (path: string): Promise<string> {
      return RNFS.readFile(locate(path), 'utf8')
    },

    list (path: string = ''): Promise<DiskletListing> {
      const file = normalizePath(path)
      const nativePath = locate(path)

      return getType(nativePath).then(type => {
        const out: DiskletListing = {}

        if (type === 'file') {
          out[file] = 'file'
          return out
        }
        if (type === 'folder') {
          return RNFS.readdir(nativePath).then(names =>
            Promise.all(
              names.map(name => getType(nativePath + '/' + name))
            ).then(types => {
              const folder = folderizePath(file)
              for (let i = 0; i < names.length; ++i) {
                if (types[i] !== '') out[folder + names[i]] = types[i]
              }
              return out
            })
          )
        }
        return out
      })
    },

    setData (path: string, data: ArrayLike<number>): Promise<mixed> {
      return deepWriteFile(locate(path), base64.stringify(data), 'base64')
    },

    setText (path: string, text: string): Promise<mixed> {
      return deepWriteFile(locate(path), text, 'utf8')
    }
  }
}
