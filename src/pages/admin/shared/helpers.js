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

// "2026-09-12T08:00:00Z" → "12 sentyabr 2026" — yozuv QO'SHILGAN payt (vaqt tamg'asi), shuning uchun adminning mahalliy kuni.
// Tadbir sanasidan (`formatEventDate`, kalendar sanasi) farqi shu; oy nomlari umumiy. Noto'g'ri qiymat — ''.
export function formatDateLong(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`
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

// ── O'qituvchilar (6.27) ──────────────────────────────────────────────────────────────────────
// Saytdagi kabi bosh harflar: `avatar` maydoni (qo'lda kiritilgan), bo'sh bo'lsa — ismning birinchi 2 harfi (katta harfda).
// (Xatti-harakat avvalgidek: «Karimov» → «KA»; familiya+ism bosh harflari emas — 6.11 «Avatar holatlari», testlar shunga bog'langan.)
export function initialsOf({ avatar, name }) {
  return avatar || (name || '').slice(0, 2).toUpperCase()
}

// ── Profil (6.28) ───────────────────────────────────────────────────────────────────────────────
// JWT'ning ichini (payload) o'qiydi — FAQAT ko'rsatish uchun (login, sessiya muddati); imzoni tekshirmaydi (bu serverning ishi).
// Noto'g'ri/bo'sh token — null.
export function decodeJwtPayload(token) {
  try {
    const part = String(token).split('.')[1]
    if (!part) return null
    const bin = atob(part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '='))
    const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))))
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}

const UZ_MONTHS_LOWER = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']

// 1791540000000 → "9-okt 2026, 14:20" (adminning mahalliy vaqti). Noto'g'ri qiymat — ''.
export function formatDateTimeShort(ms) {
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return ''
  const p = n => String(n).padStart(2, '0')
  return `${d.getDate()}-${UZ_MONTHS_LOWER[d.getMonth()]} ${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`
}

// Qolgan vaqt (ms) → «7 kundan so'ng» / «5 soatdan so'ng» / «12 daqiqadan so'ng»; o'tib ketgan bo'lsa — «muddati tugagan».
export function formatTimeLeft(ms) {
  if (!(ms > 0)) return 'muddati tugagan'
  const min = Math.max(1, Math.floor(ms / 60000))
  if (min < 60) return `${min} daqiqadan so'ng`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours} soatdan so'ng`
  return `${Math.floor(hours / 24)} kundan so'ng`
}

// O'tgan vaqt (ms) → «hozirgina» / «5 daqiqa oldin» / «3 soat oldin» / «20 kun oldin»; kelajak yoki noto'g'ri qiymat — ''.
export function formatTimeAgo(ms) {
  if (!Number.isFinite(ms) || ms < 0) return ''
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'hozirgina'
  if (min < 60) return `${min} daqiqa oldin`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours} soat oldin`
  return `${Math.floor(hours / 24)} kun oldin`
}

// Soniya → «14:32» (mm:ss); 60 daqiqadan oshsa soat ham chiqadi («1:05:00»). Manfiy / noto'g'ri qiymat — «0:00».
export function formatCountdown(totalSec) {
  const t = Number.isFinite(totalSec) && totalSec > 0 ? Math.ceil(totalSec) : 0
  const p = n => String(n).padStart(2, '0')
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${m}:${p(s)}`
}

// Rate limit sarlavhalari (backend `cors.js` ularni ochiq qiladi): `RateLimit-Remaining` — qolgan urinishlar,
// `Retry-After` (429 da) yoki `RateLimit-Reset` — blok tugashigacha SONIYA. Sarlavha yo'q / noto'g'ri bo'lsa — null.
export function rateLimitInfo(res) {
  const num = name => {
    const raw = res?.headers?.get?.(name)
    if (raw == null || String(raw).trim() === '') return null
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null
  }
  return { remaining: num('RateLimit-Remaining'), resetSec: num('Retry-After') ?? num('RateLimit-Reset') }
}

// Uzunlik BAYT bilan (backend ham `Buffer.byteLength` bilan tekshiradi: bcrypt 72 bayt) — kirill/emoji bitta belgi = 2–4 bayt.
export const byteLength = value => new TextEncoder().encode(String(value ?? '')).length

export const STRENGTH_LABELS = { 1: 'Juda zaif', 2: 'Zaif', 3: 'Yaxshi', 4: 'Kuchli' }

// Parol kuchi 0–4 (oddiy heuristika, kutubxonasiz; maslahat, to'siq emas): 0 — bo'sh; < 8 belgi — 1; 8–9 belgi yoki bitta turdagi — 2;
// ≥ 10 va kamida 2 tur (harf, raqam, belgi) yoki ≥ 14 — 3; ≥ 14 va 3 tur yoki ≥ 20 — 4.
export function passwordStrength(value) {
  const v = String(value ?? '')
  if (!v) return 0
  const len = [...v].length
  if (len < 8) return 1
  const types = [/\p{L}/u, /\d/, /[^\p{L}\d]/u].filter(re => re.test(v)).length
  if (len >= 20 || (len >= 14 && types >= 3)) return 4
  if ((len >= 10 && types >= 2) || len >= 14) return 3
  return 2
}
