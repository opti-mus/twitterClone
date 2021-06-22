const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const router = express.Router()

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res, next) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/')
    })
  }
})
module.exports = router
