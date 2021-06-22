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
const cartRoutes = require('./routes/cartRoutes')

app.use('/login', loginRoute)
app.use('/register', registerRoute)
app.use('/cart', cartRoutes)

app.get('/', middleware.requireLogin, (req, res, next) => {
  let payload = {
    name: 'Main',
  }
  res.status(200).render('home', payload)
})
