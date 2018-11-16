// @flow

import { expect } from 'chai'

import { type Disklet, deepList } from '../src/index.js'
import { expectRejection } from './expect-rejection.js'

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
