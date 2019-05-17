var log = require('../notifications')
try {
  var express = require('express')
  var router = express.Router()
  var db = require('../database/influencers')
  var authorize = require('../auth/token')
  var validate = require('../validation')
  var influencer = require('../models/influencer')

  // temp imports
  var fs = require('fs')
  var path = require('path')


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

    //let influencers_ref = db.ref('/influencers')
    //let snapshot = await influencers_ref.orderByChild('engagement').limitToLast(100).once('value');

    //let influencers = [];
    //snapshot.forEach(item => {
    //  let each = item.val()
    //  each.id = item.key
    //  each.relevance = calculate_relevance()
    //  influencers.push(each);
    //});
    //influencers.reverse()
    //filePath = path.join(__dirname, '../config/data.json')
    //fs.readFile(filePath, encoding = 'utf-8', (err, data) => {
    //  if (!err) {
    //    influencerdata = JSON.parse(data);
    //    influencers = influencerdata.influencers;
    //    let result = []
    //    for (i in influencers) {
    //      influencers[i].relevance = 100
    //      influencers[i].id = i
    //      result.push(influencers[i])
    //    }
    //    result.sort((a, b) => {
    //      return b.engagement - a.engagement
    //    });
    //    res.send(result)
    //  } else {
    //    log(err, {in: '../routes/get/v0/influencers',  msg: 'trouble reading file'});
    //    res.status(500).send(err);
    //  }
    //})

    try {
      //if (!req.body.page) {
      //  req.body.page = 0
      //}
      //if (!req.body.filter) {
      //  req.body.filter = 'engagement'
      //}
      //let influencers = await db.get_all(req.body.page, req.body.filter)
      //res.send(influencers)
      keys = req.body.query.split(' ')
      let result = await db.get_influencers_by(keys)
      res.send(result)
    } catch (error) {
      error.endpoint = 'GET /v0/influencers'
      error.request = req.body
      log.warning(error)
      res.status(500).send(error)
    }
  });


  // function calculate_relevance() {
  //   //TODO
  //   return 1
  // }


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
  )

  // async function checkuserexists(username) {
  //   let ref = db.ref('/influencers')
  //   let snapshot = await ref.once('value')
  //   let influencernames = {}
  //   snapshot.forEach((item) => {
  //     name = item.val().username
  //     influencernames[name] = item.key
  //   });
  //   if (username in influencernames) {
  //     return {
  //       uid: influencernames[username],
  //       username: username
  //     }
  //   } else { return false }

  // }

  module.exports = router;
}
catch (error) {
  console.log(error)
  log.error(error, {in: '/routes/influencers.js'})
}