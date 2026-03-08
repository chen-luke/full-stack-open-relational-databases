const Note = require('./note')
const User = require('./user')

User.hasMany(Note)
Note.belongsTo(User)

const syncModels = async () => {
  User.sync({ alter: true })
  Note.sync({ alter: true })
}

syncModels()

module.exports = {
  Note, User
}