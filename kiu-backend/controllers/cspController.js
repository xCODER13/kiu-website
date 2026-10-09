const { normalizeCspReports } = require('../utils/cspReport')

// CSP buzilish hisobotini qabul qiladi (5.1). Brauzer javobga e'tibor bermaydi, shuning uchun har doim 204.
// Hisobotlar faqat logga yoziladi (Render loglarida `[CSP]` bo'yicha qidiriladi) — DB'ga yozilmaydi,
// shu tufayli ommaviy endpoint orqali bazani to'ldirib bo'lmaydi.
function receive(req, res) {
  for (const csp of normalizeCspReports(req.body)) {
    req.log.warn({ csp }, '[CSP] Report-Only buzilish')
  }
  res.status(204).end()
}

module.exports = { receive }
