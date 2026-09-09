const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { loginLimiter } = require('../middleware/rateLimiters')
const authController = require('../controllers/authController')

router.post('/login', loginLimiter, authController.login)
router.post('/change-password', auth, authController.changePassword)

module.exports = router