require('dotenv').config()
const jwt = require('jsonwebtoken')
function ensureToken(req, res, next) {
    const authHeader = req.get("authHeader")
    console.log("header", authHeader)
    console.log("authHeader is_found? ", authHeader===undefined)
    // return
    if(authHeader !== undefined) {
      const barearToken = authHeader.split(" ")
      const token = barearToken[1]
      if(!token) {
        return res.sendStatus(403)
         
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if(err) {
          res.sendStatus(403)
        }
        req.token = token
        req.user = data
        next()
      })
    } else {
      return res.sendStatus(403)
    }
  }

  module.exports = ensureToken