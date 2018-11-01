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

export function setupFiles (root) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  return Promise.resolve()
    .then(() => root.file('a.txt').setText('text a'))
    .then(() => root.file('b.bin').setData([1, 2, 3]))
    .then(() => deep.file('c.txt').setText('text c'))
}

export function setupFilesNoData (root) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')

  return Promise.resolve()
    .then(() => root.file('a.txt').setText('text a'))
    .then(() => deep.file('c.txt').setText('text c'))
}

export function checkFiles (root, expected) {
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

export function checkFolders (root, expected) {
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

export function testFolder (root) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')
  const empty = { root: [], sub: [], deep: [] }

  return Promise.resolve()
    .then(() => root.delete()) // Should be harmless
    .then(() => checkFiles(root, empty))
    .then(() => setupFiles(root)) // Add  a bunch of files
    .then(() =>
      Promise.all([
        root.file('a.txt').getText(),
        root.file('b.bin').getData(),
        deep.file('c.txt').getText()
      ]).then(values => {
        const [aText, bData, cText] = values
        assert.equal(aText, 'text a')
        checkData(bData, [1, 2, 3])
        assert.equal(cText, 'text c')
        return null
      })
    )
    .then(() =>
      checkFiles(root, { root: ['a.txt', 'b.bin'], sub: [], deep: ['c.txt'] })
    )
    .then(() => checkFolders(root, { root: ['sub'], sub: ['deep'], deep: [] }))
    .then(() => deep.file('c.txt').delete()) // Delete a deeply-nested file
    .then(() =>
      deep
        .file('c.txt')
        .getData()
        .then(fail, pass)
    )
    .then(() =>
      checkFiles(root, { root: ['a.txt', 'b.bin'], sub: [], deep: [] })
    )
    .then(() => root.file('b.bin').delete()) // Delete a shallow file
    .then(() =>
      root
        .file('b.bin')
        .getData()
        .then(fail, pass)
    )
    .then(() => checkFiles(root, { root: ['a.txt'], sub: [], deep: [] }))
    .then(() => root.delete()) // Delete everything
    .then(() => checkFiles(root, empty))
}

export function testFolderNoData (root) {
  const sub = root.folder('sub')
  const deep = sub.folder('deep')
  const empty = { root: [], sub: [], deep: [] }

  return Promise.resolve()
    .then(() => root.delete()) // Should be harmless
    .then(() => checkFiles(root, empty))
    .then(() => setupFilesNoData(root)) // Add  a bunch of files
    .then(() =>
      Promise.all([
        root.file('a.txt').getText(),
        deep.file('c.txt').getText()
      ]).then(values => {
        const [aText, cText] = values
        assert.equal(aText, 'text a')
        assert.equal(cText, 'text c')
        return null
      })
    )
    .then(() => checkFiles(root, { root: ['a.txt'], sub: [], deep: ['c.txt'] }))
    .then(() => checkFolders(root, { root: ['sub'], sub: ['deep'], deep: [] }))
    .then(() => deep.file('c.txt').delete()) // Delete a deeply-nested file
    .then(() =>
      deep
        .file('c.txt')
        .getData()
        .then(fail, pass)
    )
    .then(() => checkFiles(root, { root: ['a.txt'], sub: [], deep: [] }))
    .then(() => checkFiles(root, { root: ['a.txt'], sub: [], deep: [] }))
    .then(() => root.delete()) // Delete everything
    .then(() => checkFiles(root, empty))
}
