const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const upload = multer({ dest: 'uploads/' })
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')
const Notification = require('../../schemas/NotificationSchema')

app.use(bodyParser.urlencoded({ extended: false }))
router.get('/', async (req, res, next) => {
  var searchObj = req.query
  if (searchObj.search != undefined) {
    searchObj = {
      $or: [
        { firstName: { $regex: searchObj.search, $options: 'i' } },
        { lastName: { $regex: searchObj.search, $options: 'i' } },
        { username: { $regex: searchObj.search, $options: 'i' } },
      ],
    }
  }
  User.find(searchObj)
    .then((results) => res.status(200).send(results))
    .catch((err) => res.sendStatus(400))
})
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

  if (!isFollowing) {
    await Notification.insertNotification(
      userId,
      req.session.user._id,
      'follow',
      req.session.user._id
    )
  }

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
router.post(
  '/profilePicture',
  upload.single('croppedImage'),
  async (req, res, next) => {
    if (!req.file) {
      console.log('no file uploaded with ajax req')
      return res.sendStatus(400)
    }
    var filePath = `/uploads/images/${req.file.filename}.png`
    var tempPath = req.file.path
    var targetPath = path.join(__dirname, `../../${filePath}`)

    fs.rename(tempPath, targetPath, async (error) => {
      if (error != null) {
        console.log(error)
        return res.sendStatus(400)
      }
      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        {
          profilePic: filePath,
        },
        { new: true }
      )
      res.sendStatus(204)
    })
  }
)
router.post(
  '/coverPhoto',
  upload.single('croppedImage'),
  async (req, res, next) => {
    if (!req.file) {
      console.log('no file uploaded with ajax req')
      return res.sendStatus(400)
    }
    var filePath = `/uploads/images/${req.file.filename}.png`
    var tempPath = req.file.path
    var targetPath = path.join(__dirname, `../../${filePath}`)

    fs.rename(tempPath, targetPath, async (error) => {
      if (error != null) {
        console.log(error)
        return res.sendStatus(400)
      }
      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        {
          coverPhoto: filePath,
        },
        { new: true }
      )
      res.sendStatus(204)
    })
  }
)
module.exports = router
