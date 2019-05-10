var MongoClient = require('mongodb').MongoClient
var database = require('../config/database')
var notifications = require('../notifications')

module.exports = (async () => {
  try {
    const client = await MongoClient.connect(database.url,{ useNewUrlParser: true })
    return client.db(database.name)
  }
  catch(error) {
    notifications.send('Error', error)
  }
})()