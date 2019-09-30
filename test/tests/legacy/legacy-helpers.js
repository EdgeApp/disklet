// @flow

import { assert, expect } from 'chai'

import { type DiskletFolder } from '../../../src/index.js'
import { expectRejection } from '../../expect-rejection.js'

function checkData(a, b) {
  expect(a.length).equals(b.length)
  for (let i = 0; i < a.length; ++i) {
    expect(a[i]).equals(b[i])
  }
}

export async function setupFiles(root: DiskletFolder) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  await root.file('a.txt').setText('text a')
  await root.file('b.bin').setData([1, 2, 3])
  await deep.file('c.txt').setText('text c')
}

function checkFiles(root, expected) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  return Promise.all([
    root.listFiles().then(array => array.sort()),
    sub.listFiles().then(array => array.sort()),
    deep.listFiles().then(array => array.sort())
  ]).then(values => {
    const [root, sub, deep] = values
    return assert.deepEqual({ root, sub, deep }, expected)
  })
}

function checkFolders(root, expected) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  return Promise.all([
    root.listFolders().then(array => array.sort()),
    sub.listFolders().then(array => array.sort()),
    deep.listFolders().then(array => array.sort())
  ]).then(values => {
    const [root, sub, deep] = values
    return assert.deepEqual({ root, sub, deep }, expected)
  })
}

export async function testFolder(root: DiskletFolder) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')
  const empty = { root: [], sub: [], deep: [] }

  // Should be harmless:
  await root.delete()
  await checkFiles(root, empty)

  // Add  a bunch of files:
  await setupFiles(root)
  await Promise.all([
    root.file('a.txt').getText(),
    root.file('b.bin').getData(),
    deep.file('c.txt').getText()
  ]).then(values => {
    const [aText, bData, cText] = values
    assert.equal(aText, 'text a')
    checkData(bData, [1, 2, 3])
    assert.equal(cText, 'text c')
  })
  await checkFiles(root, { root: ['a.txt', 'b.bin'], sub: [], deep: ['c.txt'] })
  await checkFolders(root, { root: ['sub'], sub: ['deep'], deep: [] })

  // Delete a deeply-nested file:
  await deep.file('c.txt').delete()
  await expectRejection(deep.file('c.txt').getData())
  await checkFiles(root, { root: ['a.txt', 'b.bin'], sub: [], deep: [] })

  // Delete a shallow file:
  await root.file('b.bin').delete()
  await expectRejection(root.file('b.bin').getData())
  await checkFiles(root, { root: ['a.txt'], sub: [], deep: [] })

  // Delete everything:
  await root.delete()
  await checkFiles(root, empty)
}
