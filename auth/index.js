var firebase = require('firebase')

var config = require('../config/firebase')
firebase.initializeApp(config)

module.exports = firebase.auth()