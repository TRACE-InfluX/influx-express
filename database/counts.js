var log = require('../notifications')
var db = require('../database')

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
        $or: keys.map(k => { return { key: k } })
      }
      const count = await db.open('influencer-counts')
      const data = await count.find( query , { key: 1, count: 1, _id: 0 }).toArray()
      let result = {}
      for (let entry of data) {
        result[entry.key] = entry.count
      }
      count.close()
      return result
    }
    catch (error) {
      log.error(error, { in: '../database/counts.get/...' })
    }
  },

  async increment() {
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
      let ref = await db.open('influencer-counts')

      let transactions = keys.map(key => {
        return { updateOne: { filter: { key }, update: { $inc: { count: 1 } }, upsert: true } }
      })

      let res = await ref.bulkWrite(transactions)

      ref.close()

      return res
    }
    catch (error) {
      log.error(error, { in: '../database/counts.increment/...' })
    }
  },

  async decrement() {
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
      let ref = await db.open('influencer-counts')

      let transactions = keys.map(key => {
        return { updateOne: { filter: { key }, update: { $inc: { count: -1 } } } }
      })

      let res = await ref.bulkWrite(transactions)
      ref.close()

      return res
    }
    catch (error) {
      log.error(error, { in: '../database/counts.decrement/...' })
    }
  }

}