const express = require('express')
const router = express.Router()
const { cspReportLimiter, cspReportGlobalLimiter } = require('../middleware/rateLimiters')
const cspController = require('../controllers/cspController')

// Brauzer CSP hisobotini `application/csp-report` (eski) yoki `application/reports+json` (Reporting API) bilan yuboradi —
// umumiy `express.json()` bu turlarni o'qimaydi, shuning uchun shu yerda alohida, juda kichik limit bilan.
const parseReport = express.json({
  limit: '8kb',
  type: ['application/csp-report', 'application/reports+json', 'application/json']
})

router.post('/', cspReportLimiter, cspReportGlobalLimiter, parseReport, cspController.receive)

// Noto'g'ri/katta body: brauzer javobga qaramaydi, logni ham to'ldirmaymiz — jim 4xx.
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  res.status(err.status >= 400 && err.status < 500 ? err.status : 400).end()
})

module.exports = router
