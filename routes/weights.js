var log = require('../notifications')
try {
  var express = require('express')
  var router = express.Router()
  var db = require('../database/weights')
  var validate = require('../validation')
  var influencer = require('../models/weight_params')
  router.get('/weights',async (req, res, next) => {
    try {
      let top_four = await db.get_weights_by_id(req.query._id)
      res.send(top_four)
    } catch (error) {
      error.endpoint = 'GET /v0/weights/1'
      log.warning(error)
      res.status(500).send(error)
    }
  })
} catch(error) {
  console.log(error)
  log.error(error, {in: '/routes/weights.js'})
}