const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./reading_list')
const Session = require('./session')

User.hasMany(Blog)
Blog.belongsTo(User)

User.belongsToMany(Blog, { through: ReadingList, as: 'readings' })
Blog.belongsToMany(User, { through: ReadingList, as: 'users_reading' })

// super many-to-many allows us to 
Blog.hasMany(ReadingList, { as: 'reading_list' })
ReadingList.belongsTo(Blog)
User.hasMany(ReadingList)
ReadingList.belongsTo(User)

User.hasMany(Session, { as: 'token_sessions' })
Session.belongsTo(User)
//*--------------------------------------------------------
// Turrning sync() off since we are using migrations

// // recreate the column during init if they were deleted
// // ORDER MATTERS HERE! BLOG HAS FOREIGN KEY REFERENCING USER
// // IF USER DOESN'T EXIST THEN ERROR!

// const initialize = async () => {
//   await User.sync({ alter: true })
//   await Blog.sync({ alter: true })
// }

// // We need to use initialize to fix race conditions of setting up
// // User and Blog so that Blog doesn't complain it doesn't see User's foreign key
// // and crash the CI/CD github action test
// initialize()

module.exports = {
  Blog, User, ReadingList, Session
}