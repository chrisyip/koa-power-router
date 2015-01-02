// https://www.promisejs.org/generators/
function runGenerator (makeGenerator) {
  return function (thisArg, args) {
    var generator = makeGenerator.apply(thisArg, args)

    function handle (result) {
      var value = result.value

      if (value != null) {
        if (value.constructor.name === 'GeneratorFunctionPrototype') {
          value = handle(value.next())
        } else if (value.constructor.name === 'GeneratorFunction') {
          value = runGenerator(value)(thisArg, args)
        }
      }

      if (result.done) {
        return Promise.resolve(value)
      }

      return Promise.resolve(value).then(function (res) {
        return handle(generator.next(res))
      }, function (err){
        return handle(generator.throw(err))
      })
    }

    try {
      return handle(generator.next())
    } catch (ex) {
      return Promise.reject(ex)
    }
  }
}

module.exports = function (func, thisArg, args) {
  if (typeof func !== 'function') {
    return
  }

  if (func.constructor.name === 'GeneratorFunction') {
    var gen = runGenerator(func)

    return gen(thisArg, args)
  } else {
    return func.apply(thisArg, args)
  }
}
