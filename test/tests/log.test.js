// @flow

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { logDisklet, makeMemoryDisklet } from '../../src/index.js'
import { testDisklet } from '../common.js'

describe('logged disklet', function () {
  it('basic tests', async function () {
    const log = []
    function callback (path, operation) {
      log.push([operation, path])
    }
    const disklet = logDisklet(makeMemoryDisklet(), { callback })

    await testDisklet(disklet)
    expect(log).deep.equals([
      ['delete', '.'],
      ['set text', 'a.txt'],
      ['set data', 'a.txt.bin'],
      ['set text', './sub//c.txt'],
      ['set text', './sub/deep/ignore/../d.txt'],
      ['delete', 'a.txt'],
      ['delete', 'sub/deep/d.txt'],
      ['delete', 'sub/deep/../'],
      ['delete', '']
    ])
  })

  it('verbose tests', async function () {
    const log = []
    function callback (path, operation) {
      log.push([operation, path])
    }
    const disklet = logDisklet(makeMemoryDisklet(), { callback, verbose: true })

    await testDisklet(disklet)
    expect(log).deep.equals([
      ['delete', '.'],
      ['list', '.'],
      ['set text', 'a.txt'],
      ['set data', 'a.txt.bin'],
      ['set text', './sub//c.txt'],
      ['set text', './sub/deep/ignore/../d.txt'],
      ['get text', './a.txt'],
      ['get data', './a.txt.bin'],
      ['get text', 'sub/c.txt'],
      ['get text', 'sub/deep/d.txt'],
      ['list', '.'],
      ['list', 'sub/'],
      ['list', 'sub/deep/'],
      ['delete', 'a.txt'],
      ['get data', 'a.txt'],
      ['list', '.'],
      ['list', 'sub/'],
      ['list', 'sub/deep/'],
      ['delete', 'sub/deep/d.txt'],
      ['get text', 'sub/deep/d.txt'],
      ['list', '.'],
      ['list', 'sub/'],
      ['delete', 'sub/deep/../'],
      ['get text', 'sub/c.txt'],
      ['list', '.'],
      ['delete', ''],
      ['list', '.']
    ])
  })
})
