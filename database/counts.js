var log = require('../notifications')
var db = require('../database')

const get = async () => {
  try {
    let args = Array.prototype.slice.call(arguments)
    let keys = []
    if (typeof args[0] == 'string') {
      for (let key of args) {
        if (typeof key != 'string') {
          throw 'Expected all arguments to be type: String'
        }
        keys.push(key)
      }
    }
    else if (Array.isArray(args[0])) {
      for (let key of args[0]) {
        if (typeof key != 'string') {
          throw 'Expected all arguments to be type: String'
        }
        keys.push(key)
      }
    }
    else if (args[0]) {
      keys = Object.keys(args[0])
    }

    let query = {
      $or: keys.map(k => { return { key: k } })
    }
    const count = await db.open('influencer-counts')
    const data = await count.find({ query }, { key: 1, count: 1, _id: 0}).toArray()
    let result = {}
    for (let weight of data) {
      result[weight.key] = weight.count
    }

    return result 
  }
  catch (error) {
    log.error(error, { in: '../database/counts.get/1' })
  }
}

let increment = async function(){
  try {
    let args = Array.prototype.slice.call(arguments)
    let keys = []
    if (typeof args[0] == 'string') {
      for (let key of args) {
        if (typeof key != 'string') {
          throw 'Expected all arguments to be type: String'
        }
        keys.push(key)
      }
    }
    else if (Array.isArray(args[0])) {
      for (let key of args[0]) {
        if (typeof key != 'string') {
          throw 'Expected all arguments to be type: String'
        }
        keys.push(key)
      }
    }
    else if (args[0]) {
      keys = Object.keys(args[0])
    }
    let ref = await db.open('influencer-counts')
    
    let transactions = keys.map(key => {
      return { updateOne: { filter: { key }, update: { $inc: { count: 1 } }, upsert: true } }
    })

    let res = await ref.bulkWrite(transactions)

    return res
  }
  catch (error) {
    log.error(error, { in: '../database/counts.increment/1' })
  }
}

const decrement = async function(){
  try {
    let args = Array.prototype.slice.call(arguments)
    let keys = []
    if (typeof args[0] == 'string') {
      for (let key of args) {
        if (typeof key != 'string') {
          throw 'Expected all arguments to be type: String'
        }
        keys.push(key)
      }
    }
    else if (Array.isArray(args[0])) {
      for (let key of args[0]) {
        if (typeof key != 'string') {
          throw 'Expected all arguments to be type: String'
        }
        keys.push(key)
      }
    }
    else if (args[0]) {
      keys = Object.keys(args[0])
    }
    let ref = await db.open('influencer-counts')

    let transactions = keys.map(key => {
      return { updateOne: { filter: { key }, update: { $inc: { count: -1 } }, upsert: true } }
    })

    let res = await ref.bulkWrite(transactions)

    return res
  }
  catch (error) {
    log.error(error, { in: '../database/counts.decrement/1' })
  }
}

module.exports = {
  get,
  increment,
  decrement
}