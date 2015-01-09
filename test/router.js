/* global describe: false, it: false */

var assert = require('assert')

var helpers = require('./env/helpers.js')

var request = helpers.request

var getURL = helpers.getURL

var router = require('../lib/router/index.js')

var Controller = require('../lib/controller/index.js')

describe('router', function () {
  it('should return 404 if page not found', function (done) {
    request.get(getURL('404'), function (error, response, body) {
      assert.equal(response.statusCode, 404)
      assert.equal(body, 'Not Found')
      done()
    })
  })

  it('should return 405 if method not set', function (done) {
    request.post(getURL('/'), function (error, response, body) {
      assert.equal(response.statusCode, 405)
      assert.equal(body, 'Method Not Allowed')
      done()
    })
  })

  it('should return correct response if URL is "/"', function (done) {
    request.get(getURL(''), function (error, response, body) {
      assert.equal(body, 'Homepage')
      assert.equal(response.statusCode, 200)
      done()
    })
  })

  it('should support using `all` to catch all methods', function (done) {
    var tests = ['get', 'post', 'put', 'delete'].map(function (method) {
      return new Promise(function (res) {
        request({
          url: getURL('/all'),
          method: method
        }, function (error, response, body) {
          assert.equal(response.statusCode, 200)
          assert.equal(body, 'works')
          res()
        })
      })
    })

    Promise.all(tests).then(function () {
      done()
    })
  })

  it('should support multiple definitions for same URL pattern', function (done) {
    var tests = ['get', 'post', 'put', 'delete'].map(function (method) {
      return new Promise(function (res) {
        request({
          url: getURL('/multiple-definitions'),
          method: method
        }, function (error, response, body) {
          assert.equal(response.statusCode, 200)
          assert.equal(body, method)
          res()
        })
      })
    })

    Promise.all(tests).then(function () {
      done()
    })
  })

  it('should response 500 with global error handler', function (done) {
    request.get(getURL('/global-error-handler'), function (error, response, body) {
      assert.equal(body.indexOf('Internal Server Error') > -1, true)
      assert.equal(response.statusCode, 500)
      done()
    })
  })

  it('should pass error object to error handler', function (done) {
    request.get(getURL('/global-error-handler'), function (error, response, body) {
      assert.equal(body.indexOf('Error Stack:') > -1, true)
      assert.equal(response.statusCode, 500)
      done()
    })
  })

  it('should support named pattern', function (done) {
    request.get(getURL('/say/John'), function (error, response, body) {
      assert.equal(body, 'John')
      assert.equal(response.statusCode, 200)
      done()
    })
  })

  it('should support regexp for URL pattern', function (done) {
    Promise.all([
      new Promise(function (resolve) {
        request.get(getURL('/hello/John'), function (error, response, body) {
          assert.equal(body, 'Hello, John')
          assert.equal(response.statusCode, 200)
          resolve()
        })
      }),

      new Promise(function (resolve) {
        request.get(getURL('/hello/Joe'), function (error, response, body) {
          assert.equal(body, 'Hello, Joe')
          assert.equal(response.statusCode, 200)
          resolve()
        })
      })
    ]).then(function () {
      done()
    })
  })

  it('should throw exception when add a controller without defaultAction', function () {
    try {
      router.get('/', new Controller())
    } catch (ex) {
      assert.equal(ex.message, 'Controller defaultAction is undefined!')
    }
  })

  it('should throw exception when add an unsupported type for controller', function () {
    try {
      router.get('/', true)
    } catch (ex) {
      assert.equal(ex.message, 'Router action must be a controller, function or generator')
    }
  })

  it('should throw exception when use non-string or non-regexp for pattern', function () {
    try {
      router.get(true, function () {})
    } catch (ex) {
      assert.equal(ex.message, 'Router URL pattern must be a string or regular expression!')
    }
  })
})
