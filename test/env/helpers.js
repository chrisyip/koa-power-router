var request = require('request')

request.defaults({ proxy: null })

exports.request = request

exports.getURL = function getURL (page) {
  return 'http://127.0.0.1:3456/' + (page || '')
}
