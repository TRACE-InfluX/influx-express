module.exports = {
  required: {
    "name": String(),
    "username": String(),
    "url": String(),
    "profile_image": String(),
    "description": String(),
    "location": String(),
    "followers": Number(),
    "following": Number(),
    "posts": Number(),
    "activity": Number(),
    "engagement": Number(),
    "weights": Object(),
    "preview": Array(),
    "profit": Number(),
    "cost": Number()
  }
}