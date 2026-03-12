const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./reading_list')

User.hasMany(Blog, { as: 'all_blogs' })
Blog.belongsTo(User)

User.belongsToMany(Blog, { through: ReadingList, as: 'readings' })
Blog.belongsToMany(User, { through: ReadingList, as: 'users_reading' })


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
  Blog, User, ReadingList
}