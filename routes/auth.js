var router = require('express').Router()
var auth = require('../auth')
var credentials = require('../models/credentials')
var validate = require('../validation')

router.post('/', 
  validate(credentials),
  async (req, res) => {
    try {
      let login  = await auth.signInWithEmailAndPassword(req.body.email, req.body.password)
      let token  = await login.user.getIdToken()
      return res.send({ message: 'Logged in!', token })
    }
    catch (error) {
      return res.status(401).send(error)
    }
  }
)

module.exports = router
