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
    "valuation": Number(),
    "weights": Object(),
    "preview": Array(),
    "reach": Number(),
    "conversion": Number(),
    "cost": Number()
  }
}