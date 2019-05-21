var log = require('../notifications')
var db = require('../database')
var {reweight, get_size} = require('../database/influencers')
var ObjectId = require('mongodb').ObjectId
// let update = { $set: { 'influencers-by-relevance.$[influencer]': { _id, relevance: new_weights[key] } } }
// transactions.push({ updateOne: { filter, update, arrayFilters: [{'influencer._id': _id }] } })
module.exports = {
  async save(data, result) {
    try {
      let query_cache = db.open('query-cache')
      let query = data.query
      let filter = {query}
      let sorts = JSON.stringify(data.sort_by)
      let positions = {}
      let activity = {}
      let engagement = {}
      let reach = {}
      let profit = {}
      let cost = {}
      let relevance = {}

      for(let i = 0; i < result.length; ++i) {
        let _id = result[i]._id
        positions[_id] = i
        activity[_id] = result[i].activity
        engagement[_id] = result[i].engagement
        reach[_id] = result[i].reach
        profit[_id] = result[i].profit
        cost[_id] = result[i].cost
        relevance[_id] = result[i].relevance
      }
      let upsert = await query_cache.updateOne(filter, {$set: {query}}, {upsert:true})
      if(upsert.result.upserted) {
        await query_cache.updateOne(filter, {$set: {caches: []}})
      }

      let timestamp = new Date().valueOf()

      let update = { $set: { 'caches.$[cache]': { timestamp, sorts, positions, activity, engagement, reach, profit, cost, relevance }}}
      await query_cache.updateOne(filter, update, { arrayFilters: [{ 'cache.sorts': sorts }] } )
      
      update = { $addToSet: { 'caches': { timestamp, sorts, positions, activity, engagement, reach, profit, cost, relevance }}}
      await query_cache.updateOne(filter, update)      
    } catch(error) {
      log.error(error, {in: '/database/cache.save/1'})
    }
  },
  async load(data) {
    try {
      let query_cache = db.open('query-cache')
      let query = data.query
      let sorts = JSON.stringify(data.sort_by)
      let results = await query_cache.findOne({query})

      // Invalidate if the query has not been cached before
      if (!results || !results.caches.length) {
        return null
      }

      let cache = results.caches.find(doc => doc.sorts === sorts)

      // Invalidate if the sort order was not cached before
      if (!cache) {
        return null
      }

      let current_time = new Date().valueOf()

      // Invalidate after 3 days
      if (current_time - cache.timestamp > 259200000) {
        return null
      }

      let filter = { $or: Object.keys(cache.positions).map( id => { return { _id : ObjectId(id) } } ) }

      let influencers = await db.open('influencers').find(filter, { projection: { weights: 0}}).toArray()

      let reweighted = influencers.map(influencer => {
        let _id = influencer._id
        influencer.cost_cad = Math.round(100 * influencer.cost) / 100
        influencer.profit_cad = Math.round(100 * influencer.profit) / 100
        influencer.relevance = cache.relevance[_id]
        influencer.activity = cache.activity[_id]
        influencer.engagement = cache.engagement[_id]
        influencer.reach = cache.reach[_id]
        influencer.cost = cache.cost[_id]
        influencer.profit = cache.profit[_id]
        return influencer
      })

      let sorted_influencers = []

      for(let influencer of reweighted ) {
        sorted_influencers[cache.positions[influencer._id]] = influencer
      }

      return sorted_influencers

    }catch(error) {
      log.error(error, {in: '/database/cache.load/1'})
    }
  } 
}