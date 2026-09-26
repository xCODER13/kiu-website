const express = require('express')
const router = express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const { viewLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const newsController = require('../controllers/newsController')
const validateObjectId = require('../middleware/validateObjectId')

// Bitta so'rovda bir nechta rasm (News admin formasi ko'p rasmni qo'llab-quvvatlaydi).
// fileSize xizmat qatlamidagi (supabaseUpload.js) 5MB limit bilan bir xil qilib
// qo'yilgan — aks holda multer katta faylni to'liq xotiraga bufer qilib, keyin
// servis uni rad etadi (keraksiz xotira sarfi).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 10 } })

router.get('/:id', viewLimiter, validateObjectId, newsController.getOne)
router.get('/', viewLimiter, newsController.getAll)
router.post('/', auth, mutationLimiter, upload.array('imageFiles', 10), newsController.create)
router.put('/:id', auth, mutationLimiter, validateObjectId, upload.array('imageFiles', 10), newsController.update)
router.put('/:id/view', viewLimiter, validateObjectId, newsController.incrementView)
router.delete('/:id', auth, mutationLimiter, validateObjectId, newsController.remove)

module.exports = router