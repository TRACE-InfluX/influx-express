var admin = require('./admin')
var passport = require('passport')
var BearerStrategy = require('passport-http-bearer')

//take token from bearer auth header
passport.use('admin', new BearerStrategy(
  async (token, done) => {
    //verify token on firebase admin, catch the error or resolve promise
    try {
      let res = await admin.verifyIdToken(token)
      if (res.admin) {
        //return user uid accessed by request in http request method handlers
        //returns a 200 if all ok
        return done(null, res.uid)

      } else {
        //returns a 401 if second argument is false
        return done(null, false)
      }
    }
    catch(error) {

      done(error)
    }
  }
))

module.exports = function(strategy) {
  
  return passport.authenticate(strategy, { session: false })
}