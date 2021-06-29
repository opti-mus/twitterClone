const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const User = require('../schemas/UserSchema')

router.get('/', (req, res, next) => {
  let payload = createPayload(req.session.user)
  res.status(200).render('searchPage', payload)
})
router.get('/:selectedTab', (req, res, next) => {
  let payload = createPayload(req.session.user)
  
  payload.selectedTab = req.params.selectedTab
  console.log(payload.selectedTab)
  res.status(200).render('searchPage', payload)
})
function createPayload(userLoggedIn) {
  return {
    name: 'Search',
    userInfo: userLoggedIn,
    userInfoJs: JSON.stringify(userLoggedIn),
  }
}

module.exports = router
