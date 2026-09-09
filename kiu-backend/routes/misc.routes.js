const express = require('express')
const router = express.Router()
const { formLimiter, viewLimiter } = require('../middleware/rateLimiters')
const miscController = require('../controllers/miscController')

router.post('/sorting-hat-lead', formLimiter, miscController.sortingHatLead)
router.get('/telegram/posts', viewLimiter, miscController.telegramPosts)

module.exports = router