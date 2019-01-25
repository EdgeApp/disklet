// @flow

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { normalizePath } from '../../src/paths.js'

describe('paths', function () {
  it('normalizePath turns paths into folder prefixes', function () {
    expect(normalizePath('', true)).equals('')
    expect(normalizePath('.', true)).equals('')
    expect(normalizePath('./', true)).equals('')
    expect(normalizePath('a', true)).equals('a/')
    expect(normalizePath('a/', true)).equals('a/')
    expect(normalizePath('a//b', true)).equals('a/b/')
    expect(normalizePath('a/./b', true)).equals('a/b/')
    expect(normalizePath('./a/./b', true)).equals('a/b/')
    expect(normalizePath('a/../b', true)).equals('b/')
  })

  it('normalizePath turns paths into absolute locations', function () {
    expect(normalizePath('', false)).equals('')
    expect(normalizePath('.', false)).equals('')
    expect(normalizePath('./', false)).equals('')
    expect(normalizePath('a', false)).equals('/a')
    expect(normalizePath('a/', false)).equals('/a')
    expect(normalizePath('a//b', false)).equals('/a/b')
    expect(normalizePath('a/./b', false)).equals('/a/b')
    expect(normalizePath('./a/./b', false)).equals('/a/b')
    expect(normalizePath('a/../b', false)).equals('/b')
  })

  it('normalizePath rejects absolute paths', function () {
    expect(() => normalizePath('/a')).throws()
  })
})
