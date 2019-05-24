var log = require('../notifications')
var db  = require('../database')
var ObjectId = require('mongodb').ObjectId


module.exports = {
  async get_most_common_weights() {
    try{
      let weights = await db.open('weights').find({},{projection: {key: 1, _id: 0}}).sort( { count: -1 } ).limit(10000).toArray()
      return weights
    }catch(error) {
      log.error(error, {in : '/database/weights.get_most_common_weights/0'})
    }
  },
  async get_weights_by_id(_id) {
    try {
      let influencers = db.open('influencers')
      let projections = {processed_weights: 1}
      let processed_weights = await influencers.findOne({_id: ObjectId(_id) }, {projection: projections})
      return processed_weights
    } catch(error) {
      log.error(error, {in: '/database/weights.get_weights_by_id/1'})
    }
  },
  
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
      if(!data.length) {
        throw 404
      }
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
      await ref.updateMany({ "influencers-by-relevance": null}, { $set: { "influencers-by-relevance": []}})

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
  },

  async get_size() {
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
      const projection = { key: 1, _id: 0, 'influencers-by-relevance': 1}
      const data = await weights.find(query, { projection }).toArray()
      let result = {}
      for (let weight of data) {
        result[weight.key] = weight['influencers-by-relevance'].length
      }

      return result
    }
    catch (error) {
      log.error(error, { in: '../database/weights.get_size/...' })
    }
  }
}