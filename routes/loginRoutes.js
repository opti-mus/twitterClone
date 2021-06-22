const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const User = require('../schemas/UserSchema')

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res, next) => {
  res.status(200).render('login')
})
router.post('/', async (req, res, next) => {
  let payload = req.body
  let logUsername = payload.logUsername.trim()
  let logPassword = payload.logPassword

  if (logUsername && logPassword) {
    let user = await User.findOne({
      $or: [{ username: logUsername }, { email: logUsername }],
    }).catch((err) => {
      console.log(err)
      payload.errorMessage = 'Something went wrong!'
      res.status(200).render('login', payload)
    })
    if (user != null) {
      // User found
      let result = await bcrypt.compare(logPassword, user.password)
      if (result) {
        req.session.user = user
        return res.redirect('/')
      }
    }
    // user not found
    payload.errorMessage = 'Login credentials incorrect!'
    return res.status(200).render('login', payload)
  }
  payload.errorMessage = 'Make sure each field has a valid value!'
  res.status(200).render('login', payload)
})

module.exports = router
