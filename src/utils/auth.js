// JWT payload'ini o'qiydi (imzoni TEKSHIRMAYDI — imzoni faqat backend tekshiradi).
// Maqsad: UX — muddati o'tgan yoki yaroqsiz tokenni darhol aniqlab, loginga yo'naltirish.
export function decodeJwtPayload(token) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(b64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    )
    const payload = JSON.parse(json)
    return payload && typeof payload === 'object' ? payload : null
  } catch {
    return null
  }
}

// Token JWT formatida va muddati o'tmagan bo'lsagina true
export function isTokenValid(token, nowMs = Date.now()) {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return false
  return payload.exp * 1000 > nowMs
}
