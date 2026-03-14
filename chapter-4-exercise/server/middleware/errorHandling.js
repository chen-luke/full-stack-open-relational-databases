const errorHandler = (err, req, res) => {

    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map((error) => error.message)
        return res.status(400).json({ error: errors })
    }

    console.error(err.stack) // only us developers can see this, we do not want to share this with the client

    // client only sees "something went wrong"
    res.status(500).json({ error: 'something went wrong' })
}

module.exports = { errorHandler }