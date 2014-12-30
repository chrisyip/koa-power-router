var _ = require('../lib/lodash-x.js')

var Controller = require('../controller.js')

var user = new Controller()

var users = [
  {
    name: 'John',
    email: 'john@domain.com'
  },
  {
    name: 'Joe',
    email: 'joe@domain.com'
  },
  {
    name: 'Adam',
    email: 'adam@domain.com',
    isAdmin: true
  }
]

user.addAction('index', function () {
  var name = this.params.name || ''

  var user = _.find(users, function (user) {
    return user.name.toLowerCase() === name.toLowerCase()
  })

  if (user) {
    this.body = user.name + '\'s email is ' + user.email
  }
})

user.beforeAction = [
  function () {
    var name = this.params.name

    if (name && _.some(users, function (user) {
      return user.name.toLowerCase() === name.toLowerCase() && user.isAdmin
    })) {
      this.status = 401
      return true
    }
  }
]

user.on('401', function () {
  this.body = 'Sorry, access denied.'
  this.status = 401
})

user.on('404', function () {
  this.body = 'Sorry, cannot found ' + this.query.name + '. Try John or Joe?'
})

module.exports = user
