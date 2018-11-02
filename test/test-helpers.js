import { assert, expect } from 'chai'

function fail () {
  assert(false)
}

function pass () {}

function checkData (a, b) {
  expect(a.length).equals(b.length)
  for (let i = 0; i < a.length; ++i) {
    expect(a[i]).equals(b[i])
  }
}

export async function setupFiles (root) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  await root.file('a.txt').setText('text a')
  await root.file('b.bin').setData([1, 2, 3])
  await deep.file('c.txt').setText('text c')
}

export async function setupFilesNoData (root) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  await root.file('a.txt').setText('text a')
  await deep.file('c.txt').setText('text c')
}

function checkFiles (root, expected) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  return Promise.all([
    root.listFiles(),
    sub.listFiles(),
    deep.listFiles()
  ]).then(values => {
    const [root, sub, deep] = values
    return assert.deepEqual({ root, sub, deep }, expected)
  })
}

function checkFolders (root, expected) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  return Promise.all([
    root.listFolders(),
    sub.listFolders(),
    deep.listFolders()
  ]).then(values => {
    const [root, sub, deep] = values
    return assert.deepEqual({ root, sub, deep }, expected)
  })
}

export async function testFolder (root) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')
  const empty = { root: [], sub: [], deep: [] }

  await root.delete() // Should be harmless
  await checkFiles(root, empty)
  await setupFiles(root) // Add  a bunch of files
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
  await deep.file('c.txt').delete() // Delete a deeply-nested file
  await deep
    .file('c.txt')
    .getData()
    .then(fail, pass)
  await checkFiles(root, { root: ['a.txt', 'b.bin'], sub: [], deep: [] })
  await root.file('b.bin').delete() // Delete a shallow file
  await root
    .file('b.bin')
    .getData()
    .then(fail, pass)
  await checkFiles(root, { root: ['a.txt'], sub: [], deep: [] })
  await root.delete() // Delete everything
  await checkFiles(root, empty)
}

export async function testFolderNoData (root) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')
  const empty = { root: [], sub: [], deep: [] }

  await root.delete() // Should be harmless
  await checkFiles(root, empty)
  await setupFilesNoData(root) // Add  a bunch of files
  await Promise.all([
    root.file('a.txt').getText(),
    deep.file('c.txt').getText()
  ]).then(values => {
    const [aText, cText] = values
    assert.equal(aText, 'text a')
    assert.equal(cText, 'text c')
    return null
  })
  await checkFiles(root, { root: ['a.txt'], sub: [], deep: ['c.txt'] })
  await checkFolders(root, { root: ['sub'], sub: ['deep'], deep: [] })
  await deep.file('c.txt').delete() // Delete a deeply-nested file
  await deep
    .file('c.txt')
    .getData()
    .then(fail, pass)
  await checkFiles(root, { root: ['a.txt'], sub: [], deep: [] })
  await checkFiles(root, { root: ['a.txt'], sub: [], deep: [] })
  await root.delete() // Delete everything
  await checkFiles(root, empty)
}
