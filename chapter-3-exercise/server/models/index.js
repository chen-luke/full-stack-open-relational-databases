const Blog = require('./blog')
const User = require('./user')

User.hasMany(Blog)
Blog.belongsTo(User)

// recreate the column during init if they were deleted
// ORDER MATTERS HERE! BLOG HAS FOREIGN KEY REFERENCING USER
// IF USER DOESN'T EXIST THEN ERROR!

const initialize = async () => {
  await User.sync({ alter: true })
  await Blog.sync({ alter: true })
}

// We need to use initialize to fix race conditions of setting up
// User and Blog so that Blog doesn't complain it doesn't see User's foreign key
// and crash the CI/CD github action test
initialize()

module.exports = {
  Blog, User
}