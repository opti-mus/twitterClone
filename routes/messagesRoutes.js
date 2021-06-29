const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const User = require('../schemas/UserSchema')

router.get('/', (req, res, next) => {
  res.status(200).render('inboxPage', {
    name: 'Inbox',
    userInfo: req.session.user,
    userInfoJs: JSON.stringify(req.session.user),
  })
})
router.get('/new', (req, res, next) => {
  res.status(200).render('newMessage', {
    name: 'New message',
    userInfo: req.session.user,
    userInfoJs: JSON.stringify(req.session.user),
  })
})
module.exports = router
