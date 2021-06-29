const express = require('express')
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('./database')
const session = require('express-session')

const app = express()

const port = 3001

const server = app.listen(port, () => console.log(`Port on ${port}`))

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

// Session
app.use(
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

// Api routes
const postApiRoutes = require('./routes/api/posts')
const usersApiRoutes = require('./routes/api/users')

app.use('/login', loginRoute)
app.use('/register', registerRoute)
app.use('/logout', logoutRoute)
app.use('/posts', middleware.requireLogin, postRoute)
app.use('/profile', middleware.requireLogin, profileRoute)
app.use('/uploads', uploadRoutes)
app.use('/search', middleware.requireLogin, searchRoutes)
app.use('/messages', middleware.requireLogin, messagesRoutes)

app.use('/api/posts', postApiRoutes)
app.use('/api/users', usersApiRoutes)

app.get('/', middleware.requireLogin, (req, res, next) => {
  let payload = {
    name: 'Home',
    userInfo: req.session.user,
    userInfoJs: JSON.stringify(req.session.user),
  }
  res.status(200).render('home', payload)
})
