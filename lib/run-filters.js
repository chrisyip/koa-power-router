var async = require('async')

var run = require('./function-caller.js')

module.exports = function (filters, thisArg) {
  return new Promise(function (resolve) {
    async.eachSeries(filters, function (filter, callback) {
      var result = run(filter, thisArg)

      if (result && typeof result.then === 'function') {
        result.then(function (res) {
          callback(null, res)
        }).catch(function (error) {
          callback(error || true)
        })
      } else {
        callback(result)
      }
    }, function (error) {
      resolve(error ? false : true)
    })
  })
}
