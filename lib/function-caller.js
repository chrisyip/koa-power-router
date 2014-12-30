module.exports = function (func, thisArg, args) {
  if (typeof func !== 'function') {
    return
  }

  if (func.constructor.name === 'GeneratorFunction') {
    var fn = func.apply(thisArg, args)
    var result = fn.next()

    while (!result.done) {
      result = fn.next(result.value)
    }

    return result.value
  } else {
    return func.apply(thisArg, args)
  }
}
