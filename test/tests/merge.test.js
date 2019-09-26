// @flow

import { describe, it } from 'mocha'

import { makeMemoryDisklet, mergeDisklets } from '../../src/index.js'
import { createFiles, testDisklet } from '../common.js'

describe('merge disklets', function() {
  it('basic tests', async function() {
    const master = makeMemoryDisklet()
    const fallback = makeMemoryDisklet()
    const disklet = mergeDisklets(master, fallback)

    await testDisklet(disklet)
  })

  it('basic tests with fallback data', async function() {
    const master = makeMemoryDisklet()
    const fallback = makeMemoryDisklet()
    await createFiles(fallback)
    const disklet = mergeDisklets(master, fallback)

    await testDisklet(disklet)
  })
})
