var _ = require('lodash')

function isGenerator (input) {
  return typeof input === 'function' && input.constructor.name === 'GeneratorFunction'
}

function slice (arrayLike, startPos, endPos) {
  if (!Array.isArray(arrayLike)) {
    return []
  }

  var result = []

  var i = Math.floor(startPos)

  if (isNaN(i)) {
    i = 0
  }

  var len = Math.floor(endPos)

  if (isNaN(len)) {
    len = arrayLike.length
  }

  if (i < 0) {
    i = i + len

    if (i < 0) {
      i = 0
    }
  }

  if (len < 0) {
    len = len + arrayLike.length

    if (len < 0) {
      len = 0
    }
  }

  for (; i < len; i++) {
    result[result.length] = arrayLike[i]
  }

  return result
}

_.mixin({
  isGenerator: isGenerator,
  slice: slice
})

module.exports = _
