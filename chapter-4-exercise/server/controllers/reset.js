const router = require('express').Router()
const { Blog, User, Session } = require('../models')


router.post('/', async (req, res) => {
    await Session.destroy({ truncate: true, cascade: true })
    await Blog.destroy({ truncate: true, cascade: true })
    await User.destroy({ truncate: true, cascade: true })
    res.status(200).json({ status: 'databases reseted' })
})

module.exports = router