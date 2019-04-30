var express = require('express');
var router = express.Router();
var db = require('../config/database').db;
var firebase = require('../config/database').firebase;
var admin = require('../config/database').admin;
var passport = require('../config/passport');
router.post('/', function (req, res, next) {
    if (!req.body.email) return res.status(400).json({ error: 'missing email' });
    if (!req.body.password) return res.status(400).json({ error: 'missing password' });
    
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then((resfb) => {
        let uid = resfb.user.uid;
        console.log(resfb.user.uid);

        db.ref('users/' + uid).set({
            email: req.body.email,
            name: ''
        }).catch((error) => {
            console.log(error);
        });

        res.send({ message: 'Signed up!', uid: uid });
    }).catch(console.err);
});


router.get('/', passport.authenticate('bearer', { session: false }), function (req, res, next) {
    //checks to see if the authorization header is there
    if (!req.headers.authorization) {
    } else {
        var authorizationpayload = req.headers.authorization.split(' ');
        //checks to see if it is bearer token somewhere
        if (authorizationpayload.length === 2 && authorizationpayload[0] === "Bearer") {
            var idToken = authorizationpayload[1];
            //above splits bearer word and token itself 
            //verify token, if success respond with a list of users
            admin.auth().verifyIdToken(idToken).then(function (result) {
                //stuff goes here to return 
                admin.auth().getUser(result.uid).then((record) => {
                    if (record.customClaims) {
                        const maxResults = 100;
                        admin.auth().listUsers(maxResults).then((userRecords) => {
                            var arrayofusers = userRecords.users;
                            let arrayofstuff = [];
                            for (let user of arrayofusers) {
                                let the_user = {
                                    uid: user.uid,
                                    email: user.email
                                }
                                if (user.customClaims) {
                                    the_user.is_admin = true
                                }
                                arrayofstuff.push(the_user);
                            }
                            res.send(arrayofstuff);
                        });
                    } else {
                        res.send({
                            message: "ur not an admin boi"
                        });
                    }
                });
                
            }).catch((error) => {
                console.log(error);
            });
        }
    
    }
});
module.exports =router;