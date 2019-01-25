// @flow

import { describe, it } from 'mocha'

import { makeMemoryDisklet, navigateDisklet } from '../../src/index.js'
import { testDisklet } from '../common.js'

describe('navigate disklet', function () {
  it('basic tests', async function () {
    const disklet = navigateDisklet(makeMemoryDisklet(), 'blah')

    await testDisklet(disklet)
  })
})
