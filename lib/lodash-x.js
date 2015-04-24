var _ = require('lodash')

function isGenerator (input) {
  return typeof input === 'function' && input.constructor.name === 'GeneratorFunction'
}

_.mixin({
  isGenerator: isGenerator
})

module.exports = _
