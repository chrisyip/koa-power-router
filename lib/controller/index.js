var _ = require('../lodash-x.js')

var binder = require('../status-handler-binder.js')

function wrapAction (controller, action) {
  Object.defineProperty(action, 'controller', {
    value: controller
  })

  return action
}

function Controller (input) {
  var context = this

  var beforeAction = []

  // Make sure beforeAction and afterAction be array type
  Object.defineProperties(
    context,
    {
      beforeAction: {
        get: function () {
          return beforeAction
        },

        set: function (input) {
          beforeAction = _.compact([].concat(input))
        }
      },

      on: {
        value: function (status, handler) {
          binder(this, status, handler)
        }
      },

      addAction: {
        enumerable: true,
        value: function (name, action) {
          if (name === 'addAction') {
            throw Error('"addAction" is a preserved keyword!')
          }

          if (_.isFunction(action)) {
            this[name] = wrapAction(this, action)
          } else {
            throw new TypeError('Action must be a function or generator.')
          }
        }
      }
    }
  )

  _.forIn(input, function (value, key) {
    var match = key.match(/^on(\d+)$/)
    if (match) {
      return context.on(match[1], value)
    }

    switch (key) {
      case 'beforeAction':
        context[key] = value;
        break;
      default:
        context[key] = wrapAction(context, value)
    }
  })

  return context
}

Object.defineProperties(
  Controller,
  {
    isController: {
      value: function (input) {
        return input && input.constructor === Controller
      }
    }
  }
)

module.exports = function (input) {
  if (_.isFunction(input)) {
    return new Controller({
      defaultAction: input
    })
  }

  return new Controller(input)
}


Object.defineProperties(
  module.exports,
  {
    isController: {
      value: function (input) {
        return Controller.isController(input)
      }
    }
  }
)
