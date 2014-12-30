var koa = require('koa')

var app = koa()

var router = require('../router.js')

var Controller = require('../controller.js')

app.use(router({
  strictSlash: false
}))

router.get('/', function () {
  this.body = 'Homepage'
})

;['get', 'head', 'post', 'put', 'delete'].forEach(function (method) {
  router.set('/method-test/' + method, [method], function () {
    this.body = method
  })
})

router.get('/global-error-handler', function () {
  this.throw(500)
})

router.get('/controller/normal-func', new Controller(function () {
  this.body = 'done'
}))

router.get('/controller/generator', new Controller(function* (next) {
  this.body = 'done'
  yield next
}))

router.get('/controller/on', new Controller({
  beforeAction: function () {
    return true
  },
  defaultAction: function () {

  },
  on404: function () {
    this.body = 'Nothing here'
    this.status = 404
  }
}))

router.get('/ba/not-ok', new Controller({
  beforeAction: function () {
    return true
  },
  defaultAction: function () {
    this.body = 'Hello'
  }
}))

router.get('/ba/ok', new Controller({
  beforeAction: [function () {
    return null
  }, function* () {
    function func () {
      return
    }

    return yield func()
  }],
  defaultAction: function () {
    this.body = 'Hello'
  }
}))

router.get(/^\/hello\/(\w+)/i, function () {
  this.body = 'Hello, ' + this.params[0]
})

router.on('500', function () {
  this.body = 'Oops'
  this.status = 500
})

module.exports = function () {
  app.listen(3456, function () {
    console.info('Koa server started.')
  })
}
