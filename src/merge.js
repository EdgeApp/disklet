// @flow

import { type ArrayLike, type Disklet, type DiskletListing } from './index.js'

export function mergeDisklets(master: Disklet, fallback: Disklet): Disklet {
  return {
    delete(path: string): Promise<mixed> {
      return Promise.all([master.delete(path), fallback.delete(path)])
    },

    getData(path: string): Promise<Uint8Array> {
      return master.getData(path).catch(e => fallback.getData(path))
    },

    getText(path: string): Promise<string> {
      return master.getText(path).catch(e => fallback.getText(path))
    },

    list(path?: string): Promise<DiskletListing> {
      return Promise.all([master.list(path), fallback.list(path)]).then(
        ([masterList, fallbackList]) => Object.assign(fallbackList, masterList)
      )
    },

    setData(path: string, data: ArrayLike<number>): Promise<mixed> {
      return master.setData(path, data)
    },

    setText(path: string, text: string): Promise<mixed> {
      return master.setText(path, text)
    }
  }
}
