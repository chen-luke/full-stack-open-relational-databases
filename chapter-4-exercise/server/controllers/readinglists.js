const router = require('express').Router()
const { User, Blog, ReadingList } = require('../models')
const { tokenExtractor } = require('../middleware/middleware')


router.get('/', async (req, res) => {
    res.status(200).json({ works: true }).end()
})

router.post('/', tokenExtractor, async (req, res, next) => {
    try {
        const { blogId, userId } = req.body
        const blog = await Blog.findByPk(blogId)
        const user = await User.findByPk(userId)
        if (!blog) {
            return res.status(404).json({ error: 'blog not found' })
        }
        if (!user) {
            return res.status(404).json({ error: 'user not found' })
        }

        const readingList = await ReadingList.create({ ...req.body })
        res.json(readingList)

    } catch (error) {
        next(error)
    }
})

module.exports = router