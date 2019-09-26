// @flow

import { expect } from 'chai'
import { describe, it } from 'mocha'
import rimraf from 'rimraf'
import tmp from 'tmp'

import {
  makeLocalStorageDisklet,
  makeMemoryDisklet,
  makeNodeDisklet
} from '../../src/index.js'
import { tests } from '../common.js'
import { FakeStorage } from '../fake-storage.js'

describe('localStorage disklet', function() {
  for (const name in tests) {
    it(name, () => {
      const disklet = makeLocalStorageDisklet(new FakeStorage())
      return tests[name](disklet)
    })
  }

  it('load existing data', async function() {
    const storage = new FakeStorage({ 'file://my-prefix/a/b.txt': 'Hello' })
    const disklet = makeLocalStorageDisklet(storage, {
      prefix: 'file://my-prefix'
    })

    expect(await disklet.getText('a/b.txt')).equals('Hello')
  })
})

describe('memory disklet', function() {
  for (const name in tests) {
    it(name, () => {
      const disklet = makeMemoryDisklet()
      return tests[name](disklet)
    })
  }

  it('load existing data', async function() {
    const storage = { '/a/b.txt': 'Hello' }
    const disklet = makeMemoryDisklet(storage)

    expect(await disklet.getText('a/b.txt')).equals('Hello')
  })
})

describe('node.js disklet', function() {
  for (const name in tests) {
    it(name, async () => {
      const path = await new Promise((resolve, reject) => {
        tmp.dir({}, (err, path) => (err != null ? reject(err) : resolve(path)))
      })
      const disklet = makeNodeDisklet(path)

      try {
        await tests[name](disklet)
      } finally {
        await new Promise((resolve, reject) =>
          rimraf(path, err => (err != null ? reject(err) : resolve()))
        )
      }
    })
  }
})
