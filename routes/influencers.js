var express = require('express');
var router = express.Router();
var db = require('../config/database').db;
var passport = require('../config/passport');
var check_for_errors = require('../config/validation');
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
      console.log(err);
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
          result.push(influencers[i])
        }
        result.sort((a, b) => {
          return b.engagement - a.engagement
        });
        res.send(result)
      } else {
        console.log(err);
        res.status(500).send(err);
      }
    })
  }
  catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});


function calculate_relevance() {
  //TODO
  return 1
}

router.post('/',
  passport.authenticate('adminbearer', { session: false }),
  async (req, res, next) => {

    // Check JSON
    if (req.headers["content-type"] !== "application/json") {
      return res.status(400).json("Expected JSON parameters")
    }

    // Required Fields
    const required = {
      "name": String(),
      "username": String(),
      "url": String(),
      "profile_image": String(),
      "description": String(),
      "location": String(),
      "followers": Number(),
      "following": Number(),
      "posts": Number(),
      "activity": Number(),
      "engagement": Number(),
      "valuation": Number(),
      "weights": String()
    }

    const errors = check_for_errors(req.body, required)

    if (Object.keys(errors).length) {
      return res.status(422).send(errors)
    }
    result = await checkuserexists(req.body.username)
    if (!result) {
      try {
        let fbref = await db.ref('/influencers').push(req.body)
        let snapshot = await fbref.once('value')
        let created_influencer = snapshot.val()
        created_influencer.id = fbref.key
        return res.status(202).json(created_influencer)
      }
      catch (error) {
        res.status(500).send(error)
      }
    } else {
      try {
        let userref = '/influencers/' + result.uid;
        await db.ref(userref).update(req.body)
        res.status(202).send({ message: "updated user: " + req.body.name })
      } catch (error) {
        res.status(500).send(error)
      }
    }
  }
);

async function checkuserexists(username) {
  let ref = db.ref('/influencers')
  let snapshot = await ref.once('value')
  let influencernames = {}
  snapshot.forEach((item) => {
    name = item.val().username
    influencernames[name] = item.key
  });
  if (username in influencernames) {
    return {
      uid: influencernames[username],
      username: username
    }
  } else { return false }

}

module.exports = router;