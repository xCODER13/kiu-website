const express = require('express')
const router = express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const { viewLimiter } = require('../middleware/rateLimiters')
const eventsController = require('../controllers/eventsController')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/', viewLimiter, eventsController.getAll)
router.post('/', auth, upload.single('imageFile'), eventsController.create)
router.put('/:id', auth, upload.single('imageFile'), eventsController.update)
router.delete('/:id', auth, eventsController.remove)

module.exports = router