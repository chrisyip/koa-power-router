/* global describe: false, it: false */

var _ = require('../lib/lodash-x.js')

var assert = require('assert')

describe('lodash.isGenerator()', function () {
  it('should true for generator function', function () {
    assert.equal(_.isGenerator(function* () {
      yield 'foo'
    }), true)
    assert.equal(_.isGenerator(function () {}), false)
    assert.equal(_.isGenerator(true), false)
    assert.equal(_.isGenerator(), false)
  })
})

describe('lodash.slice()', function () {
  it('should slice array', function () {
    assert.deepEqual(_.slice([1, 2, 3], 1), [2, 3])
    assert.deepEqual(_.slice([1, 2, 3], Number(1)), [2, 3])
    assert.deepEqual(_.slice([1, 2, 3], true), [2, 3])
    assert.deepEqual(_.slice([1, 2, 3], 'b'), [1, 2, 3])
    assert.deepEqual(_.slice([1, 2, 3], 1, 1), [])
    assert.deepEqual(_.slice([1, 2, 3], 1, 2), [2])
    assert.deepEqual(_.slice([1, 2, 3], 1, -1), [2])
    assert.deepEqual(_.slice([1, 2, 3], 1, -2), [])
    assert.deepEqual(_.slice([1, 2, 3], -4), [1, 2, 3])
    assert.deepEqual(_.slice([1, 2, 3], -2), [2, 3])
    assert.deepEqual(_.slice([1, 2, 3], -1), [3])
    assert.deepEqual(_.slice([1, 2, 3], 3), [])
    assert.deepEqual(_.slice([1, 2, 3], 0, -6), [])
    assert.deepEqual(_.slice(1, 0, 1), [])
  })
})
