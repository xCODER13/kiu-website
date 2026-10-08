// YouTube Shorts URL'idan video ID ajratib olish. NewsAdmin'da
// "Shorts" bo'limi uchun ishlatiladi.
export function extractYouTubeShortsId(url) {
  if (!url) return ''
  try {
    const normalized = url.trim()
    const parsed = new URL(normalized)
    const hostname = parsed.hostname.replace('www.', '')
    if (hostname === 'youtu.be') return parsed.pathname.slice(1).split(/[^A-Za-z0-9_-]/)[0]
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/')[2]?.slice(0, 11) || ''
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v') || ''
      if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/v/')) return parsed.pathname.split('/')[2]?.slice(0, 11) || ''
    }
  } catch {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/))([\w-]{11})/)
    return match ? match[1] : ''
  }
  return ''
}

// Yordamchi: news.image maydonidan URL massivini olish (eski format —
// bitta string, yangi format — JSON massiv — ikkalasini ham qo'llab-quvvatlaydi)
export function parseImages(imageField) {
  if (!imageField) return []
  try {
    const parsed = JSON.parse(imageField)
    if (Array.isArray(parsed)) return parsed
  } catch { return [imageField] }
  return [imageField]  // eski format — bitta URL string
}

// <img onError> uchun: rasm yuklanmasa elementga `data-broken` qo'yadi — xira ko'rsatish yoki
// yashirish CSS da (admin.css `img[data-broken]`). Inline `style.opacity` kerak emas.
export function markBroken(e) {
  e.currentTarget.dataset.broken = 'true'
}

// "30.09.2026" — brauzer locale'iga bog'liq emas; server UTC saqlaydi, admin lokal sanani ko'radi.
// Noto'g'ri qiymat — bo'sh satr (sahifa "Invalid Date" ko'rsatmaydi).
export function formatDateShort(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const p = n => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`
}

// 1284 → "1 284" (uzilmas probel — son ikki qatorga bo'linmaydi). Son bo'lmasa — "0".
export function formatCount(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
}

// Forma maydoni inputi uchun: `id`, xato bo'lsa `aria-invalid`, ko'rinib turgan xato/izohga `aria-describedby` (FormField.jsx bilan juft).
export function fieldProps(id, { error, hint } = {}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return { id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy }
}
