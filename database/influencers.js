var log = require('../notifications')
var db = require('../database')
var global_weights = require('../database/weights')
var ObjectId = require('mongodb').ObjectId
// var performance = require('perf_hooks').performance

let get_size = async function() {
  try {
    const collection = db.open('influencers')
    const count = await collection.find({}).count()
    return count
  }
  catch (error) {
    log.error(error, { in: '../database/influencers.get_size/0' })
  }
}

module.exports = {
  async get_influencers_by() {
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
      let weights = db.open('weights')
      
      let hash_keys = keys.map(key => '#' + key)
      keys = keys.concat(hash_keys)

      let query = {
        $or: keys.map(k => { return { key: k } })
      }

      let [matched_weights, size] = await Promise.all([
        weights.find(query, { hint: { key: 1 } }).toArray(),
        get_size()
      ])

      let merged_pools = {}
      let the_current_key
      for (let weight of matched_weights) {
        the_current_key = weight.key
        while (the_current_key[0] == '#') {
          the_current_key = the_current_key.substr(1)
        }
        if (!merged_pools[the_current_key]) {
          merged_pools[the_current_key] = {}
        }
        for (let influencer of weight['influencers-by-relevance']) {
          if (merged_pools[the_current_key][influencer._id]) {
            merged_pools[the_current_key][influencer._id] += influencer.relevance
          } else {
            merged_pools[the_current_key][influencer._id] = influencer.relevance
          }
        }
      }

      let enum_pool = []

      for (let merge_key in merged_pools) {
        if (merge_key != the_current_key) {
          enum_pool.push(merged_pools[merge_key])
        }
      }

      let accumulator = (pool, next) => {
        let new_pool = {}
        for(let id in pool) {
          if (next[id]) {
            new_pool[id] = pool[id] + next[id]
          }
        }
        return new_pool
      }

      let relevance = enum_pool.reduce(accumulator, merged_pools[the_current_key])

      query = {
        $or: Object.keys(relevance).map(id => { return { _id: ObjectId(id) } })
      }

      if(!query.$or.length) {
        throw 404
      }
      
      let influencer_collection = db.open('influencers')
      let matched_influencers = await influencer_collection.find(query, { projection: { weights: 0, processed_weights: 0}, hint: { _id: 1 } }).toArray()
      
      let activity = {}
      let engagement = {}
      let reach = {}
      let profit = {}
      let cost = {}
      
      let operations = []
      for (let influencer of matched_influencers) {
        let a = influencer_collection.find({ activity: { $lt: influencer.activity } }, { hint: { activity: -1 } }).count().then(i => { activity[influencer._id] = 100 * i / size })
        let e = influencer_collection.find({ engagement: { $lt: influencer.engagement } }, { hint: { engagement: -1 } }).count().then(i => { engagement[influencer._id] = 100 * i / size })
        let r = influencer_collection.find({ followers: { $lt: influencer.followers } }, { hint: { followers: -1 } }).count().then(i => { reach[influencer._id] = 100 * i / size })
        let p = influencer_collection.find({ profit: { $lt: influencer.profit } }, { hint: { profit: -1 } }).count().then(i => { profit[influencer._id] = 100 * i / size })
        let c = influencer_collection.find({ cost: { $lt: influencer.cost } }, { hint: { cost: 1 } }).count().then(i => { cost[influencer._id] = 100 * i / size })
        operations.push(a)
        operations.push(e)
        operations.push(r)
        operations.push(p)
        operations.push(c)
      }

      await Promise.all(operations)

      let result = matched_influencers.map(influencer => {
        let _id = influencer._id
        influencer.cost_cad = Math.round(100 * influencer.cost) / 100
        influencer.profit_cad = Math.round(100 * influencer.profit) / 100
        influencer.relevance = 20 + 10 * Math.log2(2 + relevance[_id]) / keys.length
        influencer.activity = activity[_id]
        influencer.engagement = engagement[_id]
        influencer.reach = reach[_id]
        influencer.cost = cost[_id]
        influencer.profit = profit[_id]
        return influencer
      })

      return result

    } catch (err) {
      if (err == 404) throw 404
      else {
        log.error( err, { in: '/database/influencers.get_influencers_by/...' })
      }
    }

  },
  async get_popular() {
    try {
      let influencers = db.open('influencers')
      let top_four = await influencers.find({}, { projection: { weights: 0, processed_weights: 0 } }).sort({followers: -1}).limit(4).toArray()
      return top_four
    } catch (error) {
      log.error(error, {in: '/database/influencers.get_popular/0'})
    }
  },
  get_size,
  async add(influencer) {
    try {
      let collection = db.open('influencers')

      // let t0a = performance.now()
      let [old_data, added_weights] = await Promise.all([
        collection.findOne({ username: influencer.username }),
        global_weights.add(influencer.weights)
      ])
      // let t1a = performance.now()

      // log.info('Time to check exists, and add weights: ' + (t1a - t0a) + ' milliseconds')

      // let t0b = performance.now()
      if (old_data) {
        await global_weights.subtract(old_data.weights)
      }
      // let t1b = performance.now()
      // log.info('Time to subtract weights: ' + (t1b - t0b) + ' milliseconds')


      // let t0c = performance.now()
      let [matching_keys, size] = await Promise.all([
        global_weights.get(influencer.weights),
        get_size()
      ])
      // let t1c = performance.now()
      // log.info('Time to get size and matching weights: ' + (t1c - t0c) + ' milliseconds')
      
      // let t0d = performance.now()
      let avg_weights = {}
      for (let key in matching_keys) {
        avg_weights[key] = (matching_keys[key] - 1) / size
      }

      let new_weights = {}
      for (let key in influencer.weights) {
        let avg = avg_weights[key]
        if (avg > 0) {
          new_weights[key] = (influencer.weights[key] - avg) / (avg + 1)

          if (key[0] == '#') {
            new_weights[key] *= 5
          }
        }
      }
      // let t1d = performance.now()
      // log.info('Time to process weights server side: ' + (t1d - t0d) + ' milliseconds')

      influencer.processed_weights = new_weights

      // let t0e = performance.now()
      let upsert_response = await collection.updateOne({ username: influencer.username }, { $set: influencer }, { upsert: true })
      // let t1e = performance.now()
      // log.info('Time to upsert influencer: ' + (t1e - t0e) + ' milliseconds')

      let _id = upsert_response.upsertedId ? upsert_response.upsertedId._id : old_data._id
      
      let transactions = []

      for (let key in new_weights) {
        let filter = { key }
        let update = { $set: { 'influencers-by-relevance.$[influencer]': { _id, relevance: new_weights[key] } } }
        transactions.push({ updateOne: { filter, update, arrayFilters: [{'influencer._id': _id }] } })
      }

      for (let key in new_weights) {
        let filter = { key }
        let update = { $addToSet: { 'influencers-by-relevance': { _id, relevance: new_weights[key] } } }
        transactions.push({ updateOne: { filter, update } })
      }

      // let t0f = performance.now()
      db.open('weights').bulkWrite(transactions)
      // let t1f = performance.now()
      // log.info('Time to bulkwrite weights: ' + (t1f - t0f) + ' milliseconds')

      return _id

    } catch (error) {
      log.error(error, {in: '/database/influencers.add/1'})
    }
  },

  async get_by_id(id) {
    try {
      let collection = db.open('influencers')

      let [influencer, size] = await Promise.all([
        collection.findOne({ _id: id }, {}),
        get_size()
      ])


      let [activity, engagement, reach] = await Promise.all([
        collection.find({ activity: { $lt: influencer.activity } }).sort({activity: -1}).count(),
        collection.find({ engagement: { $lt: influencer.engagement } }).sort({ engagement: -1 }).count(),
        collection.find({ followers: { $lt: influencer.followers } }).sort({ followers: -1 }).count()
      ])

      activity = 100 * (size - activity) / size
      influencer.activity = activity

      engagement = 100 * (size - engagement) / size
      influencer.engagement = engagement

      reach = 100 * (size - reach) / size
      influencer.reach = reach
      
      return influencer

    } catch (error) {
      log.error(error, {in: '/database/influencers.get_by_id/1'})
    }
  }
}