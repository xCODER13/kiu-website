const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const auth = require('../middleware/auth')
const { viewLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const teachersController = require('../controllers/teachersController')
const validateObjectId = require('../middleware/validateObjectId')

router.get('/', viewLimiter, teachersController.getAll)
router.get('/departments', viewLimiter, teachersController.getDepartments)
router.post('/', auth, mutationLimiter, upload.single('imageFile'), teachersController.create)
router.put('/:id', auth, mutationLimiter, validateObjectId, upload.single('imageFile'), teachersController.update)
router.delete('/:id', auth, mutationLimiter, validateObjectId, teachersController.remove)

module.exports = router