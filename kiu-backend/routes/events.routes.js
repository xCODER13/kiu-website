const express = require('express')
const router = express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const { viewLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const eventsController = require('../controllers/eventsController')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/', viewLimiter, eventsController.getAll)
router.post('/', auth, mutationLimiter, upload.single('imageFile'), eventsController.create)
router.put('/:id', auth, mutationLimiter, upload.single('imageFile'), eventsController.update)
router.delete('/:id', auth, mutationLimiter, eventsController.remove)

module.exports = router