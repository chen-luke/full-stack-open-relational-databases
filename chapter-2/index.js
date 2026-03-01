require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize')
const express = require('express')
const app = express()
app.use(express.json())

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
})

class Note extends Model {}
Note.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  important: {
    type: DataTypes.BOOLEAN
  },
  date: {
    type: DataTypes.DATE
  }
}, {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'note'
})


app.get('/api/notes', async (req, res) => {
  const notes = await Note.findAll()  
  res.json(notes)
})

app.post('/api/notes', async (req, res) => {
  console.log(req.body)
  // Standard create method
  const note = await Note.create({...req.body, date:new Date()})

  // Using build method allows us to edit the note before saving it instead of immediate creation
  // const note = Note.build(req.body)
  // note.important = true
  // await note.save()  

  res.json(note)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


