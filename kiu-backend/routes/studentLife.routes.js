const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const auth = require('../middleware/auth')
const { viewLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const studentLifeController = require('../controllers/studentLifeController')
const validateObjectId = require('../middleware/validateObjectId')

router.get('/', viewLimiter, studentLifeController.getAll)
router.post('/', auth, mutationLimiter, upload.single('imageFile'), studentLifeController.create)
router.put('/:id', auth, mutationLimiter, validateObjectId, upload.single('imageFile'), studentLifeController.update)
router.delete('/:id', auth, mutationLimiter, validateObjectId, studentLifeController.remove)

module.exports = router
