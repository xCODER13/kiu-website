const jwt = require('jsonwebtoken')
const logger = require('../logger')
const { getCutoffs, revocationReason } = require('../services/adminSessions')

const REVOKED_MESSAGES = {
  password_changed: "Sessiya eskirgan — parol o'zgartirilgan, qaytadan kiring",
  logged_out_everywhere: 'Sessiya tugatilgan — qaytadan kiring',
}

async function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token kerak' })

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ error: "Token noto'g'ri" })
  }

  // Parol o'zgartirilishidan yoki «hamma qurilmalardan chiqish»dan OLDIN chiqarilgan
  // tokenlar rad etiladi (batafsil: services/adminSessions.js). `iat` — JWT standart
  // claim'i, soniyada.
  try {
    const reason = revocationReason(decoded.iat, await getCutoffs())
    if (reason) return res.status(401).json({ error: REVOKED_MESSAGES[reason] })
  } catch (e) {
    // getCutoffs xatoni o'zi yutadi; bu yerga kelinsa kutilmagan holat — imzosi to'g'ri
    // tokenni xizmatdan chiqarib yubormaymiz, lekin log qoldiramiz.
    logger.error({ err: e }, 'Token bekor qilinganligini tekshirib bo\'lmadi')
  }

  req.user = decoded
  next()
}

module.exports = auth
