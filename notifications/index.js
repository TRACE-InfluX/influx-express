var axios = require('axios')
var config = require('../config/notifications')

module.exports = {
  send: (level, msg) => {

    let color =
      level == 'Success' ? 0x33bb33 :
      level == 'Warning' ? 0xbbbb33 :
      level == 'Error' ? 0xbb3333:
      0x666666

    let data = {
      tts: false,
      embeds:[{
        title: `${level} - from ${config.server}`,
        type: 'rich',
        description: msg.toString(),
        color
      }]
    }
    if (config.enable.includes(level)) axios.post(config.url, data)
  }
}