const errorHandler = (err, req, res, next) => {
    console.error(err.message)

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: err.message })
    }

    if (err.name === 'UserNameIsNotEmail') {
        return res.status(400).json({error: "Username should be a valid email address"})
    }

    next(err)
}

module.exports = { errorHandler }