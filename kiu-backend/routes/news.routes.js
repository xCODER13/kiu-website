const express = require('express')
const router = express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const { viewLimiter } = require('../middleware/rateLimiters')
const newsController = require('../controllers/newsController')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.get('/:id', viewLimiter, newsController.getOne)
router.get('/', viewLimiter, newsController.getAll)
router.post('/', auth, upload.single('imageFile'), newsController.create)
router.put('/:id', auth, upload.single('imageFile'), newsController.update)
router.put('/:id/view', viewLimiter, newsController.incrementView)
router.delete('/:id', auth, newsController.remove)

module.exports = router