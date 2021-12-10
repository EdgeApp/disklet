import { expect } from 'chai'
import { describe, it } from 'mocha'

import { makeMemoryDisklet } from '../../src/backends/memory'
import { logDisklet } from '../../src/helpers/log'
import { testDisklet } from '../common'

describe('logged disklet', function () {
  it('basic tests', async function () {
    const log: Array<[string, string]> = []
    function callback(path: string, operation: string): void {
      log.push([operation, path])
    }
    const disklet = logDisklet(makeMemoryDisklet(), { callback })

    await testDisklet(disklet)
    expect(log).deep.equals([
      ['delete', ''],
      ['set text', 'a.txt'],
      ['set data', 'a.txt.bin'],
      ['set text', 'sub/c.txt'],
      ['set text', 'sub/deep/d.txt'],
      ['delete', 'a.txt'],
      ['delete', 'sub/deep/d.txt'],
      ['delete', 'sub'],
      ['delete', '']
    ])
  })

  it('verbose tests', async function () {
    const log: Array<[string, string]> = []
    function callback(path: string, operation: string): void {
      log.push([operation, path])
    }
    const disklet = logDisklet(makeMemoryDisklet(), { callback, verbose: true })

    await testDisklet(disklet)
    expect(log).deep.equals([
      ['delete', ''],
      ['list', ''],
      ['set text', 'a.txt'],
      ['set data', 'a.txt.bin'],
      ['set text', 'sub/c.txt'],
      ['set text', 'sub/deep/d.txt'],
      ['get text', 'a.txt'],
      ['get data', 'a.txt.bin'],
      ['get text', 'sub/c.txt'],
      ['get text', 'sub/deep/d.txt'],
      ['list', 'a.txt'],
      ['list', 'x.txt'],
      ['list', ''],
      ['list', 'sub'],
      ['list', 'sub/deep'],
      ['delete', 'a.txt'],
      ['get data', 'a.txt'],
      ['list', ''],
      ['list', 'sub'],
      ['list', 'sub/deep'],
      ['delete', 'sub/deep/d.txt'],
      ['get text', 'sub/deep/d.txt'],
      ['list', ''],
      ['list', 'sub'],
      ['delete', 'sub'],
      ['get text', 'sub/c.txt'],
      ['list', ''],
      ['delete', ''],
      ['list', '']
    ])
  })
})
