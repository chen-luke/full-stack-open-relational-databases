const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')
const { Op } = require('sequelize')
const { sequelize } = require('../util/db')

router.get('/', async (req, res) => {

    const authors = await Blog.findAll({
        group: 'author',
        attributes: ['author', [sequelize.fn('COUNT', sequelize.col('id')), 'articles'], [sequelize.fn('SUM', sequelize.col('likes')), 'likes']],
        order: [[sequelize.fn('SUM', sequelize.col('likes')), 'DESC']]
    })

    res.json(authors)
})

module.exports = router