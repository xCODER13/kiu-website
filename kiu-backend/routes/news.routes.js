const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const auth = require('../middleware/auth')
const { viewLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const newsController = require('../controllers/newsController')
const validateObjectId = require('../middleware/validateObjectId')

// Bitta so'rovda bir nechta rasm (News admin formasi ko'p rasmni qo'llab-quvvatlaydi): middleware/upload.js (diskka, 5 MB, 10 fayl).

router.get('/:id', viewLimiter, validateObjectId, newsController.getOne)
router.get('/', viewLimiter, newsController.getAll)
router.post('/', auth, mutationLimiter, upload.array('imageFiles'), newsController.create)
router.put('/:id', auth, mutationLimiter, validateObjectId, upload.array('imageFiles'), newsController.update)
router.put('/:id/view', viewLimiter, validateObjectId, newsController.incrementView)
router.delete('/:id', auth, mutationLimiter, validateObjectId, newsController.remove)

module.exports = router