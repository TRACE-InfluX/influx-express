var firebase = require('firebase')

var config = require('../config/auth')
firebase.initializeApp(config)

module.exports = firebase.auth()