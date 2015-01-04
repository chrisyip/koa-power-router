var koa = require('koa')

var app = koa()

app.use(require('koa-buddy')())

app.use(function* (next) {
  console.info('-->', this.method, this.url)
  var start = Date.now()
  yield next
  var ms = Date.now() - start
  console.info('<--', this.method, this.url, this.res.statusCode, ms + 'ms')
})

var router = require('../router')

var Controller = require('../controller')

app.use(router())

function* getHomeContent () {
  var body = yield getBodyContent()
  return body
}

function* getBodyContent () {
  return yield '<p>This\'s homepage.<p>Try <a href="/user/john">/user/john</a> or post request to /post.'
}

router.all('/', new Controller(function* (next) {
  this.body = yield getHomeContent()
  this.type = 'html'
  yield next
}))

router.post('/post', new Controller({
  defaultAction: function () {
    this.body = 'Hello, ' + this.request.body.words
  }
}))

router.all('/500', function () {
  this.throw(500)
})

var user = require('./user.js')

router.get('/user/:name?', user.index)

router.on('404', function () {
  this.body = 'Not Found. Try something else?'
  this.status = 404
})

router.on('405', function () {
  this.body = 'This method is not supported'
  this.status = 405
})

router.on('500', function (next, error) {
  this.body = error.stack.replace(/\n/g, '<p>')
  this.type = 'html'
  this.status = 500
})

app.listen(3000)
