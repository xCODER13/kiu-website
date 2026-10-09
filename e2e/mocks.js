// Ommaviy sahifalar uchun API javoblari (backend/Mongo'ga bog'liq bo'lmagan, deterministik E2E).
// Haqiqiy backend bilan ishlaydigan oqimlar (login, admin, ariza) o'z spec'larida qoladi.
const IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#7f2063"/></svg>')

export const NEWS = [
  { _id: 'n1', title: "Ochiq eshiklar kuni bo'lib o'tdi", content: "Abituriyentlar kampus bilan tanishdi.\n\nTadbir davomida yo'nalishlar haqida ma'lumot berildi.", category: 'Umumiy', createdAt: '2026-03-28T12:00:00.000Z', views: 120, image: JSON.stringify([IMG, IMG]) },
  { _id: 'n2', title: "Talabalar olimpiadada sovrin oldi", content: "Dasturiy injiniring yo'nalishi talabalari ikkinchi o'rinni egalladi.", category: 'Fan', createdAt: '2026-03-25T12:00:00.000Z', views: 80 },
  { _id: 'n3', title: 'Kampus tanishuv videosi', content: 'Qisqa video', category: 'Umumiy', createdAt: '2026-03-20T12:00:00.000Z', views: 10, videoId: 'dQw4w9WgXcQ' },
]
export const EVENTS = [
  { _id: 'e1', title: 'Ochiq eshiklar kuni', type: 'open', eventDate: '2027-10-12T12:00:00.000Z', desc: "Abituriyentlar va ota-onalar uchun.", image: IMG },
  { _id: 'e2', title: 'Ilmiy konferensiya', type: 'science', eventDate: '2025-10-24T12:00:00.000Z', desc: 'Xalqaro konferensiya.' },
]
export const TEACHERS = [
  { _id: 't1', avatar: 'AV', name: 'Ali Valiyev', role: 'Dotsent', dept: 'Aniq fanlar kafedrasi' },
  { _id: 't2', avatar: 'NQ', name: 'Nodira Qodirova', role: 'Professor', dept: "Filologiya va tillarni o'qitish kafedrasi" },
]
export const GALLERY = [
  { _id: 'g1', title: 'Ochiq eshiklar kuni', desc: 'Kampus bilan tanishuv', images: [IMG, IMG] },
]

// `**/api/**` — VITE_API_URL qaysi origin bo'lishidan qat'i nazar. Noma'lum yo'l — bo'sh ob'ekt.
export async function mockPublicApi(page) {
  await page.route('**/api/**', route => {
    const { pathname } = new URL(route.request().url())
    const body = (() => {
      if (/\/api\/news\/[^/]+$/.test(pathname)) return NEWS[0]
      if (pathname.endsWith('/api/news')) return NEWS
      if (pathname.endsWith('/api/events')) return EVENTS
      if (pathname.endsWith('/api/teachers')) return TEACHERS
      if (pathname.endsWith('/api/gallery')) return GALLERY
      return {}
    })()
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}

// Tashqi (127.0.0.1 dan boshqa) so'rovlarga turiga mos bo'sh javob — tarmoqqa chiqmaydi, lekin brauzer
// CSP'ni so'rov yuborishdan oldin tekshiradi, shuning uchun buzilishlar baribir qayd etiladi.
export async function stubExternal(page, seen) {
  await page.route(url => !/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(url.href), route => {
    const req = route.request()
    const u = new URL(req.url())
    seen.add(u.origin)
    if (u.pathname.startsWith('/api/')) return route.fallback() // API javobini mockPublicApi beradi (u oldinroq ro'yxatdan o'tgan)
    const type = req.resourceType()
    if (type === 'document') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>stub</title>' })
    if (type === 'script') return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' })
    if (type === 'stylesheet') return route.fulfill({ status: 200, contentType: 'text/css', body: '' })
    if (type === 'image') return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>' })
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
}


// Ommaviy sahifa marshrutlari (App.jsx) — smoke/a11y/CSP testlari uchun yagona ro'yxat
export const PUBLIC_ROUTES = [
  '/', '/about', '/admission', '/faculty', '/international', '/contact', '/faq', '/documents', '/hemis',
  '/achievements', '/testimonials', '/map', '/qrcode', '/student-life', '/teachers', '/events', '/vacancies',
  '/news', '/news/n1', '/sorting-hat',
]
