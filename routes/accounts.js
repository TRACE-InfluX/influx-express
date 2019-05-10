var express = require('express')
var router = express.Router()
var auth = require('../auth')
var credentials = require('../models/credentials')
var validate = require('../validation')

router.post('/',
  validate(credentials),
  async (req, res) => {

    let email    = req.body.email
    let password = req.body.password

    try {
      await auth.createUserWithEmailAndPassword(email, password)
      let login = await auth.signInWithEmailAndPassword(email, password)
      let token = await login.user.getIdToken()
      return res.send({ message: 'Signed up!', token })
    }
    catch (error) {
      return res.status(401).send(error)
    }

  }
)

module.exports = router