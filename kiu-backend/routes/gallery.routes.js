const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const auth = require('../middleware/auth')
const { viewLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const galleryController = require('../controllers/galleryController')
const validateObjectId = require('../middleware/validateObjectId')

// News'dagi bilan bir xil: bitta albomga bir nechta rasm (middleware/upload.js: diskka, 5 MB/fayl, maksimal 10 ta fayl).

router.get('/', viewLimiter, galleryController.getAll)
router.post('/', auth, mutationLimiter, upload.array('imageFiles'), galleryController.create)
router.put('/:id', auth, mutationLimiter, validateObjectId, upload.array('imageFiles'), galleryController.update)
router.delete('/:id', auth, mutationLimiter, validateObjectId, galleryController.remove)

module.exports = router