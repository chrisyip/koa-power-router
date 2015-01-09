/* global describe: false, it: false */

var assert = require('assert')

var runFilters = require('../lib/run-filters.js')

describe('runFilters', function () {
  it('should run', function (done) {
    runFilters([function () {}, function* () { yield 'foo' }]).then(function (res) {
      assert.equal(res, true)
      done()
    })
  })

  it('should return false when filter returns any values except undefined and null', function (done) {
    runFilters([function () {
      return true
    }]).then(function (res) {
      assert.equal(res, false)
      done()
    })
  })

  it('should reject when error occurred', function (done) {
    runFilters([function* () {
      yield 'foo'
      throw Error('filter error')
    }]).catch(function (error) {
      assert.equal(error.message, 'filter error')
      done()
    })
  })
})
