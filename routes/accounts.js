var express = require('express');
var router = express.Router();
var db = require('../config/database').db;
var firebase = require('../config/database').firebase;
var admin = require('../config/database').admin;
var passport = require('../config/passport');

router.post('/',
  async (req, res, next) => {

    if (!req.body.email) {
      return res.status(400).json({ error: 'missing email' });
    }

    if (!req.body.password) {
      return res.status(400).json({ error: 'missing password' });
    }

    try {
      let resfb = await firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
      let uid = resfb.user.uid;

      db.ref('users/' + uid).set({
        email: req.body.email,
        name: ''
      })

      res.send({ message: 'Signed up!', uid: uid });
    }
    catch (error) {
      res.status(500).json({ error })
    }
  }
);

router.get('/',
  passport.authenticate('adminbearer', { session: false }),
  async (req, res, next) => {

    const maxResults = 100;

    try {
      let userRecords = await admin.auth().listUsers(maxResults)

      let data = userRecords.users.map(user => {

        let the_user = {
          uid: user.uid,
          email: user.email
        }
        if (user.customClaims) {
          the_user.is_admin = true
        }
        return the_user

      });

      res.send(data);
    }
    catch (error) {
      res.status(500).json({ error })
    }
  }
);

module.exports = router;