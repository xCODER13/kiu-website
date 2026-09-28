const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const statsController = require('../controllers/statsController')

router.get('/', auth, statsController.getStats)
router.get('/applications-trend', auth, statsController.getApplicationsTrend)
router.get('/top-news', auth, statsController.getTopNews)
router.get('/top-events', auth, statsController.getTopEvents)
router.get('/sortinghat-faculties', auth, statsController.getSortingHatFaculties)

module.exports = router