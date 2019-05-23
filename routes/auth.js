var router = require('express').Router()
var auth = require('../auth')
var credentials = require('../models/credentials')
var validate = require('../validation')
try{
  router.post('/', 
  validate(credentials),
  async (req, res) => {
    try {
      let login  = await auth.signInWithEmailAndPassword(req.body.email, req.body.password).catch(error => {
        res.status(401).send(error)
      })
      let token  = await login.user.getIdToken()
      res.send({ message: 'Logged in!', token})
    }
    catch (error) {
      res.status(401).send(error)
    }
  }
)

module.exports = router

}catch(error) {
  console.log(error)
}
