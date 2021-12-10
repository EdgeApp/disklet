import { expect } from 'chai'
import { describe, it } from 'mocha'

import { makeMemoryDisklet } from '../../src/backends/memory'
import { deepList } from '../../src/helpers/listing'
import { navigateDisklet } from '../../src/helpers/navigate'
import { tests } from '../common'

describe('navigate disklet', function () {
  for (const name in tests) {
    it(name, async function () {
      const disklet = navigateDisklet(makeMemoryDisklet(), 'blah')
      await tests[name](disklet)
    })
  }

  it('Correctly operates in subfolder', async function () {
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
