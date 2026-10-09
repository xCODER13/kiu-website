const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { statsLimiter } = require('../middleware/rateLimiters')
const statsController = require('../controllers/statsController')

router.use(auth, statsLimiter)

router.get('/', statsController.getStats)
router.get('/applications-trend', statsController.getApplicationsTrend)
router.get('/top-news', statsController.getTopNews)
router.get('/top-events', statsController.getTopEvents)
router.get('/sortinghat-faculties', statsController.getSortingHatFaculties)
router.get('/applications-faculties', statsController.getApplicationFaculties)

module.exports = router