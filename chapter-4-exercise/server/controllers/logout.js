const router = require('express').Router()
const { Session } = require('../models')
const { tokenExtractor } = require('../middleware/middleware')

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