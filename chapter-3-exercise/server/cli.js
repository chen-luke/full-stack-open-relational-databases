require('dotenv').config()
const {Sequelize, QueryTypes} = require('sequelize')

// Using docker so we ignore ssl setting from dialectOptions
const sequelize = new Sequelize(process.env.DATABASE_URL)

const printPretty = (blogs) => {
    blogs.forEach(blog => {
        console.log(`${blog.author}: '${blog.title}', ${blog.likes} likes`)
    });
}

const main = async () => {
    // Connect to the database
    // Execute SELECT * FROM blogs
    // console.log all the blogs to the console in readable format
    try {
        await sequelize.authenticate()
        const blogs = await sequelize.query('SELECT * FROM blogs', {
            type: QueryTypes.SELECT
        })
        printPretty(blogs)
        sequelize.close()
    } catch (error) {
        console.error('Unable to connect to the database: ', error)
    }

}

main()