/* global describe: false, it: false */

var assert = require('assert')

var helpers = require('./env/helpers.js')

var request = helpers.request

var getURL = helpers.getURL

var Controller = require('../lib/controller/index.js')

describe('controller', function () {
  it('should support normal function', function (done) {
    request.get(getURL('/controller/normal-func'), function (error, response, body) {
      assert.equal(body, 'done')
      assert.equal(response.statusCode, 200)
      done()
    })
  })

  it('should support generator', function (done) {
    request.get(getURL('/controller/generator'), function (error, response, body) {
      assert.equal(body, 'done')
      assert.equal(response.statusCode, 200)
      done()
    })
  })

  it('should support yielding nested generators', function (done) {
    request.get(getURL('/nested-generators'), function (error, response, body) {
      assert.equal(response.statusCode, 200)
      assert.equal(body, 'Nested Generators')
      done()
    })
  })

  it('should support yielding nested promises', function (done) {
    request.get(getURL('/nested-promises'), function (error, response, body) {
      assert.equal(response.statusCode, 200)
      assert.equal(body, 'Nested Promises')
      done()
    })
  })

  it('should support yielding nested generators and promises', function (done) {
    request.get(getURL('/nested-generators-and-promises'), function (error, response, body) {
      assert.equal(response.statusCode, 200)
      assert.equal(body, 'works')
      done()
    })
  })

  it('should support yielding primitive data types', function (done) {
    request.get(getURL('/primitive'), function (error, response, body) {
      assert.equal(response.statusCode, 200)
      assert.equal(body, 'Hello World')
      done()
    })
  })

  it('should emit onSTATUS', function (done) {
    request.get(getURL('/controller/on'), function (error, response, body) {
      assert.equal(body, 'Nothing here')
      assert.equal(response.statusCode, 404)
      done()
    })
  })
})

describe('controller.isController()', function () {
  it('should return true for Controller type', function () {
    var ctrl = new Controller()

    assert.equal(Controller.isController(ctrl), true)
    assert.equal(Controller.isController(true), false)
  })
})

describe('controller.addAction()', function () {
  it('should add action', function (done) {
    request.get(getURL('/ctrl/addAction'), function (err, response, body) {
      assert.equal(response.statusCode, 200)
      assert.equal(body, 'works')
      done()
    })
  })

  it('should throw exception when using "addAction" as action name', function () {
    var ctrl = new Controller()

    try {
      ctrl.addAction('addAction', function () {})
    } catch (ex) {
      assert.equal(ex.message, '"addAction" is a preserved keyword!')
    }
  })

  it('should throw exception when setting non-function or non-generator function', function () {
    var ctrl = new Controller()

    try {
      ctrl.addAction('demo', true)
    } catch (ex) {
      assert.equal(ex.message, 'Action must be a function or generator.')
    }
  })
})

describe('controller.on()', function () {
  it('should run status handler for specified status', function (done) {
    Promise.all([
      new Promise(function (res) {
        request.get(getURL('/ctrl/not-found'), function (err, response, body) {
          assert.equal(response.statusCode, 404)
          assert.equal(body, 'works')
          res()
        })
      }),

      new Promise(function (res) {
        request.post(getURL('/ctrl/not-found'), function (err, response, body) {
          assert.equal(response.statusCode, 405)
          assert.equal(body, 'works')
          res()
        })
      })
    ]).then(function () {
      done()
    })
  })

  it('should pass excetion to router when status handler thrown exception', function (done) {
    request.get(getURL('/ctrl/401'), function (err, response, body) {
      assert.equal(response.statusCode, 500)
      assert.equal(body.indexOf('401 error') > -1, true)
      done()
    })
  })
})

describe('controller.beforeAction', function () {
  it('should support function and generator', function (done) {
    request.get(getURL('/ba/ok'), function (error, response, body) {
      assert.equal(response.statusCode, 200)
      assert.equal(body, 'Hello')
      done()
    })
  })

  it('should skip controller and go to 404 if returns any values except undefined and null', function (done) {
    request.get(getURL('/ba/not-ok'), function (error, response) {
      assert.equal(response.statusCode, 404)
      done()
    })
  })

  it('should go to controller if returns undefined or null', function (done) {
    request.get(getURL('/ba/ok'), function (error, response, body) {
      assert.equal(response.statusCode, 200)
      assert.equal(body, 'Hello')
      done()
    })
  })
})
