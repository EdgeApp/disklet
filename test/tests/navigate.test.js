// @flow

import { expect } from 'chai'
import { describe, it } from 'mocha'

import {
  deepList,
  makeMemoryDisklet,
  navigateDisklet
} from '../../src/index.js'
import { tests } from '../common.js'

describe('navigate disklet', function() {
  for (const name in tests) {
    it(name, () => {
      const disklet = navigateDisklet(makeMemoryDisklet(), 'blah')
      return tests[name](disklet)
    })
  }

  it('Correctly operates in subfolder', async function() {
    const outer = makeMemoryDisklet()
    const inner = navigateDisklet(outer, 'test')
    await inner.setText('subfolder/file.txt', 'contents')

    expect(await deepList(outer)).deep.equals({
      test: 'folder',
      'test/subfolder': 'folder',
      'test/subfolder/file.txt': 'file'
    })
  })
})
