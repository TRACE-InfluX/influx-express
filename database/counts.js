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

let increment = async () => {
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
    
    keys = keys.map(k => { return { key: k } })
    log.info(keys)

    let query = {
      $or: keys
    }
    //const count = await db.open('influencer-counts')
    //let data = await count.find({ query }, { key: 1, count: 1, _id: 0 }).toArray()

    //let result = {}
    //for (let weight of data) {
    //  result[weight.key] = weight.count
    //}

    //for (let key of keys) {
    //  if (result[key]) {

    //  }
    //}
    let ref = await db.open('influencer-counts')
    //if (count) {
    //  count++
    //  let res = await ref.updateOne({ key }, { $set: { count } })
    //  return res
    //} else {
    //  let res = await create(key)
    //  return res
    //}
    let res = await ref.updateMany(query, { $inc: { count: 1 }, $set: keys }, { upsert: true })
    return res
  }
  catch (error) {
    log.error(error, { in: '../database/counts.increment/1' })
  }
}

const decrement = async () => {
  try {
    let count = await get(key)
    const ref = await db.open('influencer-counts')
    count--
    let res = await ref.updateOne({ key }, { $set: { count } })
    if (!res.nModified) {
      create(key)
    }
    return res
  }
  catch (error) {
    log.error(error, { in: '../database/counts.decrement/1' })
  }
}

const create = async () => {
  try {

    const ref = await db.open('influencer-counts')
    var newdata = { key, count: 1 }
    var res = await ref.insertOne(newdata)
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