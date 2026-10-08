const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { loginLimiter, changePasswordLimiter, mutationLimiter, viewLimiter } = require('../middleware/rateLimiters')
const authController = require('../controllers/authController')

router.post('/login', loginLimiter, authController.login)
router.post('/change-password', auth, changePasswordLimiter, authController.changePassword)
router.get('/me', auth, viewLimiter, authController.me)
router.post('/logout-all', auth, mutationLimiter, authController.logoutAll)

module.exports = router