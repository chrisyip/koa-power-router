var koa = require('koa')

var app = koa()

var router = require('../../router.js')

var Controller = require('../../controller.js')

app.use(router({
  strictSlash: false
}))

router.get('/', function () {
  this.body = 'Homepage'
})

router.all('/all', function () {
  this.body = 'works'
})

;['get', 'post', 'put', 'delete'].forEach(function (method) {
  router.set('/multiple-definitions', [method], function () {
    this.body = method
  })
})

function* getNestedGeneratorsContent () {
  var body = yield getGeneratorBodyContent()
  return body
}

function* getGeneratorBodyContent () {
  return yield 'Nested Generators'
}

router.get('/nested-generators', function* () {
  this.body = yield getNestedGeneratorsContent()
})

function getNestedPromisesContent () {
  return Promise.resolve(getPromiseBodyContent())
}

function getPromiseBodyContent () {
  return Promise.resolve('Nested Promises')
}

router.get('/nested-promises', function* () {
  this.body = yield getNestedPromisesContent()
})

router.get('/primitive', function* () {
  var prefix = yield 'Hello'
  var suffix = yield 'World'
  this.body = prefix + ' ' + suffix
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

function get () {
  return Promise.resolve('works')
}

function* action () {
  this.body = yield get()
}

function* gen () {
  yield action.call(this)
}

router.get('/nested-generators-and-promises', function* () {
  yield gen.call(this)
})

var ctrl = new Controller()

ctrl.addAction('addActionTest', function () {
  this.body = 'works'
})

router.get('/ctrl/addAction', ctrl.addActionTest)

ctrl.addAction('notFound', function () {

})

ctrl.on('404', function () {
  this.body = 'works'
  this.status = 404
})

ctrl.on('405', function* () {
  this.body = yield 'works'
  this.status = 405
})

router.get('/ctrl/not-found', ctrl.notFound)

ctrl.on('401', function () {
  throw Error('401 error')
})

ctrl.addAction('notAuth', function () {
  this.status = 401
})

router.get('/ctrl/401', ctrl.notAuth)

router.get('/say/:name', function () {
  this.body = this.params.name
})

router.on('500', function (next, error) {
  this.body = error.message + '\nError Stack:' + error.stack
  this.status = 500
})

app.listen(3456)
