/* global describe, it */
import { makeMemoryFolder } from '../lib/index.js'
import { testFolder } from './test-helpers.js'
import assert from 'assert'

describe('memory folder', function () {
  it('basic tests', function () {
    return testFolder(makeMemoryFolder())
  })

  it('load existing data', function () {
    const storage = { '/a/b.txt': 'Hello' }

    return makeMemoryFolder(storage)
      .folder('a')
      .file('b.txt')
      .getText()
      .then(text => assert.equal(text, 'Hello'))
  })
})
