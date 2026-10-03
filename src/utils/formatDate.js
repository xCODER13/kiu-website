// Sana ko'rinishi: kk.oo.yyyy (taxta: "28.03.2026"). `toLocaleDateString` o'rniga qo'lda — brauzer/ICU ("uz-UZ" → "28/03/2026"
// yoki "2026-03-28") ga bog'liq emas, barcha tilda bir xil. Noto'g'ri sana → bo'sh satr.
export function formatDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

// Uzun sana (yangilik sahifasi: "28-mart, 2026"): oy nomi `events.months` (tarjima) dan, shakl `news.dateLong` dan.
export function formatDateLong(value, t) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const month = (t('events.months', { returnObjects: true }) || [])[d.getMonth()] || ''
  return t('news.dateLong', { day: d.getDate(), month, year: d.getFullYear() })
}
