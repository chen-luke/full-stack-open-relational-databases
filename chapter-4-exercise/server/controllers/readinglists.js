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

router.put('/:id', tokenExtractor, async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "payload not found" })
        }
        const readingList = await ReadingList.findByPk(req.params.id)

        if (!readingList) {
            return res.status(404).end()
        }

        if (readingList.userId !== req.decodedToken.id) {
            return res.status(401).end()
        }
        readingList.read = req.body.read
        await readingList.save()
        res.json(readingList)

    } catch (error) {
        next(error)
    }
})

module.exports = router