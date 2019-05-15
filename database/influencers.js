var log = require('../notifications')
var db = require('../database')
var global_weights = require('../database/weights')

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
  get_size,
  async add(influencer) {
    try {
      let collection = db.open('influencers')

      let [old_data, upsert_response, added_weights] = await Promise.all([
        collection.find({ username: influencer.username }).toArray(),
        collection.updateOne({ username: influencer.username }, { $set: influencer }, { upsert: true }),
        global_weights.add(influencer.weights)
      ])

      if (old_data.length) {
        await global_weights.subtract(old_data[0].weights)
      }

      let [matching_keys, size] = await Promise.all([
        global_weights.get(influencer.weights),
        get_size()
      ])

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
      
      let id = upsert_response.upsertedId ? upsert_response.upsertedId._id : old_data[0]._id
      
      let transactions = []

      for (let key in new_weights) {
        let filter = { key }
        let update = { $push: { 'influencers-by-relevance': { id, weights: new_weights[key] } } }
        transactions.push({ updateOne: { filter, update, upsert: true } })
      }

      await db.open('weights').bulkWrite(transactions)

      return id

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