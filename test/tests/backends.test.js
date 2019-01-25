// @flow

import { expect } from 'chai'
import { describe, it } from 'mocha'
import tmp from 'tmp'

import {
  makeLocalStorageDisklet,
  makeMemoryDisklet,
  makeNodeDisklet
} from '../../src/index.js'
import { testDisklet } from '../common.js'
import { FakeStorage } from '../fake-storage.js'

tmp.setGracefulCleanup()

describe('localStorage disklet', function () {
  it('basic tests', async function () {
    const disklet = makeLocalStorageDisklet(new FakeStorage())

    await testDisklet(disklet)
  })

  it('load existing data', async function () {
    const storage = new FakeStorage({ 'file://my-prefix/a/b.txt': 'Hello' })
    const disklet = makeLocalStorageDisklet(storage, {
      prefix: 'file://my-prefix'
    })

    expect(await disklet.getText('a/b.txt')).equals('Hello')
  })
})

describe('memory disklet', function () {
  it('basic tests', async function () {
    const disklet = makeMemoryDisklet()

    await testDisklet(disklet)
  })

  it('load existing data', async function () {
    const storage = { '/a/b.txt': 'Hello' }
    const disklet = makeMemoryDisklet(storage)

    expect(await disklet.getText('a/b.txt')).equals('Hello')
  })
})

describe('node.js disklet', function () {
  it('basic tests', async function () {
    const path = await new Promise((resolve, reject) => {
      tmp.dir({}, (err, path) => (err != null ? reject(err) : resolve(path)))
    })
    const disklet = makeNodeDisklet(path)

    await testDisklet(disklet)
  })
})
