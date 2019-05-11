var MongoClient = require('mongodb').MongoClient
var database = require('../config/database')
var log = require('../notifications')

module.exports = {
  async open(collection) {
    try {
      const mongo  = new MongoClient(database.url, { useNewUrlParser : true })
      let client = await new Promise(
        (resolve, reject) => {
          mongo.connect((error, client) => {
            if (error) reject(error)
            resolve(client)
          })  
        }
      )
      return client.db(database.name).collection(collection)
    }
    catch(error) {
      log.error(error, { in: '../database', msg: 'DB Connection Error' })
    }
  }
}