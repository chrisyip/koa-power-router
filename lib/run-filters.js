var async = require('async')

var yieldr = require('yieldr')

module.exports = function (filters, thisArg) {
  return new Promise(function (resolve, reject) {
    async.eachSeries(filters, function (filter, callback) {
      yieldr(filter, thisArg).then(function (res) {
        callback(res == null ? null : true)
      }).catch(function (error) {
        callback(error)
      })
    }, function (error) {
      if (error === true) {
        resolve(false)
      } else if (error) {
        reject(error)
      } else {
        resolve(true)
      }
    })
  })
}
