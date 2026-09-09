const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { formLimiter } = require('../middleware/rateLimiters')
const applicationsController = require('../controllers/applicationsController')

router.get('/', auth, applicationsController.getAll)
router.post('/', formLimiter, applicationsController.create)
router.put('/:id', auth, applicationsController.update)
router.delete('/:id', auth, applicationsController.remove)

module.exports = router