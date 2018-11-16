// @flow

import { type ArrayLike, type Disklet } from '../index.js'
import { type DiskletFile, type DiskletFolder } from './legacy.js'

class File {
  _disklet: Disklet
  _path: string

  constructor (disklet: Disklet, path: string) {
    this._disklet = disklet
    this._path = path
  }

  delete (): Promise<mixed> {
    return this._disklet.delete(this._path)
  }

  getData (): Promise<Uint8Array> {
    return this._disklet.getData(this._path)
  }

  getText (): Promise<string> {
    return this._disklet.getText(this._path)
  }

  setData (data: ArrayLike<number>): Promise<mixed> {
    return this._disklet.setData(this._path, data)
  }

  setText (text: string): Promise<mixed> {
    return this._disklet.setText(this._path, text)
  }
}

class Folder {
  _disklet: Disklet
  _path: string

  constructor (disklet: Disklet, path: string) {
    this._disklet = disklet
    this._path = path
  }

  delete (): Promise<mixed> {
    return this._disklet.delete(this._path)
  }

  file (path: string): DiskletFile {
    return new File(this._disklet, this._path + '/' + path)
  }

  folder (path: string): DiskletFolder {
    return new Folder(this._disklet, this._path + '/' + path)
  }

  listFiles (): Promise<Array<string>> {
    return this._disklet.list(this._path).then(list =>
      Object.keys(list)
        .filter(path => list[path] === 'file')
        .map(path => path.replace(/^.*\//, ''))
    )
  }

  listFolders (): Promise<Array<string>> {
    return this._disklet.list(this._path).then(list =>
      Object.keys(list)
        .filter(path => list[path] === 'folder')
        .map(path => path.replace(/^.*\//, ''))
    )
  }
}

export function downgradeDisklet (disklet: Disklet): DiskletFolder {
  return new Folder(disklet, '.')
}
