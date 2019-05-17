var log = require('../notifications')
var db = require('../database')

module.exports = {
  async save(data, result) {
    try {
      db.open('query-cache')
      let query = data.query
      let sorts = data.sorts

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