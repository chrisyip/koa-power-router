var _ = require('./lodash-x.js')

module.exports = function (target, status, handler) {
  if (!/^[1-5]\d{2}$/.test(String(status))) {
    throw new TypeError('Status must be a HTTP status code')
  }

  var action

  if (_.isFunction(handler) || _.isGenerator(handler)) {
    action = handler
  } else {
    throw new TypeError('Action must be a function or generator')
  }

  Object.defineProperty(target, 'on' + status, {
    configurable: true,
    enumerable: true,
    value: action
  })
}
