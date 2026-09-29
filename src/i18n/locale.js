// ── Til va URL yordamchilari (React'ga bog'liq emas — sof funksiyalar) ──
//
// URL sxemasi (xCODER qarori, band 8):
//   /admission        → O'zbekcha (standart, prefikssiz)
//   /en/admission     → Inglizcha
//   /ru/admission     → Ruscha
// Yangi til qo'shish: LANGS'ga kod qo'shish, `locales/<kod>.json` yaratish, index.js'da
// resursga ulash va TRANSLATED_BY_LANG'ga kiritish — routing/almashtirgich o'zi moslashadi.

export const LANGS = ['uz', 'ru', 'en'] // almashtirgichdagi tartib: UZ | RU | EN
export const DEFAULT_LANG = 'uz'

// Prefiksli tillar (standart til prefikssiz turadi)
export const PREFIXED_LANGS = LANGS.filter(l => l !== DEFAULT_LANG)

// Har bir til uchun TO'LIQ tarjima qilingan sahifalar. Faqat shular uchun hreflang
// beriladi va indekslashga ruxsat etiladi; qolgan /<til>/* sahifalar hozircha o'zbekcha
// matn ko'rsatgani uchun `noindex` bo'ladi (aks holda Google "ingliz/rus" sahifa deb
// o'zbekcha matnni indekslardi). Har bosqichda tegishli ro'yxat kengaytiriladi.
// Eslatma: bazadan keladigan kontent (yangilik, tadbir, o'qituvchi, galereya, vakansiya)
// o'zbekcha qoladi (ContentLangNote bilan belgilangan) — bu sahifalarda interfeys tarjima
// qilingani uchun ro'yxatda. Dinamik /news/:id esa maqola matni o'zbekcha bo'lgani sababli
// ro'yxatda YO'Q va /en/news/:id `noindex` bo'lib qoladi.
const ALL_PAGES = [
  '/', '/admission', '/international', '/contact', '/faq',
  '/about', '/faculty', '/hemis', '/documents',
  '/achievements', '/testimonials', '/map', '/qrcode', '/gallery',
  '/teachers', '/events', '/vacancies', '/news', '/sorting-hat',
]
export const TRANSLATED_BY_LANG = {
  en: new Set(ALL_PAGES),
  ru: new Set(ALL_PAGES),
}

// Sahifaning shu tildagi varianti to'liq tayyormi (standart til — doim tayyor)
export function isTranslated(path, lang) {
  return lang === DEFAULT_LANG || !!TRANSLATED_BY_LANG[lang]?.has(path)
}

// Sahifa to'liq tayyor bo'lgan tillar (hreflang to'plami): ['uz', 'en', ...]
export function translatedLangs(path) {
  return LANGS.filter(lang => isTranslated(path, lang))
}

// `/admin` hech qachon tilga bog'lanmaydi (faqat admin uchun, o'zbekcha)
function isAdminPath(path) {
  return path === '/admin' || path.startsWith('/admin/')
}

// "/en/news?x=1#a" → { path: "/en/news", rest: "?x=1#a" }
function splitPath(to) {
  const i = to.search(/[?#]/)
  return i === -1 ? { path: to, rest: '' } : { path: to.slice(0, i), rest: to.slice(i) }
}

export function getLangFromPath(pathname = '/') {
  for (const lang of PREFIXED_LANGS) {
    if (pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)) return lang
  }
  return DEFAULT_LANG
}

// "/en/news" → "/news", "/en" → "/", "/news" → "/news"
export function stripLangPrefix(pathname = '/') {
  const lang = getLangFromPath(pathname)
  if (lang === DEFAULT_LANG) return pathname
  const rest = pathname.slice(lang.length + 1)
  return rest === '' ? '/' : rest
}

// Ichki yo'lni berilgan tilga moslaydi. Tashqi URL, hash-only, nisbiy yo'l va
// /admin o'zgarishsiz qaytadi. Idempotent: allaqachon prefiksli yo'lga qayta prefiks qo'shmaydi.
export function localizePath(to, lang) {
  if (typeof to !== 'string' || !to.startsWith('/') || to.startsWith('//')) return to
  const { path, rest } = splitPath(to)
  if (isAdminPath(path)) return to
  const base = stripLangPrefix(path)
  if (lang === DEFAULT_LANG || !PREFIXED_LANGS.includes(lang)) return `${base}${rest}`
  return `${base === '/' ? `/${lang}` : `/${lang}${base}`}${rest}`
}

// react-router `to` string yoki { pathname, search, hash } obyekt bo'lishi mumkin
export function localizeTo(to, lang) {
  if (typeof to === 'string') return localizePath(to, lang)
  if (to && typeof to === 'object' && typeof to.pathname === 'string') {
    return { ...to, pathname: localizePath(to.pathname, lang) }
  }
  return to
}

// Joriy sahifaning boshqa tildagi ekvivalenti (search/hash'ni chaqiruvchi qo'shadi)
export function switchLangPath(pathname, targetLang) {
  return localizePath(stripLangPrefix(pathname), targetLang)
}
