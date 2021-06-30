const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../schemas/UserSchema')
const Chat = require('../schemas/ChatSchema')

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
router.get('/:chatId', async (req, res, next) => {
  var userId = req.session.user._id
  var chatId = req.params.chatId
  var isValid = mongoose.isValidObjectId(chatId)

  var payload = {
    name: 'Chat',
    userInfo: req.session.user,
    userInfoJs: JSON.stringify(req.session.user),
  }
  if (!isValid) {
    payload.errorMessage =
      'Chat does not exist or you do not have permision to view it'
    return res.status(200).render('chatPage', payload)
  }
  var chat = await Chat.findOne({
    _id: chatId,
    users: {
      $elemMatch: {
        $eq: userId,
      },
    },
  }).populate('users')

  if (chat == null) {
    //  Check if chat id really use id
    var userFound = await User.findById(chatId)
    console.log(userFound)
    if (userFound != null) {
      // payload.errorMessage = ''
      chat = await getChatByUserId(userFound._id, userId)
    }
  }
  if (chat == null) {
    payload.errorMessage =
      'Chat does not exist or you do not have permision to view it'
  } else {
    payload.chat = chat
  }
  res.status(200).render('chatPage', payload)
})

function getChatByUserId(userLoggedInId, otherUsersId) {
  return Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          {
            $elemMatch: {
              $eq: mongoose.Types.ObjectId(userLoggedInId),
            },
          },
          {
            $elemMatch: {
              $eq: mongoose.Types.ObjectId(otherUsersId),
            },
          },
        ],
      },
    },
    {
      $setOnInsert: {
        users: [userLoggedInId, otherUsersId],
      },
    },
    { new: true, upsert: true }
  ).populate('users')
}

module.exports = router
