var express = require('express');
var router = express.Router();
var db = require('../config/database').db;
var firebase = require('../config/database').firebase;
var admin = require("firebase-admin");
var serviceAccount = require("./admin.json");

if(!admin.apps.length){
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://influx-trace.firebaseio.com"
});
}

router.post('/', function (req, res, next) {
    if (!req.body.email) return res.status(400).json({ error: 'missing email' });
    if (!req.body.password) return res.status(400).json({ error: 'missing password' });

    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(async(resfb) => {
        let uid = await resfb.user.getIdToken();
        console.log(resfb.user);
        console.log(req.headers);
        res.send({ message: 'Logged in!', idToken: uid });
    })
    
});

router.get('/', function (req, res, next) {

    const maxResults = 100; 

    admin.auth().listUsers(maxResults).then((userRecords) => {
      userRecords.users.forEach((user) => console.log(user.toJSON()));
      res.end('Retrieved users list successfully.');
    }).catch((error) => console.log(error));


});

module.exports = router;