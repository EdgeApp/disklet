function logConsole (path, operation) {
  console.log(`${operation} "${path}"`)
}

function log (path, operation, opts) {
  const f = opts.callback != null ? opts.callback : logConsole

  if (opts.verbose || /set|delete/.test(operation)) {
    f(path, operation)
  }
}

class LoggedFile {
  constructor (file, path, opts) {
    this._file = file
    this._path = path
    this._opts = opts
  }

  delete () {
    log(this._path, 'delete file', this._opts)
    return this._file.delete()
  }

  getData () {
    log(this._path, 'get data', this._opts)
    return this._file.getData()
  }

  getText () {
    log(this._path, 'get text', this._opts)
    return this._file.getText()
  }

  setData (data) {
    log(this._path, 'set data', this._opts)
    return this._file.setData(data)
  }

  setText (text) {
    log(this._path, 'set text', this._opts)
    return this._file.setText(text)
  }

  getPath () {
    log(this._path, 'get path', this._opts)
    return this._file
  }
}

class LoggedFolder {
  constructor (folder, path, opts) {
    this._folder = folder
    this._path = path
    this._opts = opts
  }

  delete () {
    log(this._path, 'delete folder', this._opts)
    return this._folder.delete()
  }

  file (name) {
    return new LoggedFile(
      this._folder.file(name),
      this._path + name,
      this._opts
    )
  }

  folder (name) {
    return new LoggedFolder(
      this._folder.folder(name),
      this._path + name + '/',
      this._opts
    )
  }

  listFiles () {
    log(this._path, 'list files', this._opts)
    return this._folder.listFiles()
  }

  listFolders () {
    log(this._path, 'list folders', this._opts)
    return this._folder.listFolders()
  }
}

export function makeLoggedFolder (folder, opts = {}) {
  return new LoggedFolder(folder, '', opts)
}
