const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', async (req, res, next) => {
  let searchObj = req.query
  if (searchObj.isReply !== undefined) {
    let isReply = searchObj.isReply == 'true'
    searchObj.replyTo = { $exists: isReply }
    delete searchObj.isReply
  }
  if (searchObj.followingOnly !== undefined) {
    let followingOnly = searchObj.followingOnly == 'true'
    let objectsId = []
    if (followingOnly) {
      req.session.user.following.forEach((user) => {
        objectsId.push(user)
      })
      objectsId.push(req.session.user._id)
      searchObj.postedBy = { $in: objectsId }
    }
    delete searchObj.followingOnly
  }
  let result = await getPosts(searchObj)

  res.status(200).send(result)
})
router.get('/:id', async (req, res, next) => {
  let postId = req.params.id
  let postData = await getPosts({ _id: postId })

  postData = postData[0]

  let results = { postData: postData }
  if (postData.replyTo !== undefined) {
    results.replyTo = postData.replyTo
  }
  results.replies = await getPosts({ replyTo: postId })
  res.status(200).send(results)
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
  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo
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
router.post('/:id/retweet', async (req, res, next) => {
  let postId = req.params.id
  let { _id: userId, likes } = req.session.user

  // Try and delete retweet
  let deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  }).catch((err) => {
    console.log(err)
    res.sendStatus(400)
  })

  let option = deletedPost != null ? '$pull' : '$addToSet'
  let repost = deletedPost

  if (repost == null) {
    repost = await Post.create({
      postedBy: userId,
      retweetData: postId,
    }).catch((err) => {
      console.log(err)
      res.sendStatus(400)
    })
    console.log(repost)
  }

  req.session.user = await User.findByIdAndUpdate(
    userId,
    {
      [option]: { retweets: repost._id },
    },
    { new: true }
  ).catch((err) => {
    console.log(err)
    res.sendStatus(400)
  })

  let post = await Post.findByIdAndUpdate(
    postId,
    {
      [option]: { retweetUsers: userId },
    },
    { new: true }
  ).catch((err) => {
    console.log(err)
    res.sendStatus(400)
  })

  res.status(200).send(post)
})
router.delete('/:id', async (req, res, next) => {
  let postId = req.params.id
  // My changes \ retweet delete error
  Post.findByIdAndDelete(postId)
    .then((deleted) => {
      if (!deleted.retweetData) {
        Post.findOneAndDelete({
          retweetData: postId,
        })
          .then(() => res.sendStatus(202))
          .catch(() => res.sendStatus(400))
      }
      res.sendStatus(202)
    })
    .catch(() => res.sendStatus(400))
})
module.exports = router

async function getPosts(filter) {
  let results = await Post.find(filter)
    .populate('postedBy')
    .populate('retweetData')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .catch((err) => console.log(err))
  results = await User.populate(results, { path: 'replyTo.postedBy' })
  return await User.populate(results, { path: 'retweetData.postedBy' })
}
