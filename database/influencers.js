var log = require('../notifications')
var db = require('../database')
var global_weights = require('../database/weights')
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
  async get_all(page, filter) {
    try {
      if (page < 0) {
        throw 'page size must be greater than or equal to 0'
      }
      let influencers = db.open('influencers')
      let size = 100
      let skip = size * (page)
      let limit = size
      let sort = {}
      sort[filter] = -1
      return await influencers.find({}, { projection: { weights: 0, processed_weights: 0 } }).skip(skip).limit(limit).sort(sort).toArray()
    } catch (error) {
      log.error(error, {in: '/database/influencers.get_all/1'})
    }
  }
  ,
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
        collection.find({ username: influencer.username }).toArray(),
        global_weights.add(influencer.weights)
      ])
      // let t1a = performance.now()

      // log.info('Time to check exists, and add weights: ' + (t1a - t0a) + ' milliseconds')

      // let t0b = performance.now()
      if (old_data.length) {
        await global_weights.subtract(old_data[0].weights)
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

      let _id = upsert_response.upsertedId ? upsert_response.upsertedId._id : old_data[0]._id
      
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
      await db.open('weights').bulkWrite(transactions)
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
        collection.find({ _id: id }, {}).toArray(),
        get_size()
      ])

      influencer = influencer[0]

      let [activity, engagement, reach] = await Promise.all([
        collection.find({ _id: { $lt: influencer._id } }, { hint: { activity: -1 } }).count(),
        collection.find({ _id: { $lt: influencer._id } }, { hint: { engagement: -1 } }).count(),
        collection.find({ _id: { $lt: influencer._id } }, { hint: { followers: -1 } }).count()
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