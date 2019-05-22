var log = require('../notifications')
try {
  var express = require('express')
  var router = express.Router()
  var db = require('../database/weights')
  var validate = require('../validation')
  var weight_params = require('../models/weight_params')
  router.get('/', validate(weight_params) , async (req, res, next) => {
    try {
      let processed_weights = await db.get_weights_by_id(req.query._id)
      res.send(processed_weights)
    } catch (error) {
      error.endpoint = 'GET /v0/weights/1'
      log.warning(error)
      res.status(500).send(error)
    }
  })

  module.exports = router;
} catch(error) {
  console.log(error)
  log.error(error, {in: '/routes/weights.js'})
}