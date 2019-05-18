var log = require('../notifications')
var db = require('../database')
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
      let upsert_result = await query_cache.updateOne(filter, {$set: {query}}, {upsert:true})
      if(upsert_result.upserted) {
        await query_cache.updateOne(filter, {$set: {caches: []}})
      }

      let update = { $set: { 'caches.$[cache]': { timestamp: new Date().valueOf(), sorts, positions }}}
      await query_cache.updateOne(filter, update, { arrayFilters: [{ 'cache.sorts': sorts }] } )
      
      update = { $addToSet: { 'caches': { timestamp: new Date().valueOf(), sorts , positions }}}
      let addtoset_result = await query_cache.updateOne(filter, update)
      //console.log(addtoset_result)
      
    }catch(error) {
      log.error(error, {in: '/database/cache.save/1'})
    }
  },
  async load(data) {
    try {
      db.open('query-cache')

    }catch(error) {
      log.error(error, {in: '/database/cache.load/1'})
    }
  } 
}