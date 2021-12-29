import { Disklet } from '../types'
import { navigateDisklet } from './navigate'

export interface DiskletDump {
  [path: string]: DiskletDump | string // File contents.
}

export function dumpData(disklet: Disklet): Promise<DiskletDump> {
  const json: DiskletDump = {}
  return disklet.list().then(listing => {
    return Promise.all(
      Object.keys(listing).map(path => {
        const type = listing[path]
        return type === 'folder'
          ? dumpData(navigateDisklet(disklet, path)).then(folderData => {
              json[path] = folderData
            })
          : disklet.getText(path).then(data => {
              json[path] = JSON.parse(data)
            })
      })
    ).then(() => json)
  })
}
