var log = require('../notifications')
var db = require('../database')
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
      for(let i = 0; i < result.length; ++i) {
        positions[result[i]._id] = i
      }
      let upsert = await query_cache.updateOne(filter, {$set: {query}}, {upsert:true})
      if(upsert.result.upserted) {
        await query_cache.updateOne(filter, {$set: {caches: []}})
      }

      let timestamp = new Date().valueOf()

      let update = { $set: { 'caches.$[cache]': { timestamp, sorts, positions }}}
      await query_cache.updateOne(filter, update, { arrayFilters: [{ 'cache.sorts': sorts }] } )
      
      update = { $addToSet: { 'caches': { timestamp, sorts , positions }}}
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

      let influencers = await db.open('influencers').find(filter, { projection: { weights: 0, processed_weights: 0 }}).toArray()

      let sorted_influencers = []

      for(let influencer of influencers ) {
        sorted_influencers[cache.positions[influencer._id]] = influencer
      }

      return sorted_influencers

    }catch(error) {
      log.error(error, {in: '/database/cache.load/1'})
    }
  } 
}