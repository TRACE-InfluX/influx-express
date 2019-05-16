var express = require('express')
var router = express.Router()
var db = require('../database/influencers')
var authorize = require('../auth/token')
var validate = require('../validation')
var influencer = require('../models/influencer')
var log = require('../notifications')

// temp imports
var fs = require('fs')
var path = require('path')

 router.get('/popular', async (req, res, next) => {
  
     //let influencers_ref = db.ref('/influencers')
     //let snapshot = await influencers_ref.orderByChild('followers').limitToLast(4).once('value');
   filePath = path.join(__dirname, '../config/data.json')
   fs.readFile(filePath, encoding = 'utf-8', (err, data) => {
     if (!err) {
       influencerdata = JSON.parse(data);
       influencers = influencerdata.influencers;
       let result = []
       for (i in influencers) {
         influencers[i].relevance = 100
         influencers[i].id = i
         result.push(influencers[i])
       }

       result.sort((a, b) => {
         return b.followers - a.followers;
       });
       final_result = []
       final_result.push(result[0], result[1], result[2], result[3])
       res.send(final_result)
     } else {
       log(err, { in: '../routes/influencers/get/v0/influencers/popular'});
       res.status(500).send(err);
     }
   })  
 })

 router.get('/', async (req, res, next) => {
   try {
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
     filePath = path.join(__dirname, '../config/data.json')
     fs.readFile(filePath, encoding = 'utf-8', (err, data) => {
       if (!err) {
         influencerdata = JSON.parse(data);
         influencers = influencerdata.influencers;
         let result = []
         for (i in influencers) {
           influencers[i].relevance = 100
           influencers[i].id = i
           result.push(influencers[i])
         }
         result.sort((a, b) => {
           return b.engagement - a.engagement
         });
         res.send(result)
       } else {
         log(err, {in: '../routes/get/v0/influencers',  msg: 'trouble reading file'});
         res.status(500).send(err);
       }
     })
   }
   catch (error) {
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