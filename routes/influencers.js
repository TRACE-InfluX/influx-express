var log = require('../notifications')
try {
  var express = require('express')
  var router = express.Router()
  var db = require('../database/influencers')
  var cache = require('../database/cache')
  var authorize = require('../auth/token')
  var validate = require('../validation')
  var influencer = require('../models/influencer')
  var search = require('../models/search')


 router.get('/popular', async (req, res, next) => {
   try {
     let top_four = await db.get_popular()
     res.send(top_four)
   } catch (error) {
     error.endpoint = 'GET /v0/influencers/popular'
     log.warning(error)
     res.status(500).send(error)
   }
 })

router.get('/', 
  validate(search),
  async (req, res, next) => {
    try {

      let cache_result // = cache.load(req.body)

      if(!cache_result){

        let keys = req.body.query.split(' ')
        let result = await db.get_influencers_by(keys)
        let weights = req.body.sort_by

        result.sort((a, b) => {

          let accumulator = (sum,metric) => {
            return sum + a[metric] * weights[metric] - b[metric] * weights[metric]
          }

          return Object.keys(weights).reduce(accumulator, 0)
        })

        await cache.save(req.body, result)
        res.send(result)
      }
      else {
        res.send(cache_result)
      }

    } catch (error) {
      console.log(error)
      if(error == 404) return res.status(404).send({ error: 'No Results Found', query: req.body.query})
      error.endpoint = 'GET /v0/influencers'
      error.request = req.body
      log.warning(error)
      res.status(500).send(error)
    }
  }
);

router.post('/',
  authorize('admin'),
  validate(influencer),
  async (req, res) => {
    try {
      let id = await db.add(req.body)
      let response = await db.get_by_id(id)
      res.send(response)
    } catch (error) {
      error.endpoint = 'POST /v0/influencers'
      error.request  = req.body
      error.request.weights = { keys: '...' }
      error.request.preview = ['...']
      log.warning(error)
      res.status(500).send(error)

    }
  }
)

  module.exports = router;
}
catch (error) {
  console.log(error)
  log.error(error, {in: '/routes/influencers.js'})
}