var express = require('express');
var router = express.Router();
var db = require('../config/database').db;
var passport = require('../config/passport');
var check_for_errors = require('../config/validation');

router.get('/', async(req, res, next) => {
	try {
		let snapshot = await db.ref('/influencers').once('value');
		
		let influencers = [];
		snapshot.forEach(item => {
			let each = item.val()
			each.id = item.key
			influencers.push(each);
		});

		res.send(influencers);
  } 
  catch (error) {
		res.status(500).json({error});
	}

});

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
      "url": String(),
      "description": String(),
      "location": String(),
      "followers": Number(),
      "following": Number(),
      "posts": Number(),
      "activity": Number(),
      "engagement": Number(),
      "valuation": Number(),
      "weights": {}
    }
    
    const errors = check_for_errors(req.body, required)

    if (Object.keys(errors).length) {
      return res.status(422).json({errors})
    }

    return res.send({msg: "Valid Input"})

  }
);

module.exports = router;