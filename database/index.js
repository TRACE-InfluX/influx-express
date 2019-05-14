var MongoClient = require('mongodb').MongoClient
var database = require('../config/database')
var log = require('../notifications')

var client

(async () => {
  try {
    const mongo  = new MongoClient(database.url, { useNewUrlParser : true })
    client = await new Promise(
      (resolve, reject) => {
        mongo.connect((error, client) => {
          if (error) reject(error)
          resolve(client)
        })  
      }
    )
    log.success('Connected to Database')
    return client
  }
  catch (error) {
    log.error(error, { in: '../database', msg: 'DB Connection Error' })
  }
})()

module.exports = {
  open(collection) { return client.db(database.name).collection(collection) }
}