const errorHandler = (err, req, res, next) => {

    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map((error) => error.message) 
        return res.status(400).json({ error: errors})
    }
    next(err)
}

module.exports = { errorHandler }