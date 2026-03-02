require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize')
const express = require('express')
const app = express()
app.use(express.json())

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
})

class Blog extends Model {}

Blog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author: {
    type: DataTypes.TEXT,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    default: 0
  },
  date: {
    type: DataTypes.DATE
  }
}, {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'blog'
})


app.get('/api/blogs', async (req, res) => {
  const blogs = await Blog.findAll()  
  res.json(blogs)
})

app.post('/api/blogs', async (req, res) => {
  console.log(req.body)
  // Standard create method
  
  // Using build method allows us to edit the note before saving it instead of immediate creation
  // const note = Note.build(req.body)
  // note.important = true
  // await note.save()  
  
  try {
    const blog = await Blog.create({...req.body, date: new Date()})
    return res.json(blog)
  } catch (error) {
    return res.status(400).json({error})
  }
})

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    await Blog.destroy({ where: {id: req.params.id}
    })
    res.status(204).end()
  } catch (error) {
    return res.status(400).json({error})
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


