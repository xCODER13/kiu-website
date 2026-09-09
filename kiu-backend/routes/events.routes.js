const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { viewLimiter } = require('../middleware/rateLimiters')
const eventsController = require('../controllers/eventsController')

router.get('/', viewLimiter, eventsController.getAll)
router.post('/', auth, eventsController.create)
router.put('/:id', auth, eventsController.update)
router.delete('/:id', auth, eventsController.remove)

module.exports = router