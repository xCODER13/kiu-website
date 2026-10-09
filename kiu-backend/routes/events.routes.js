const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const auth = require('../middleware/auth')
const { viewLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const eventsController = require('../controllers/eventsController')
const validateObjectId = require('../middleware/validateObjectId')

router.get('/', viewLimiter, eventsController.getAll)
router.post('/', auth, mutationLimiter, upload.single('imageFile'), eventsController.create)
router.put('/:id', auth, mutationLimiter, validateObjectId, upload.single('imageFile'), eventsController.update)
router.put('/:id/view', viewLimiter, validateObjectId, eventsController.incrementView)
router.delete('/:id', auth, mutationLimiter, validateObjectId, eventsController.remove)

module.exports = router