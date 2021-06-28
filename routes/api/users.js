const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.put('/:userId/follow', async (req, res, next) => {
  let userId = req.params.userId
  let user = await User.findById(userId)

  if (!user) return res.sendStatus(404)

  let isFollowing =
    user.followers && user.followers.includes(req.session.user._id)

  let option = isFollowing ? '$pull' : '$addToSet'

  // Following/unfollowing user
  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    { [option]: { following: userId } },
    { new: true }
  ).catch((err) => {
    console.log(err)
    res.sendStatus(400)
  })
  // Add/remove followers
  User.findByIdAndUpdate(userId, {
    [option]: { followers: req.session.user._id },
  }).catch((err) => {
    console.log(err)
    res.sendStatus(400)
  })

  res.status(200).send(req.session.user)
})
router.get('/:userId/followings', async (req, res, next) => {
  let userId = req.params.userId
  let user = await User.findById(userId)
    .populate('following')
    .then((result) => {
      res.status(200).send(result)
    })
    .catch((err) => {
      res.sendStatus(400)
    })
})
router.get('/:userId/followers', async (req, res, next) => {
  let userId = req.params.userId
  let user = await User.findById(userId)
    .populate('followers')
    .then((result) => {
      res.status(200).send(result)
    })
    .catch((err) => {
      res.sendStatus(400)
    })
})

module.exports = router
