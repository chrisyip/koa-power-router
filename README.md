# koa-power-router

[![Node version][node-image]][npm-url] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Travis CI][travis-image]][travis-url] [![Coveralls][coveralls-image]][coveralls-url]

**Still under development!**

Features:

- `onSTATUS` handler (globally or per controller)
- `beforeAction`: a function list that runs before router action, if any of them return values except `undefined` or `null` will skip action, and go to `onSTATUS` handler

# How to use

Install:

```shell
npm install --save koa-power-router
```

Usage:

```js
var koa = require('koa')
var app = koa()
var router = require('koa-power-router/router')
var Controller = require('koa-power-router/controller')

var options = {
  strcitSlash: true // or false
}

app.use(router(options))

router.on('404', function* () {
  yield this.render('404')
})

// Functions and Generators will auto-convert to Controller
router.get('/', function* (next) {
  yield this.render('homepage')
  yield next
})

// Define a Controller with beforeAction
var user = new Controller({
  beforeAction: function () {
    // if not login and token is empty
    if (this.url.indexOf('/login') !== 0 &&
        !this.cookies.get('token')) {
      return true
    }
  },
  login: function* () {
    if (this.method === 'get') {
      yield this.render('login')
    } else {
      doLogin()
    }
  },
  dashboard: function* () {
    yield this.render('dashboard')
  },
  on404: function* () {
    yield this.render('user/404')
  }
})

router.set('/login', ['get', 'post'], user.login)
router.get('/dashboard', user.dashboard)

router.on('404', function* () {
  yield this.render('404')
})
```

# Router

## Methods

### router.configure(options)

```js
app.use(router())
router.configure({})
// equals to
app.use(router({}))
```

Supported options:

#### strictSlash

> HTTP RFC 2396 defines path separator to be single slash.

> However, unless you're using some kind of URL rewriting (in which case the rewriting rules may be affected by the number of slashes), the uri maps to a path on disk, but in (most?) modern operating systems (Linux/Unix, Windows), multiple path separators in a row do not have any special meaning, so /path/to/foo and /path//to////foo would eventually map to the same file.

[http://stackoverflow.com/questions/10161177/url-with-multiple-forward-slashes-does-it-break-anything](http://stackoverflow.com/questions/10161177/url-with-multiple-forward-slashes-does-it-break-anything)

If `strcitSlash` is `true`, URL like `//demo` will not match the following router:

```js
router.get('/demo', function () {})
```

### router.set(url, methods, action)

`url`: the pattern of URL, convertd to regular expression with [path-to-regexp](https://github.com/pillarjs/path-to-regexp).

`url` supports:

- String: `'/homepage'`
- Named string: `'/uesr/:id'`
- Regular expression: `/^/item/(\d)+/i`

`methods`: the HTTP methods that this router should support, can be `string` and `array`.

`action`: `function` or `generator`.

#### Shortcuts

- `router.all(url, action)`
- `router.get(url, action)`
- `router.post(url, action)`
- `router.put(url, action)`
- `router.delete(url, action)`

### router.on(status, handler)

Register a handler for specified status.

```js
router.on('500', function* (next, error) {
  yield this.render('500')
})
```

With this feature, you can render error page without redirecting to an actual error page.

# Controller

An exmaple of how to define a controller:

```js
var user = new Controller({
  beforeAction: function () {
    if (!this.cookies.get('token')) {
      return true
    }
  },
  dashboard: function* () {
    yield this.render('dashboard')
  },
  on404: function* (){

  }
})
```

## Methods

### on(status, handler)

Register a handler for specified status.

```js
user.on('500', function* () {
  yield this.render('500')
})
```

**If a status is handled by a controller, router's handler will be skipped.**

With this feature, you can render error page without redirecting to an actual error page.

## Properties

### beforeAction

A list of function that run before controller's action. For example:

```js
ar user = new Controller({
  beforeAction: function () {
    if (!this.cookies.get('token')) {
      this.status = 401
      return true
    }
  },
  dashboard: function* () {
    yield this.render('dashboard')
  },
  on401: function* () {
    yield this.render('user/not-authorized')
  }
})

router.set('/login', ['get', 'post'], user.login)
router.get('/dashboard', user.dashboard)
```

Any request of `/dashboard` without `token` will go to `on401` handler and render `user/not-authorized` page instead `dashboard` page.

# Yieldables

Koa is using [co](https://www.npmjs.com/packages/co), and co's changed the `yield`'s behaviors.

For example:

```js
// native yield
function* func (input) {
  var result = yield Math.floor(input) + 1
  return result
}

func('12').next().value // 13

// co
function* func (input) {
  var result = yield Math.floor(input) + 1
  return result
}

co.wrap(func)() // TypeError: You may only yield a function, promise, generator, array, or object
```

Because of this change, co extended Koa with some great features:

```js
app.use(function* () {
  var results = yield [Promise.resolve('123'), new Promise(function (res) { res('foo' + 'bar') })]
  // Co will loop through array, and try to resolve it
  console.log(results) // ['123', 'foobar']
})
```

But personally, I don't like to limit yieldables objects. So Power Router will only try to resolve promises and generators:

```js
function getUser (name) {
  return new Promise(function (res) {
    request.get(API_TO_GET_USER, { username: name }, function (error, data) {
      res(data)
    })
  })
}

router.get('/', function* () {
  var user = yield getUser(this.query.name) // user will be the data object
  var genders = yield [Promise.resolve('male'), Promise.resolve('female')]
  console.log(genders) // [ Promise, Promise ]  
})
```

If you want something like resolving array, just use co directly:

```js
var co = require('co')

router.get('/', function* () {
  var genders = yield co(function* () {
    return yield [Promise.resolve('male'), Promise.resolve('female')]
  })
  console.log(genders) // [ 'male', 'female' ]  
})
```

# Contributors

Via [GitHub](https://github.com/chrisyip/koa-power-router/graphs/contributors)

[node-image]: http://img.shields.io/node/v/koa-power-router.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-power-router
[npm-image]: http://img.shields.io/npm/v/koa-power-router.svg?style=flat-square
[daviddm-url]: https://david-dm.org/chrisyip/koa-power-router
[daviddm-image]: http://img.shields.io/david/chrisyip/koa-power-router.svg?style=flat-square
[travis-url]: https://travis-ci.org/chrisyip/koa-power-router
[travis-image]: http://img.shields.io/travis/chrisyip/koa-power-router.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/chrisyip/koa-power-router
[coveralls-image]: http://img.shields.io/coveralls/chrisyip/koa-power-router.svg?style=flat-square
