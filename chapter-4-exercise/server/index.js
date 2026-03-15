
const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logoutRouter = require('./controllers/logout')
const authorRouter = require('./controllers/author')
const resetRouter = require('./controllers/reset')
const readingListRouter = require('./controllers/readinglists')

const { errorHandler } = require('./middleware/errorHandling')
const { unknownEndpoint } = require('./middleware/unknownEndpoint')

app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).end()
})

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/logout', logoutRouter)
app.use('/api/authors', authorRouter)
app.use('/api/reset', resetRouter)
app.use('/api/readinglists', readingListRouter)

app.use(unknownEndpoint)

app.use(errorHandler)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
