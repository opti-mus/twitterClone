const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res, next) => {
  Post.find()
    .populate('postedBy')
    .sort({ createdAt: -1 })
    .then((list) => {
      res.status(200).send(list)
    })
    .catch((err) => {
      console.log(err)
      res.sendStatus(400)
    })
})
router.post('/', async (req, res, next) => {
  if (!req.body.content) {
    console.log('No content')
    return res.sendStatus(400)
  }
  let postData = {
    content: req.body.content,
    postedBy: req.session.user,
  }
  Post.create(postData)
    .then(async (newPost) => {
      newPost = await User.populate(newPost, { path: 'postedBy' })
      res.status(201).send(newPost)
    })
    .catch((err) => {
      console.log(err)
      res.sendStatus(400)
    })
})
router.put('/:id/like', async (req, res, next) => {
  let postId = req.params.id
  let { _id: userId, likes } = req.session.user

  let isLiked = likes && likes.includes(postId)
  let option = isLiked ? '$pull' : '$addToSet'
  // Insert user like
  req.session.user = await User.findByIdAndUpdate(
    userId,
    {
      [option]: { likes: postId },
    },
    { new: true }
  ).catch((err) => {
    console.log(err)
    res.sendStatus(400)
  })
  // Insert post like
  let post = await Post.findByIdAndUpdate(
    postId,
    {
      [option]: { likes: userId },
    },
    { new: true }
  ).catch((err) => {
    console.log(err)
    res.sendStatus(400)
  })

  res.status(200).send(post)
})
module.exports = router
