const express = require('express')
const router = express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const { viewLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const teachersController = require('../controllers/teachersController')
const validateObjectId = require('../middleware/validateObjectId')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/', viewLimiter, teachersController.getAll)
router.post('/', auth, mutationLimiter, upload.single('imageFile'), teachersController.create)
router.put('/:id', auth, mutationLimiter, validateObjectId, upload.single('imageFile'), teachersController.update)
router.delete('/:id', auth, mutationLimiter, validateObjectId, teachersController.remove)

module.exports = router