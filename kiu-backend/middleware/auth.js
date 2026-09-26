const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token kerak' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Parol o'zgartirilgandan OLDIN chiqarilgan tokenlar endi rad etiladi —
    // aks holda o'g'irlangan/eski token parol almashtirilgandan keyin ham
    // muddati (7 kun) tugagunga qadar ishlashda davom etar edi. `iat` (JWT
    // standart claim'i, soniyada) va ADMIN_PASSWORD_CHANGED_AT solishtiriladi.
    if (process.env.ADMIN_PASSWORD_CHANGED_AT) {
      const changedAtSec = Math.floor(new Date(process.env.ADMIN_PASSWORD_CHANGED_AT).getTime() / 1000)
      if (decoded.iat < changedAtSec) {
        return res.status(401).json({ error: "Sessiya eskirgan — parol o'zgartirilgan, qaytadan kiring" })
      }
    }

    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: "Token noto'g'ri" })
  }
}

module.exports = auth