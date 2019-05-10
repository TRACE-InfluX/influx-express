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
        return done(null, res)

      } else {
        //returns a 401 if second argument is false
        return done({ error : 'Unauthorized' }, false)
      }
    }
    catch(error) {
      return done(error, false)
    }
  }
))

module.exports = function(strategy) {
  return (req,res,next) => {
    passport.authenticate(strategy, { session: false },
      (error,user) => {
        if (error) return res.status(401).send(error)
        if (user) {
          req.user = user
          return next()
        }
      }
    )(req,res,next)
  }
}