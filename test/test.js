/* global describe, it */
import {
  locateFile,
  locateFolder,
  mapAllFiles,
  mapFiles,
  makeMemoryFolder
} from '../lib/index.js'
import { setupFiles, testFolder } from './test-helpers.js'
import assert from 'assert'
import { base16 } from 'rfc4648'

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
