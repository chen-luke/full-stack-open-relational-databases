const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const { SECRET } = require('../util/config')
const User = require('../models/user')
const Session = require('../models/session')
const { tokenExtractor } = require('../middleware/middleware')

router.post('/', async (request, response, next) => {

  try {
    const { username, password } = request.body

    if (!username) {
      return response.status(400).end()
    }

    const user = await User.findOne({
      where: {
        username: username
      }
    })

    const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
      return response.status(401).json({
        error: 'invalid username or password'
      })
    }

    if (user.disabled) {
      return response.status(401).json({ error: 'account disabled, please contact admin' })
    }

    const userForToken = {
      username: user.username,
      id: user.id,
    }

    const token = jwt.sign(userForToken, SECRET)

    // add token to session table to track
    await Session.create({ userId: user.id, token: token })

    response
      .status(200)
      .send({ token, username: user.username, name: user.name })
  } catch (error) {
    next(error)
  }

})

router.delete('/', tokenExtractor, async (req, res, next) => {

  try {
    const session = await Session.findOne({ where: { token: req.token } })
    if (!session) {
      return res.status(401).json({ error: 'session not found' })
    }
    await session.destroy()

    res.status(204).end()

  } catch (error) {
    next(error)
  }
})

module.exports = router