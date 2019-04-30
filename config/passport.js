var express = require('express');
var admin = require('./database').admin;
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer')

//take token from bearer auth header
passport.use('adminbearer', new BearerStrategy((token, done) => {
    //verify token on firebase admin, catch the error or resolve promise
    admin.auth().verifyIdToken(token).then((result) => {
        //check if admin
        if (result.admin) {
            //return user uid accessed by request in http request method handlers
            //returns a 200 if all ok
            return done(null, result.uid);
        } else {
            //returns a 401 if second argument is false
            return done(null, false);
        }
    }).catch((error) => {
        return done(error);
    });
}));

module.exports = passport;