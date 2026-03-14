const router = require('express').Router()
const bcrypt = require('bcrypt')

const { User, Blog, ReadingList } = require('../models')
const { QueryError } = require('sequelize')

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
    const { username, name, password } = req.body

    const saltRounds = 10

    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = await User.create({
      username,
      name,
      passwordHash
    })
    res.json(user)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {

  const where = {}
  if (req.query.read !== undefined) {
    where.read = req.query.read === 'true'
  }

  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Blog,
          as: 'readings',
          attributes: { exclude: ['userId'] },
          through: {
            attributes: ['id', 'read'],
            where
          },
        }
      ],
    })
    if (!user) {
      return res.status(404).end()
    }

    console.log('-----------------------------------')
    console.log('------------   user ---------------')
    console.log(JSON.stringify(user.toJSON(), null, 2))
    console.log('-----------------------------------')
    console.log('-----------------------------------')
    res.json(user)
  } catch (error) {
    next(error)
  }

})


router.put('/:username', async (req, res) => {
  const user = await User.findOne({ where: { username: req.params.username } })
  if (!user) return res.status(404).end()

  user.name = req.body.name
  await user.save()
  res.json(user)
})




module.exports = router