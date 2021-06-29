const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ChatSchema = new Schema(
  {
    chatName: {
      type: String,
      trim: true,
    },
    isGroupChat: {
      type: Bollean,
      default: false,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Users',
      },
    ],
    latestMessage: {type: Schema.Types.ObjectId, ref: 'Message'}
  },
  { timestamps: true }
)

var Chat = mongoose.model('Chat', UserSchema)

module.exports = Chat
