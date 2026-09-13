const express = require('express')
const router = express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const { viewLimiter } = require('../middleware/rateLimiters')
const teachersController = require('../controllers/teachersController')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/', viewLimiter, teachersController.getAll)
router.post('/', auth, upload.single('imageFile'), teachersController.create)
router.put('/:id', auth, upload.single('imageFile'), teachersController.update)
router.delete('/:id', auth, teachersController.remove)

module.exports = router