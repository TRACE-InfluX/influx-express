module.exports = (async function(){
  try {
    var express = require('express')
    var path = require('path')
    var cookieParser = require('cookie-parser')
    var logger = require('morgan')
    var cors = require('cors')
    
    var accountsRouter = require('./routes/accounts')
    var auth = require('./routes/auth')
    var influencerrouter = require('./routes/influencers')
    
    var app = express()
    var passport = require('passport')
    app.use(passport.initialize())
    app.use(cors())
    app.options("*", cors())
    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())
    app.use(express.static(path.join(__dirname, 'docs')))
    app.use('/v0/accounts', accountsRouter)
    app.use('/v0/auth', auth)
    app.use('/v0/influencers', influencerrouter)
    
    var log = require('./notifications')
    log.success('Server Online')
    var influencer = require('./database/influencers')
    var json_data = {
      "activity": 45.08483224767061,
      "description": "#🇨🇳 #Beijinger \n#compsci #👩🏻‍💻\n#HuaWei P20 Pro #📱\n#Canon 70D #📷",
      "engagement": 15.980825958702063,
      "followers": 1130,
      "following": 188,
      "location": "Beijing",
      "name": "Toni yeet yeet | 183 🇨🇳",
      "posts": 286,
      "profile_image": "https://scontent-sea1-1.cdninstagram.com/vp/df0cfd218a9919ef23ac7ba6e1bd297f/5D72137C/t51.2885-19/s320x320/47689827_2035135853219672_6837256625749753856_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com",
      "url": "https://www.instagram.com/serotoninplus/",
      "username": "@serotoninplus",
      "valuation": 3004.3952802359877,
      "weights": {yeet: 3000, coffee: 500, traveling: 10}
    }
    var response = await influencer.add(json_data)
    log.info(response)
    return app
  }
  catch (error) {
    log.error(error, { in: '../app.js' })
  }
})()