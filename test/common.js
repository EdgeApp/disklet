// @flow

import { expect } from 'chai'

import { type Disklet, deepList } from '../src/index.js'
import { expectRejection } from './expect-rejection.js'

export type DiskletTests = {
  [name: string]: (disklet: Disklet) => Promise<mixed>
}

export async function createFiles (disklet: Disklet) {
  await disklet.setText('a.txt', 'text a')
  await disklet.setData('a.txt.bin', [1, 2, 3])
  await disklet.setText('./sub//c.txt', 'text c')
  await disklet.setText('./sub/deep/ignore/../d.txt', 'text d')
}

export async function testDisklet (disklet: Disklet) {
  // Should be harmless:
  await disklet.delete('.')
  expect(await deepList(disklet)).deep.equals({})

  // Add  a bunch of files:
  await createFiles(disklet)
  const [aText, bData, cText, dText] = await Promise.all([
    disklet.getText('./a.txt'),
    disklet.getData('./a.txt.bin'),
    disklet.getText('sub/c.txt'),
    disklet.getText('sub/deep/d.txt')
  ])
  expect(aText).equals('text a')
  expect(Array.from(bData)).deep.equals([1, 2, 3])
  expect(cText).equals('text c')
  expect(dText).equals('text d')

  // Query those files:
  expect(await disklet.list('./a.txt')).deep.equals({ 'a.txt': 'file' })
  expect(await disklet.list('./x.txt')).deep.equals({})
  expect(await deepList(disklet)).deep.equals({
    'a.txt.bin': 'file',
    'a.txt': 'file',
    'sub/c.txt': 'file',
    'sub/deep': 'folder',
    'sub/deep/d.txt': 'file',
    sub: 'folder'
  })

  // Delete a shallow file:
  await disklet.delete('a.txt')
  await expectRejection(disklet.getData('a.txt'))
  expect(await deepList(disklet)).deep.equals({
    'a.txt.bin': 'file',
    'sub/c.txt': 'file',
    'sub/deep': 'folder',
    'sub/deep/d.txt': 'file',
    sub: 'folder'
  })

  // Delete a deeply-nested file:
  await disklet.delete('sub/deep/d.txt')
  await expectRejection(disklet.getText('sub/deep/d.txt'))
  expect(await deepList(disklet)).to.include({
    'a.txt.bin': 'file',
    'sub/c.txt': 'file',
    // 'sub/deep' may or may not be present.
    sub: 'folder'
  })

  // Delete a folder:
  await disklet.delete('sub/deep/../')
  await expectRejection(disklet.getText('sub/c.txt'))
  expect(await deepList(disklet)).deep.equals({ 'a.txt.bin': 'file' })

  // Delete everything:
  await disklet.delete('')
  expect(await deepList(disklet)).deep.equals({})
}

export const tests: DiskletTests = {
  'Round-trips data': async disklet => {
    const data = [0, 127, 128, 255, Date.now() % 256]
    await disklet.setData('subfolder/file.bin', data)

    expect(Array.from(await disklet.getData('subfolder/file.bin'))).deep.equals(
      data
    )
  },

  'Round-trips text': async disklet => {
    const text = new Date().toISOString()
    await disklet.setText('subfolder/file.txt', text)

    expect(await disklet.getText('subfolder/file.txt')).equals(text)
  },

  'Cannot open missing files': async disklet => {
    await expectRejection(disklet.getData('file.bin'))
    await expectRejection(disklet.getText('file.txt'))
  },

  'Lists missing location': async disklet => {
    expect(await disklet.list('missing.txt')).deep.equals({})
  },

  'Lists file': async disklet => {
    await disklet.setText('file.txt', 'contents')

    expect(await disklet.list('./file.txt')).deep.equals({
      'file.txt': 'file'
    })
  },

  'Lists folder': async disklet => {
    await disklet.setText('file.txt', 'contents')
    await disklet.setText('subfolder/subfile.txt', 'contents')

    expect(await disklet.list('.')).deep.equals({
      'file.txt': 'file',
      subfolder: 'folder'
    })
  },

  'Lists subfolder': async disklet => {
    await disklet.setText('test/file.txt', 'contents')
    await disklet.setText('test/subfolder/file.txt', 'contents')

    expect(await disklet.list('./test/')).deep.equals({
      'test/file.txt': 'file',
      'test/subfolder': 'folder'
    })
  },

  'Deletes missing location': async disklet => {
    await disklet.delete('file.txt')
    expect(await disklet.list()).deep.equals({})
  },

  'Deletes file': async disklet => {
    await disklet.setText('file.txt', 'contents')
    await disklet.setText('test/keep.txt', 'contents')
    await disklet.setText('test/file.txt', 'contents')

    await disklet.delete('test/file.txt')
    expect(await deepList(disklet)).deep.equals({
      'file.txt': 'file',
      'test/keep.txt': 'file',
      test: 'folder'
    })
    await expectRejection(disklet.getText('test/file.txt'))

    await disklet.delete('./file.txt')
    expect(await deepList(disklet)).deep.equals({
      'test/keep.txt': 'file',
      test: 'folder'
    })
  },

  'Deletes folder': async disklet => {
    await disklet.setText('test/keep.txt', 'contents')
    await disklet.setText('test/subfolder/file.txt', 'contents')

    await disklet.delete('test/subfolder')
    expect(await disklet.list('test')).deep.equals({
      'test/keep.txt': 'file'
    })
  },

  'Deletes top-level location': async disklet => {
    await disklet.setText('test/file.txt', 'contents')
    await disklet.setText('test/subfolder/file.txt', 'contents')

    await disklet.delete('./')
    expect(await disklet.list()).deep.equals({})
  },

  'Handles original tests': testDisklet
}
