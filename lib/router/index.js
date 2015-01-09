var routers = []

var routersLength = 0

var _ = require('../lodash-x.js')

var pathToRegExp = require('path-to-regexp')

var yieldr = require('yieldr')

var runFilters = require('../run-filters.js')

var Controller = require('../controller/index.js')

var binder = require('../status-handler-binder.js')

var routerOptions = {
  // Convert multiple slashes to single slashes, query-string will be ignored
  // http://stackoverflow.com/questions/10161177/url-with-multiple-forward-slashes-does-it-break-anything
  strictSlash: true
}

function addRouter (input) {
  routers[routersLength++] = new R(input)
}

function R (options) {
  var opts = _.assign({}, options)

  var pattern = opts.pattern

  var keys = []

  if (!_.isRegExp(pattern) && !_.isString(pattern)) {
    throw new TypeError('Router URL pattern must be a string or regular expression!')
  }

  /* Router action must be one of a controller's action */
  if (_.isFunction(opts.action)) {
    // If action is a pure generator, wrap it into an action of controller
    if (!Controller.isController(opts.action.controller)) {
      var c = new Controller(opts.action)
      opts.action = c.defaultAction
    }
  } else if (Controller.isController(opts.action)) {
    // If action is a controller, use its defaultAction
    if (_.isFunction(opts.action.defaultAction)) {
      opts.action = opts.action.defaultAction
    } else {
      throw new TypeError('Controller defaultAction is undefined!')
    }
  } else {
    throw new TypeError('Router action must be a controller, function or generator');
  }

  // Convert string to regular expression with path-to-regexp
  // By default, all routers will be case insensitive
  if (_.isString(pattern)) {
    pattern = pathToRegExp(pattern)
    keys = pattern.keys
  }

  return {
    pattern: pattern,
    paramKeys: keys,
    action: opts.action,
    methods: opts.methods === true ? opts.methods : _.compact([].concat(opts.methods))
  }
}

function Router (options) {
  Router.configure(options)
  return Router.init()
}

Object.defineProperties(
  Router,
  {
    set: {
      value: function (url, methods, handler) {
        addRouter({
          pattern: url,
          action: handler,
          methods: methods
        })
      }
    },

    all: {
      value: function (url, handler) {
        Router.set(url, true, handler)
      }
    },

    // Handle specific status globally
    // e.g. 404, 500
    on: {
      value: function (status, handler) {
        binder(this, status, handler)
      }
    },

    configure: {
      value: function (options) {
        return _.isUndefined(options) ? routerOptions : _.merge(routerOptions, options)
      }
    },

    init: {
      value: function () {
        var self = this

        return function* (next) {
          var context = this
            , skipGlobalStatusHandler = false
            // fix path-to-regexp can't handler query-string issue
            // e.g. /demo?foo-bar !== /demo
            , url = context.url.split('?')[0]
            , actionError, methodMatched

          if (routerOptions.strictSlash !== true) {
            url = url.replace(/\/+/g, '/')
          }

          // Find the matched router
          var router
          _.forEach(routers, function (r) {
            var match = r.pattern.exec(url)

            if (!match) {
              return
            }

            router = r

            if (r.methods === true || _.contains(r.methods, context.method.toLowerCase())) {
              // Export request parameters to Koa context
              if (r.paramKeys.length) {
                // Use ab object to store named parameters
                context.params = {}

                _.forEach(r.paramKeys, function (key, i) {
                  context.params[key.name] = match[i + 1]
                })
              } else {
                // If not named, use array
                context.params = _.slice(match, 1)
              }

              methodMatched = true
              return false
            }
          })

          if (router) {
            if (methodMatched) {
              try {
              // Run beforeAction, if all actions return undefined or null mean OK
                if (yield runFilters(router.action.controller.beforeAction, context)) {
                  // Run the actual action
                  // `next` is optional, action can ignore it
                  yield yieldr(router.action, context, [next])
                }
              } catch (ex) {
                // If there's an error, set 500 status and pass error to 500 handler
                actionError = ex
                context.status = 500
              }
            } else {
              context.status = 405
            }

            var actionStatusHandler = router.action.controller['on' + context.status]
            if (_.isFunction(actionStatusHandler)) {
              try {
                yield yieldr(actionStatusHandler, context, [next])
                skipGlobalStatusHandler = true
              } catch (ex) {
                actionError = ex
                context.status = 500
              }
            }
          }

          /**
           * Global status handler
           * For example, if you wanna render a default 404 HTML page without redirecting to 404 page
           *   Router.on('404', function () {
           *     yield this.render('404')
           *   })
           */
          if (!skipGlobalStatusHandler) {
            var statusHandler = self['on' + context.status]
            if (_.isFunction(statusHandler)) {
              yield yieldr(statusHandler, context, [next, actionError])
            } else if (actionError) {
              throw actionError
            }
          }

          yield next
        }
      }
    }
  }
)

_.forEach(['get', 'post', 'put', 'delete'], function (method) {
  Object.defineProperty(
    Router,
    method,
    {
      value: function (url, handler) {
        Router.set(url, method, handler)
      }
    }
  )
});

module.exports = Router
