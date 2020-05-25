import { expect } from 'chai'
import { describe, it } from 'mocha'

import { folderizePath, normalizePath } from '../../src/helpers/paths'

describe('paths', function () {
  it('normalizePath turns paths into simple locations', function () {
    expect(normalizePath('')).equals('')
    expect(normalizePath('.')).equals('')
    expect(normalizePath('./')).equals('')
    expect(normalizePath('a')).equals('a')
    expect(normalizePath('a/')).equals('a')
    expect(normalizePath('a//b')).equals('a/b')
    expect(normalizePath('a/./b')).equals('a/b')
    expect(normalizePath('./a/./b')).equals('a/b')
    expect(normalizePath('a/../b')).equals('b')
  })

  it('normalizePath rejects absolute paths', function () {
    expect(() => normalizePath('/a')).throws()
  })

  it('folderizePath adds trailing slash', function () {
    expect(folderizePath('')).equals('')
    expect(folderizePath('a')).equals('a/')
  })
})
