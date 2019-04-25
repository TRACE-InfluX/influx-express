var express = require('express');
var router = express.Router();
var firebase = require('../config/database').firebase;

router.post('/', function (req, res, next) {
    if (!req.body.email) return res.status(400).json({ error: 'missing email' });
    if (!req.body.password) return res.status(400).json({ error: 'missing password' });

    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(async(resfb) => {
        let uid = await resfb.user.getIdToken();
        console.log(resfb.user)
        res.send({ message: 'Logged in!', uid: uid });
    })
    
});

module.exports = router;