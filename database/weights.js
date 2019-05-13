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

      const weights = await db.open('weights')
      const projection = { key:1, count:1, _id:0 }
      const data = await weights.find(query, { projection }).toArray()

      let result = {}
      for (let weight of data) {
        result[weight.key] = weight.count
      }

      return result
    }
    catch (error) {
      log.error(error, { in: '../database/weights.get/1' })
    }
  },
  async add(keys) {

  },
  async subtract(keys) {

  }
}