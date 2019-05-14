var log = require('../notifications')
var db  = require('../database')

module.exports = {
  async get() {
    try {
      let args = Array.prototype.slice.call(arguments)
      let keys = []
      if (typeof args[0] == 'string') {
        for (let key of args) {
          if (typeof key != 'string') {
            throw 'Expected all arguments to be type: String'
          }
          keys.push(key)
        }
      }
      else if (Array.isArray(args[0])) {
        for (let key of args[0]) {
          if (typeof key != 'string') {
            throw 'Expected all arguments to be type: String'
          }
          keys.push(key)
        }
      }
      else if (args[0]) {
        keys = Object.keys(args[0])
      }
      let query = {
        $or: keys.map(k => { return { key : k } })
      }

      const weights = db.open('weights')
      const projection = { key:1, count:1, _id:0 }
      const data = await weights.find(query, { projection }).toArray()
      let result = {}
      for (let weight of data) {
        result[weight.key] = weight.count
      }

      return result
    }
    catch (error) {
      log.error(error, { in: '../database/weights.get/...' })
    }
  },

  async add(keys) {
    try {
      let ref = db.open('weights')

      let transactions = Object.keys(keys).map(key => {
        return { updateOne: { filter: { key }, update: { $inc: { count: keys[key] } }, upsert: true } }
      })

      let res = await ref.bulkWrite(transactions)

      return res
    }
    catch (error) {
      log.error(error, { in: '../database/weights.add/1' })
    }
  },

  async subtract(keys) {
    try {
      let ref = db.open('weights')

      let transactions = Object.keys(keys).map(key => {
        return { updateOne: { filter: { key }, update: { $inc: { count: -keys[key] } } } }
      })

      let res = await ref.bulkWrite(transactions)

      return res
    }
    catch (error) {
      log.error(error, { in: '../database/weights.subtract/1' })
    }
  }
}