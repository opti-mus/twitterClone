const mongoose = require('mongoose')
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useFindAndModify', false)
// last change
mongoose.set('useCreateIndex', true)
class Datababse {
  constructor() {
    this.connect()
  }
  connect() {
    mongoose
      .connect(
        'mongodb+srv://admin:admin@twitterclonecluster.6nz8a.mongodb.net/twitterCloneDB?retryWrites=true&w=majority',
      )
      .then(() => {
        console.log('DB connect succesful!')
      })
      .catch((err) => {
        console.log('Db connecton error' + err)
      })
  }
}
module.exports = new Datababse()
