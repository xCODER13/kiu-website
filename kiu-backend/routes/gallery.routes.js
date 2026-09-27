const express = require('express')
const router = express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const { viewLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const galleryController = require('../controllers/galleryController')
const validateObjectId = require('../middleware/validateObjectId')

// News'dagi bilan bir xil: bitta albomga bir nechta rasm, 5MB/fayl (supabaseUpload.js
// bilan mos), maksimal 10 ta fayl bir so'rovda.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 10 } })

router.get('/', viewLimiter, galleryController.getAll)
router.post('/', auth, mutationLimiter, upload.array('imageFiles', 10), galleryController.create)
router.put('/:id', auth, mutationLimiter, validateObjectId, upload.array('imageFiles', 10), galleryController.update)
router.delete('/:id', auth, mutationLimiter, validateObjectId, galleryController.remove)

module.exports = router