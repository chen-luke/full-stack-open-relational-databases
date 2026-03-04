const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }

  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  underscored: true,
  modelName: 'user',
})

// Strips out passwordHash when we call res.json(user) automatically
User.prototype.toJSON = function() {
  const values = { ...this.get() }
  delete values.passwordHash
  return values
}

module.exports = User 