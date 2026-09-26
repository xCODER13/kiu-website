const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { formLimiter, mutationLimiter } = require('../middleware/rateLimiters')
const applicationsController = require('../controllers/applicationsController')
const validateObjectId = require('../middleware/validateObjectId')

router.get('/', auth, applicationsController.getAll)
router.post('/', formLimiter, applicationsController.create)
router.put('/:id', auth, mutationLimiter, validateObjectId, applicationsController.update)
router.delete('/:id', auth, mutationLimiter, validateObjectId, applicationsController.remove)

module.exports = router