/* global describe, it */
import {
  locateFile,
  locateFolder,
  mapAllFiles,
  mapFiles,
  makeLocalStorageFolder,
  makeMemoryFolder,
  makeNodeFolder,
  makeUnionFolder
} from '../lib/index.js'

import { FakeStorage } from './fake-storage.js'
import { setupFiles, testFolder } from './test-helpers.js'
import assert from 'assert'
import { base16 } from 'rfc4648'
import tmp from 'tmp'

tmp.setGracefulCleanup()

export function makeTempDir () {
  return new Promise((resolve, reject) => {
    tmp.dir({}, (err, path) => (err ? reject(err) : resolve(path)))
  })
}

describe('memory folder', function () {
  it('basic tests', function () {
    return testFolder(makeMemoryFolder())
  })

  it('load existing data', function () {
    const storage = { '/a/b.txt': 'Hello' }

    return makeMemoryFolder(storage)
      .folder('a')
      .file('b.txt')
      .getText()
      .then(text => assert.equal(text, 'Hello'))
  })
})

describe('localStorage folder', function () {
  it('basic tests', function () {
    return testFolder(makeLocalStorageFolder(new FakeStorage()))
  })

  it('load existing data', function () {
    const storage = new FakeStorage({ 'file://my-prefix/a/b.txt': 'Hello' })

    return makeLocalStorageFolder(storage, { prefix: 'file://my-prefix' })
      .folder('a')
      .file('b.txt')
      .getText()
      .then(text => assert.equal(text, 'Hello'))
  })
})

describe('node.js folder', function () {
  it('basic tests', function () {
    return makeTempDir().then(path => testFolder(makeNodeFolder(path)))
  })
})

describe('union folder', function () {
  it('basic tests', function () {
    const master = makeMemoryFolder()
    const fallback = makeMemoryFolder()

    return testFolder(makeUnionFolder(master, fallback))
  })

  it('basic tests with fallback data', function () {
    const master = makeMemoryFolder()
    const fallback = makeMemoryFolder()

    return setupFiles(fallback).then(() =>
      testFolder(makeUnionFolder(master, fallback))
    )
  })
})

describe('helpers', function () {
  it('navigate to file', function () {
    const root = makeMemoryFolder()

    return setupFiles(root)
      .then(() =>
        locateFile(root, 'sub/deep/c.txt')
          .getText()
          .then(text => assert.equal(text, 'text c'))
      )
      .then(() =>
        locateFile(root, '/sub/./foo/../deep//c.txt')
          .getText()
          .then(text => assert.equal(text, 'text c'))
      )
  })

  it('navigate to folder', function () {
    const root = makeMemoryFolder()

    return setupFiles(root)
      .then(() =>
        locateFolder(root, 'sub/deep')
          .listFiles()
          .then(names => assert.deepEqual(names, ['c.txt']))
      )
      .then(() =>
        locateFolder(root, '/sub/./foo/../deep//')
          .listFiles()
          .then(names => assert.deepEqual(names, ['c.txt']))
      )
  })

  it('map files', function () {
    const root = makeMemoryFolder()
    let count = 0

    return setupFiles(root)
      .then(() =>
        mapFiles(root, (file, name, folder) => {
          ++count
          assert.equal(folder, root)
          return /\.txt/.test(name)
            ? file.getText()
            : file.getData().then(data => base16.stringify(data))
        })
      )
      .then(list => {
        assert.equal(count, 2)
        assert.deepEqual(list.sort(), ['010203', 'text a'])
        return null
      })
  })

  it('map all files', function () {
    const root = makeMemoryFolder()
    let count = 0

    return setupFiles(root)
      .then(() =>
        mapAllFiles(root, (file, name, folder) => {
          ++count
          return /\.txt/.test(name)
            ? file.getText()
            : file.getData().then(data => base16.stringify(data))
        })
      )
      .then(list => {
        assert.equal(count, 3)
        assert.deepEqual(list.sort(), ['010203', 'text a', 'text c'])
        return null
      })
  })
})
