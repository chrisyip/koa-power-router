/* global describe: false, it: false */

var assert = require('assert')

var binder = require('../lib/status-handler-binder.js')

describe('status handler binder', function () {
  it('should bind handler', function () {
    var obj = {}
    var func = function () {}

    binder(obj, 404, func)

    assert.equal(obj.on404, func)

    func = function* () { yield 'foo' }

    binder(obj, 404, func)

    assert.equal(obj.on404, func)

    try {
      binder(obj, true, func)
    } catch (ex) {
      assert.equal(ex.message, 'Status must be a HTTP status code')
    }

    try {
      binder(obj, 404, true)
    } catch (ex) {
      assert.equal(ex.message, 'Action must be a function or generator')
    }
  })
})
