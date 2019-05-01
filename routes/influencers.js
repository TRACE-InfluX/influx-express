var express = require('express');
var router = express.Router();
var db = require('../config/database').db;
var firebase = require('../config/database').firebase;

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
	}catch(error) {
		res.status(500).json({error});
	}

});
module.exports = router;