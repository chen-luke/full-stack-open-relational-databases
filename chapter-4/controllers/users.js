const router = require('express').Router()

const { User, Note, Team } = require('../models')
const { tokenExtractor, isAdmin } = require('../util/middleware')

router.get('/', async (req, res) => {

  // Used with scope from user model
  // all admins
  const adminUsers = await User.scope('admin').findAll()

  // all inactive users
  const disabledUsers = await User.scope('disabled').findAll()

  // users with the string jami in their name
  const jamiUsers = await User.scope({ method: ['name', '%jami%'] }).findAll()

  const users = await User.findAll({
    include: [
      {
        model: Note,
        attributes: {
          exclude: ['userId']
        },
      }, {
        model: Team,
        attributes: ['name', 'id'],
        through: {
          attributes: []
        }
      }
    ]
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

// Lazy loading user's teams
router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: [''] },
    include: [{
      model: Note,
      attributes: { exclude: ['userId'] }
    },
    {
      model: Note,
      as: 'marked_notes',
      attributes: { exclude: ['userId'] },
      through: {
        attributes: []
      },
      include: {
        model: User,
        attributes: ['name']
      }
    },
    ]
  })

  if (!user) {
    return res.status(404).end()
  }

  // Lazy loading, only search for teams if we have team=...? query parameter.
  let teams = undefined
  if (req.query.teams) {
    // user.getTeams() is automatically generated for us.
    teams = await user.getTeams({
      attributes: ['name'],
      joinTableAttributes: []
    })
  }
  res.json({ ...user.toJSON(), teams })
})


// None lazy loading user's teams
// router.get('/:id', async (req, res, next) => {
//   try {
//     const user = await User.findByPk(req.params.id, {
//       attributes: { exclude: [''] },
//       include: [
//         {
//           model: Note,
//           attributes: {
//             exclude: ['userId']
//           },
//         }, {
//           model: Note,
//           as: 'marked_notes',
//           attributes: { exclude: ['userId'] },
//           through: {
//             attributes: []
//           },
//           include: {
//             model: User,
//             attributes: ['name']
//           }
//         },
//         {
//           model: Team,
//           attributes: ['name', 'id'],
//           through: {
//             attributes: []
//           }
//         }
//       ]
//     })
//     if (user) {
//       res.json(user)
//     } else {
//       res.status(404).end()
//     }
//   } catch (error) {
//     next(error)
//   }
// })

router.put('/:username', tokenExtractor, isAdmin, async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.params.username
    }
  })

  if (user) {
    user.disabled = req.body.disabled
    await user.save()
    res.json(user)
  } else {
    res.status(404).end()
  }
})

module.exports = router