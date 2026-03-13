const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')
const { User } = require('../models/index')
const { Session } = require('../models/index')

const tokenExtractor = async (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        try {
            const authorization_token = authorization.substring(7)
            const tokenAlive = await Session.findOne({ where: { token: authorization_token } })
            if (!tokenAlive) {
                return res.status(401).json({ error: 'user login expired please login again' })
            }
            req.decodedToken = jwt.verify(authorization_token, SECRET)
        } catch {
            return res.status(401).json({ error: 'token invalid' })
        }
    } else {
        return res.status(401).json({ error: 'token missing' })
    }
    next()
}

const isAdmin = async (req, res, next) => {
    const user = await User.findByPk(req.decodedToken.id)
    if (!user.admin) {
        return res.status(401).json({ error: 'operation not allowed' })
    }
    next()
}

module.exports = { tokenExtractor, isAdmin }