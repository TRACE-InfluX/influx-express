var express = require('express');
var router = express.Router();
var db = require('../config/database').db;
var firebase = require('../config/database').firebase;

router.post('/', function (req, res, next) {
    if (!req.body.email) return res.status(400).json({ error: 'missing email' });
    if (!req.body.password) return res.status(400).json({ error: 'missing password' });
    
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then((resfb) => {
        let uid = resfb.user.uid;
        console.log(resfb.user.uid);
        res.send({ message: 'Signed up!', uid: uid });
    }).catch(console.err);
});


router.get('/', function (req, res, next) {

});
module.exports =router;