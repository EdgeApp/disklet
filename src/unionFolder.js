import { mapFiles, mapFolders } from './helpers.js'

function removeDuplicates (master, fallback) {
  const blacklist = {}
  const out = []
  master.forEach(item => {
    if (/\._x_$/.test(item)) {
      blacklist[item] = true
    } else {
      blacklist[item + '._x_'] = true
      out.push(item)
    }
  })

  fallback.forEach(item => {
    if (!blacklist[item + '._x_']) out.push(item)
  })

  return out
}

/**
 * A file within a unionFolder.
 */
class UnionFile {
  constructor (master, fallback, whiteout) {
    this._master = master
    this._fallback = fallback
    this._whiteout = whiteout
  }

  delete () {
    return Promise.all([
      this._whiteout.setData([]),
      this._master.delete().catch(e => null)
    ])
  }

  getData () {
    return this._master.getData().catch(e =>
      this._whiteout.getData().then(
        data => {
          throw new Error('File has been deleted')
        },
        e => this._fallback.getData()
      )
    )
  }

  getText () {
    return this._master.getText().catch(e =>
      this._whiteout.getData().then(
        data => {
          throw new Error('File has been deleted')
        },
        e => this._fallback.getText()
      )
    )
  }

  setData (data) {
    return this._master.setData(data)
  }

  setText (text) {
    return this._master.setText(text)
  }

  getPath () {
    throw new Error('Cannot call getPath on a Union Folder')
  }
}

/**
 * Reads and writes go to a master folder, but if a read fails,
 * we will also try the fallback folder.
 */
export class UnionFolder {
  constructor (master, fallback) {
    this._master = master
    this._fallback = fallback
  }

  delete () {
    return Promise.all([
      mapFiles(this, file => file.delete()),
      mapFolders(this, folder => folder.delete())
    ]).then(() => {})
  }

  file (name) {
    return new UnionFile(
      this._master.file(name),
      this._fallback.file(name),
      this._master.file(name + '._x_')
    )
  }

  folder (name) {
    return new UnionFolder(
      this._master.folder(name),
      this._fallback.folder(name)
    )
  }

  listFiles () {
    return Promise.all([
      this._master.listFiles(),
      this._fallback.listFiles()
    ]).then(values => removeDuplicates(values[0], values[1]))
  }

  listFolders () {
    return Promise.all([
      this._master.listFolders(),
      this._fallback.listFolders()
    ]).then(values => removeDuplicates(values[0], values[1]))
  }
}

export function makeUnionFolder (master, fallback) {
  return new UnionFolder(master, fallback)
}
