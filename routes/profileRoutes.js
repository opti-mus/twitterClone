const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const User = require('../schemas/UserSchema')

router.get('/', (req, res, next) => {
  let payload = {
    name: req.session.user.username,
    userInfo: req.session.user,
    userInfoJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  }
  res.status(200).render('profilePage', payload)
})

router.get('/:username', async (req, res, next) => {
  let username = req.params.username
  let payload = await getPayload(username, req.session.user)
  res.status(200).render('profilePage', payload)
})
router.get('/:username/replies', async (req, res, next) => {
  let username = req.params.username
  let payload = await getPayload(username, req.session.user)
  payload.selectedTab = 'replies'
  res.status(200).render('profilePage', payload)
})
router.get('/:username/followings', async (req, res, next) => {
  let username = req.params.username
  let payload = await getPayload(username, req.session.user)
  payload.selectedTab = 'followings'
  res.status(200).render('followersAndFollowing.pug', payload)
})
router.get('/:username/followers', async (req, res, next) => {
  let username = req.params.username
  let payload = await getPayload(username, req.session.user)
  payload.selectedTab = 'followers'
  res.status(200).render('followersAndFollowing.pug', payload)
})
async function getPayload(username, userLoggedIn) {
  var user = await User.findOne({ username })

  if (!user) {
    user = await User.findById(username)

    if (!user) {
      return {
        name: 'User its not a found!',
        userInfo: userLoggedIn,
        userInfoJs: JSON.stringify(userLoggedIn),
      }
    }
  }
  return {
    name: user.username,
    userInfo: userLoggedIn,
    userInfoJs: JSON.stringify(userLoggedIn),
    profileUser: user,
  }
}
module.exports = router
