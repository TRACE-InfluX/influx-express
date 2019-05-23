var axios = require('axios')
var config = require('../config/notifications')
var format = require('json-format')

let send = (level, msg) => {

  let color =
    level == 'Error'   ? 0xbb3333:
    level == 'Warning' ? 0xbbbb33 :
    level == 'Info'    ? 0x3333bb :
    level == 'Success' ? 0x33bb33 :
    0x666666

  let options = {
    type: 'space',
    size: 2
  }

  msg = typeof msg === 'object' ? '```JSON\n' + format(msg, options) + '```':
        msg.toString()

  let data = {
    tts: false,
    embeds:[{
      title: `${level} - from ${config.server}`,
      type: 'rich',
      description: msg,
      color
    }]
  }
  if (config.enable.includes(level)) axios.post(config.url, data).catch()
}

module.exports = {
  send,
  error: (error, next) => {

    if (next) {
      if (error.trace) {
        error.trace.push(next)
        throw error
      }
      else {      
        if (!Object.values(error).includes(error.message)) error.msg = error.message
        throw { error, trace: [next] }
      }
    }
    else {
      if (!Object.values(error).includes(error.message)) error.msg = error.message
      send('Error', error)
    }
  },
  warning: msg => { send('Warning', msg) },
  info:    msg => { send('Info', msg) },
  success: msg => { send('Success', msg) },
}