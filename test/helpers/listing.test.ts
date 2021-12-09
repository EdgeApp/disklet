import { expect } from 'chai'
import { describe, it } from 'mocha'

import { makeMemoryDisklet } from '../../src/backends/memory'
import { deepList, justFiles, justFolders } from '../../src/helpers/listing'

describe('listing helpers', function () {
  it('deepList handles nested folders', async function () {
    const disklet = makeMemoryDisklet()
    await disklet.setText('a/b/c/file.txt', 'hello')

    expect(await deepList(disklet)).deep.equals({
      a: 'folder',
      'a/b': 'folder',
      'a/b/c': 'folder',
      'a/b/c/file.txt': 'file'
    })
  })

  it('justFiles returns a file array', async function () {
    const disklet = makeMemoryDisklet()
    await disklet.setText('a/b/c/file.txt', 'hello')

    expect(await deepList(disklet).then(justFiles)).deep.equals([
      'a/b/c/file.txt'
    ])
  })

  it('justFolders returns a folder array', async function () {
    const disklet = makeMemoryDisklet()
    await disklet.setText('a/b/c/file.txt', 'hello')

    expect(await deepList(disklet).then(justFolders)).deep.equals([
      'a',
      'a/b',
      'a/b/c'
    ])
  })
})
