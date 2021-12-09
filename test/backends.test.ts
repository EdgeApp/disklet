import { expect } from 'chai'
import { describe, it } from 'mocha'
import rimraf from 'rimraf'
import tmp from 'tmp'

import { makeLocalStorageDisklet } from '../src/backends/local-storage'
import { makeMemoryDisklet } from '../src/backends/memory'
import { makeNodeDisklet } from '../src/backends/node'
import { tests } from './common'
import { FakeStorage } from './fake-storage'

describe('localStorage disklet', function () {
  for (const name in tests) {
    it(name, async function () {
      const disklet = makeLocalStorageDisklet(new FakeStorage())
      await tests[name](disklet)
    })
  }

  it('load existing data', async function () {
    const storage = new FakeStorage({ 'file://my-prefix/a/b.txt': 'Hello' })
    const disklet = makeLocalStorageDisklet(storage, {
      prefix: 'file://my-prefix'
    })

    expect(await disklet.getText('a/b.txt')).equals('Hello')
  })
})

describe('memory disklet', function () {
  for (const name in tests) {
    it(name, async function () {
      const disklet = makeMemoryDisklet()
      await tests[name](disklet)
    })
  }

  it('load existing data', async function () {
    const storage = { '/a/b.txt': 'Hello' }
    const disklet = makeMemoryDisklet(storage)

    expect(await disklet.getText('a/b.txt')).equals('Hello')
  })
})

describe('node.js disklet', function () {
  for (const name in tests) {
    it(name, async function () {
      const path: string = await new Promise((resolve, reject) => {
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
