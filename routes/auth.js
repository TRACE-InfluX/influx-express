var express = require('express');
var router = express.Router();
var db = require('../config/database').db;
var firebase = require('../config/database').firebase;
var admin = require("../config/database").admin;

if(!admin.apps.length){
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://influx-trace.firebaseio.com"
  });
}

router.post('/', async (req, res, next) => {

    if (!req.body.email) {
      return res.status(400).json({ error: 'missing email' });
    }

    if (!req.body.password) {
      return res.status(400).json({ error: 'missing password' });
    }

    try {
      let resfb   = await firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
      let idToken = await resfb.user.getIdToken();
      let record  = await admin.auth().getUser(resfb.user.uid)
      let adminStatus   = false;
      if (record.customClaims) {
          adminStatus = record.customClaims.admin;
      }
      res.send({ message: 'Logged in!', idToken, admin: adminStatus }); 
    }
    catch (error) {
      res.status(401).json({error})
    }
    
});

module.exports = router;
