var log = require('../notifications')
var db = require('../database')
var global_weights = require('../database/weights')
var counts = require('../database/counts')
module.exports = {
  async add(influencer) {
    try {
      let collection = db.open('influencers')
      //adding influencer to table
      let old_data = await collection.find({ username: influencer.username }).toArray()
      if (old_data.length) {
        await global_weights.subtract(old_data[0].weights)
        await counts.decrement(Object.keys(old_data[0].weights).concat('___global-influencers'))
      }
      let upsert_response = await collection.updateOne({ username: influencer.username }, { $set: influencer }, { upsert: true })
      //adding to global_weights from influencer weights
      await global_weights.add(influencer.weights)
      
      //incrementing counts of how many influencers 1. exist in global influencers, and 2. how many influencers use the keyword
      await counts.increment(Object.keys(influencer.weights).concat('___global-influencers'))
      //returning keys matched by what the influencer uses
      let matching_keys = await global_weights.get(influencer.weights)
      //getting how many influencers are in the DB
      let size = await counts.get('___global-influencers')
      size = size['___global-influencers']

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
      //geting insertedId from insert result callback
      let id = upsert_response.upsertedId._id || old_data[0]._id

      log.info(id)
      //adding influencer to activity collection
      let activity_collection = db.open('influencers-by-activity')
      await activity_collection.updateOne({ id }, { $set: { id, activity: influencer.activity } }, { upsert: true } )
      //adding influencer to engagement collection
      let engagement_collection = db.open('influencers-by-engagement')
      await engagement_collection.updateOne({ id }, { $set: { id, followers: influencer.followers } }, { upsert: true })
      //adding influencer to followers collection
      let followers_collection = db.open('influencers-by-followers')
      await followers_collection.updateOne({ id }, { $set: { id, followers: influencer.followers } }, { upsert: true })

      for (let key in new_weights) {
        var collection_name = 'influencers-by-key[' + key + ']'
        let new_collection = db.open(collection_name)
        await new_collection.createIndex({ weight: -1 }).catch()
        await new_collection.updateOne({ id }, { $set: { id,weight: new_weights[key] } }, {upsert: true})
      }
      return id
    } catch (error) {
      log.error(error, {in: '/database/influencers.add/1'})
    }
  },
  async get_by_id(id) {
    try {
      let collection = db.open('influencers')
      let influencer = await collection.find({ _id: id }, {}).toArray()
      let counts_collection = db.open('influencer-counts')
      counts = await counts_collection.find({ key: '___global-influencers' }, { count: 1, _id: 0 }).toArray()
      count = counts[0].count

      influencer = influencer[0]

      let activity_collection = db.open('influencers-by-activity')
      activity = await activity_collection.find({ _id: { $lte: influencer._id } }).count()
      activity = 100 * (count - activity) / count
      influencer.activity = activity

      let engagement_collection = db.open('influencers-by-engagmement')
      engagement = await engagement_collection.find({ _id: { $lte: influencer._id } }).count()
      engagement = 100 * (count - engagement) / count
      influencer.engagement = engagement

      let reach_collection = db.open('influencers-by-followers')
      reach = await reach_collection.find({ _id: { $lte: influencer._id } }).count()
      reach = 100 * (count - reach) / count
      influencer.reach = reach
      
      return influencer
    } catch (error) {
      log.error(error, {in: '/database/influencers.get_by_id/1'})
    }
  }
}