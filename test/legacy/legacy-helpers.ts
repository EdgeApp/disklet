import { assert, expect } from 'chai'

import { DiskletFolder } from '../../src/legacy/legacy'
import { sortStrings } from '../common'
import { expectRejection } from '../expect-rejection'

function checkData<T>(a: ArrayLike<T>, b: ArrayLike<T>): void {
  expect(a.length).equals(b.length)
  for (let i = 0; i < a.length; ++i) {
    expect(a[i]).equals(b[i])
  }
}

export async function setupFiles(root: DiskletFolder): Promise<void> {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  await root.file('a.txt').setText('text a')
  await root.file('b.bin').setData([1, 2, 3])
  await deep.file('c.txt').setText('text c')
}

async function checkFiles(
  root: DiskletFolder,
  expected: object
): Promise<void> {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  await Promise.all([
    root.listFiles().then(array => sortStrings(array)),
    sub.listFiles().then(array => sortStrings(array)),
    deep.listFiles().then(array => sortStrings(array))
  ]).then(values => {
    const [root, sub, deep] = values
    return assert.deepEqual({ root, sub, deep }, expected)
  })
}

async function checkFolders(
  root: DiskletFolder,
  expected: object
): Promise<void> {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  await Promise.all([
    root.listFolders().then(array => sortStrings(array)),
    sub.listFolders().then(array => sortStrings(array)),
    deep.listFolders().then(array => sortStrings(array))
  ]).then(values => {
    const [root, sub, deep] = values
    return assert.deepEqual({ root, sub, deep }, expected)
  })
}

export async function testFolder(root: DiskletFolder): Promise<void> {
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
