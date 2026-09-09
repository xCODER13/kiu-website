const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { viewLimiter } = require('../middleware/rateLimiters')
const teachersController = require('../controllers/teachersController')

router.get('/', viewLimiter, teachersController.getAll)
router.post('/', auth, teachersController.create)
router.put('/:id', auth, teachersController.update)
router.delete('/:id', auth, teachersController.remove)

module.exports = router