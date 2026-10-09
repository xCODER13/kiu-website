const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { loginLimiter, loginUsernameLimiter, changePasswordLimiter, mutationLimiter, viewLimiter } = require('../middleware/rateLimiters')
const authController = require('../controllers/authController')

// Tartib muhim: avval IP bo'yicha (loginLimiter), keyin admin logini bo'yicha umumiy chegara (3.6)
router.post('/login', loginLimiter, loginUsernameLimiter, authController.login)
router.post('/change-password', auth, changePasswordLimiter, authController.changePassword)
router.get('/me', auth, viewLimiter, authController.me)
router.post('/logout-all', auth, mutationLimiter, authController.logoutAll)

module.exports = router