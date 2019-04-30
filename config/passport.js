var express = require('express');
var router = express.Router();
var db = require('./database').db;
var firebase = require('./database').firebase;
var admin = require('./database').admin;
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer')

passport.use(new BearerStrategy((token, done) => {
    admin.auth().verifyIdToken(token).then((result) => {
        console.log("verified");
        return done(null, result.uid);
    }).catch((error) => {
        console.log("error");
        done(error);
    });
}));

module.exports = passport;