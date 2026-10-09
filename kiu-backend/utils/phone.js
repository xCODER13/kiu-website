// O'zbekiston telefon raqami bilan ishlash: normallashtirish va maskalash (4.3).
//
// Normal shakl — "998XXXXXXXXX" (12 raqam, '+' va bo'shliqlarsiz). Frontend
// (src/utils/validation.js) bilan bir xil qoida: 998 bilan boshlansa shunday, 9 raqam
// bo'lsa oldiga 998 qo'shiladi. Yaroqsiz bo'lsa — null.
function normalizeUzPhone(value) {
  if (typeof value === 'number') value = String(value)
  if (typeof value !== 'string') return null
  const digits = value.replace(/\D/g, '')
  if (!digits) return null
  const normalized = digits.startsWith('998') ? digits : (digits.length === 9 ? '998' + digits : digits)
  return /^998\d{9}$/.test(normalized) ? normalized : null
}

// Log va Telegram uchun: "+998 90 *** ** 67". Operator kodi va oxirgi 2 raqam qoladi —
// admin "bu qaysi ariza" ekanini tanishi mumkin, lekin raqamning o'zi chatda/logda qolmaydi
// (to'liq raqam faqat admin panelda, auth ortida). Yaroqsiz qiymatda ham hech qachon
// to'liq raqam qaytarmaydi: faqat oxirgi 2 raqam ("***67") yoki "***".
function maskPhone(value) {
  const n = normalizeUzPhone(value)
  if (n) return `+${n.slice(0, 3)} ${n.slice(3, 5)} *** ** ${n.slice(10)}`
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.length >= 6 ? `***${digits.slice(-2)}` : '***'
}

module.exports = { normalizeUzPhone, maskPhone }
