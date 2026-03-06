const Blog = require('./blog')
const User = require('./user')

User.hasMany(Blog)
Blog.belongsTo(User)

// recreate the column during init if they were deleted
// ORDER MATTERS HERE! BLOG HAS FOREIGN KEY REFERENCING USER
// IF USER DOESN'T EXIST THEN ERROR!
await User.sync({ alter: true })
await Blog.sync({ alter: true })

module.exports = {
  Blog, User
}