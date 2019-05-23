var express = require('express')
var router = express.Router()
var auth = require('../auth')
var authorize = require('../auth/token')
var credentials = require('../models/credentials')
var validate = require('../validation')
try{
  router.post('/',
    validate(credentials),
    async (req, res) => {

      let email    = req.body.email
      let password = req.body.password

      try {
        await auth.createUserWithEmailAndPassword(email, password).catch(error => {
          res.status(401).send(error)
        })
        let login = await auth.signInWithEmailAndPassword(email, password)
        let token = await login.user.getIdToken()
        res.send({ message: 'Signed up!', token })
      }
      catch (error) {
        res.status(401).send(error)
      }
    }
  )

  router.get('/me', 
    authorize('user'),
    (req, res) => {
      res.send(req.user)
    }
  )

  module.exports = router
}catch(error) {
  console.log(error)
}