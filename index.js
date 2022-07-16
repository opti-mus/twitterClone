const express = require('express')
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('./database')
const session = require('express-session')

const index = express()

const port = 3001

const server = index.listen(port, () => console.log(`Port on ${port}`))
const io = require('socket.io')(server, { pingTimeout: 60000 })

index.set('view engine', 'pug')
index.set('views', 'views')

index.use(bodyParser.urlencoded({ extended: false }))
index.use(express.static(path.join(__dirname, 'public')))

// Session
index.use(
  session({
    secret: 'chickens',
    resave: true,
    saveUninitialized: false,
  })
)

// Routes
const loginRoute = require('./routes/loginRoutes')
const registerRoute = require('./routes/registerRoutes')
const logoutRoute = require('./routes/logoutRoutes')
const postRoute = require('./routes/postRoutes')
const profileRoute = require('./routes/profileRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const searchRoutes = require('./routes/searchRoutes')
const messagesRoutes = require('./routes/messagesRoutes')
const notificationsPage = require('./routes/notificationsRoutes')

// Api routes
const postApiRoutes = require('./routes/api/posts')
const usersApiRoutes = require('./routes/api/users')
const chatsApiRoutes = require('./routes/api/chats')
const messagesApiRoutes = require('./routes/api/messages')
const notificationApiRoutes = require('./routes/api/notifications')

index.use('/login', loginRoute)
index.use('/register', registerRoute)
index.use('/logout', logoutRoute)
index.use('/posts', middleware.requireLogin, postRoute)
index.use('/profile', middleware.requireLogin, profileRoute)
index.use('/uploads', uploadRoutes)
index.use('/search', middleware.requireLogin, searchRoutes)
index.use('/messages', middleware.requireLogin, messagesRoutes)
index.use('/notifications', middleware.requireLogin, notificationsPage)

index.use('/api/posts', postApiRoutes)
index.use('/api/users', usersApiRoutes)
index.use('/api/chats', chatsApiRoutes)
index.use('/api/messages', messagesApiRoutes)
index.use('/api/notifications', notificationApiRoutes)

index.get('/', middleware.requireLogin, ( req, res, next) => {
  let payload = {
    name: 'Home',
    userInfo: req.session.user,
    userInfoJs: JSON.stringify(req.session.user),
  }
  res.status(200).render('home', payload)
})
io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData._id)
    socket.emit('connected')
  })
  socket.on('join room', (room) => {
    socket.join(room)
  })
  socket.on('typing', (room) => {
    socket.in(room).emit('typing')
  })
  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing')
  })
  socket.on('notification received', (room) => {
    socket.in(room).emit('notification received')
  })
  socket.on('new message', (newMessage) => {
    var chat = newMessage.chat
    if (!chat) {
      return console.log('chat user is not defined')
    }
    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) {
        return
      }
      socket.in(user._id).emit('message received', newMessage)
    })
  })
})
