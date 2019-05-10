var admin = require('firebase-admin')

var serviceAccount = require('../config/admin.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://influx-trace.firebaseio.com'
})

module.exports = admin.auth()