const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { loginLimiter, changePasswordLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const authController = require('../controllers/authController')

router.post('/login', loginLimiter, authController.login)
router.post('/change-password', auth, changePasswordLimiter, authController.changePassword)
router.post('/logout-all', auth, mutationLimiter, authController.logoutAll)

module.exports = router