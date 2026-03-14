const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class Blog extends Model { }

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
    defaultValue: 0
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      correctYear(value) {
        if (!value) return   // allow null
        if (!(value >= 1991 && value <= new Date().getFullYear())) {
          throw new Error("Year must at least equal to 1991, but not greater than the current year")
        }
      }
    }
  },
}, {
  sequelize,
  underscored: true,
  modelName: 'blog'
})

module.exports = Blog