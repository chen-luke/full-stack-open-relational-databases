const router = require('express').Router()
const bcrypt = require('bcrypt')

const { User, Blog } = require('../models')

const userFinder = async (req, res, next) => {
    req.user = await User.findByPk(req.params.id)
    if (!req.user) {
        return res.status(404).end()
    }
    next()
}

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
        model: Blog,
        attributes: {
          exclude: ['userId']
        }
    }
  })
  res.json(users)
})

router.post('/', async (req, res, next) => {
  try {
    const {username, name, password}= req.body

    const saltRounds = 10

    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = await User.create({
        username,
        name,
        passwordHash
    })
    res.json(user)
  } catch(error) {
    next(error)
  }
})

router.get('/:id', userFinder, async (req, res) =>  res.json(req.user))

router.put('/:username', async (req, res) => {
        const user = await User.findOne({where: {username: req.params.username}})
        if (!user) return res.status(404).end()
        
        user.name = req.body.name
        await user.save()
        res.json(user)
})

module.exports = router