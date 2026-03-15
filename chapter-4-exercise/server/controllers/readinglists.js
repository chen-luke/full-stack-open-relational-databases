const router = require('express').Router()
const { User, Blog, ReadingList } = require('../models')
const { tokenExtractor } = require('../middleware/middleware')


router.get('/', async (req, res) => {
    res.status(200).json({ works: true }).end()
})

router.post('/', async (req, res, next) => {

    try {
        const { blogId, userId } = req.body
        if (!blogId) {
            return res.status(400).json({ error: 'blog id not found' })
        }
        if (!userId) {
            return res.status(400).json({ error: 'user id not found' })
        }

        const blog = await Blog.findByPk(blogId)
        const user = await User.findByPk(userId)
        if (!blog) {
            return res.status(404).json({ error: 'blog not found' })
        }
        if (!user) {
            return res.status(404).json({ error: 'user not found' })
        }

        const isAdded = await ReadingList.findOne({ where: { blogId, userId } })
        if (isAdded) {
            return res.status(400).json({ error: 'blog already exists in readinglist' })
        }
        const readingList = await ReadingList.create({ ...req.body })

        return res.json({ id: readingList.id, blog_id: readingList.blogId, user_id: readingList.userId, read: readingList.read })

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
        return res.json(readingList)

    } catch (error) {
        next(error)
    }
})

module.exports = router