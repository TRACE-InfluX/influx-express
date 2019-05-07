var express = require('express');
var router = express.Router();
var db = require('../config/database').db;

router.get('/', async (req, res, next) => {
    try {
        let influencers_ref = db.ref('/influencers')
        let snapshot = await influencers_ref.orderByChild('followers').limitToLast(4).once('value');

        let influencers = [];
        snapshot.forEach(item => {
            let each = item.val()
            each.id = item.key
            each.relevance = 1
            influencers.push(each);
        });
        influencers.reverse()
        res.send(influencers);
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error });
    }
});

module.exports = router;