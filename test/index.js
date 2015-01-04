/* global describe: false, it: false */

var assert = require('assert')

var request = require('request')

request.defaults({ proxy: null })

var server = require('./server.js')

function getURL (page) {
  return 'http://127.0.0.1:3456/' + (page || '')
}

server()

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
})

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

describe('controller beforeAction', function () {
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
