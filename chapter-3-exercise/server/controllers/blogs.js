const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')
const { Op } = require('sequelize')


const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  if (!req.blog) {
    return res.status(404).end()
  }
  next()
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch {
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

router.get('/', async (req, res) => {
  let where = {}

  if (req.query.search) {
    where = {
      [Op.or]: {
        title: {
          [Op.substring]: req.query.search
        },
        author: {
          [Op.substring]: req.query.search
        }
      }
    }
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [['likes', 'DESC']]
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({ ...req.body, date: new Date(), userId: user.id })
    res.json(blog)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', blogFinder, async (req, res) => {
  res.json(req.blog)
})

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json(req.blog)
  } catch (error) {
    next(error)
  }

})

router.delete('/:id', blogFinder, tokenExtractor, async (req, res, next) => {
  try {
    // use blogfinder to find the blog and check owner
    // is current user
    const isOwner = req.blog.userId === req.decodedToken.id
    if (isOwner) {
      await req.blog.destroy()
      res.status(204).end()

    } else {
      res.status(401).json({ error: 'User is not the owner of the blog' })
    }
  } catch (error) {
    next(error)
  }

})

module.exports = router