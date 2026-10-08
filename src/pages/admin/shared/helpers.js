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

// ── Tadbirlar (6.25) ──────────────────────────────────────────────────────────────────────────
// `eventDate` — vaqt mintaqasiz KALENDAR sana (backend 00:00 UTC saqlaydi; ba'zan «YYYY-MM-DD» satri keladi).
// Shuning uchun u satr sifatida o'qiladi (`Date` + mahalliy mintaqa kunni bir kunga siljitardi).
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']
const UZ_MONTHS_SHORT = ['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK']

// → { y, m (1–12), d } yoki null (bo'sh / noto'g'ri qiymat)
export function parseEventDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''))
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return { y, m: mo, d }
}

// "2026-10-15T00:00:00.000Z" → "2026-10-15" (`<input type=date>` va solishtirish uchun); noto'g'ri — ''
export function eventDateKey(value) {
  const p = parseEventDate(value)
  return p ? `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}` : ''
}

// "15 oktyabr 2026" (yil bilan — 2025 va 2026 dagi bir xil kunlar farqlansin); noto'g'ri — ''
export function formatEventDate(value) {
  const p = parseEventDate(value)
  return p ? `${p.d} ${UZ_MONTHS[p.m - 1]} ${p.y}` : ''
}

// Sana plitkasi: { day: '15', month: 'OKT' }; noto'g'ri — bo'sh
export function eventTile(value) {
  const p = parseEventDate(value)
  return p ? { day: String(p.d), month: UZ_MONTHS_SHORT[p.m - 1] } : { day: '', month: '' }
}

// Adminning MAHALLIY bugungi kalendar sanasi ("YYYY-MM-DD"). Tadbir kuni (bugun) hali «kelgusi» hisoblanadi.
export function todayKey(now = new Date()) {
  const p = n => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

// O'tgan tadbir: sana bugundan oldin. Sanasi noto'g'ri tadbir ham «o'tgan» bo'limiga (oxiriga) tushadi — yo'qolmaydi.
export const isPastEvent = (value, today) => eventDateKey(value) < today
