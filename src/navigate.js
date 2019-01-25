// @flow

import { type ArrayLike, type Disklet, type DiskletListing } from './index.js'
import { normalizePath } from './paths.js'

export function navigateDisklet (disklet: Disklet, path: string): Disklet {
  const prefix = normalizePath(path, true)

  return {
    delete (path: string): Promise<mixed> {
      return disklet.delete(prefix + path)
    },

    getData (path: string): Promise<Uint8Array> {
      return disklet.getData(prefix + path)
    },

    getText (path: string): Promise<string> {
      return disklet.getText(prefix + path)
    },

    list (path: string = '.'): Promise<DiskletListing> {
      return disklet.list(prefix + path).then(listing => {
        const out: DiskletListing = {}
        for (const path in listing) {
          out[path.replace(prefix, '')] = listing[path]
        }
        return out
      })
    },

    setData (path: string, data: ArrayLike<number>): Promise<mixed> {
      return disklet.setData(prefix + path, data)
    },

    setText (path: string, text: string): Promise<mixed> {
      return disklet.setText(prefix + path, text)
    }
  }
}
