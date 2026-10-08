import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'
import { NEWS, EVENTS, TEACHERS, GALLERY } from './mocks.js'

// axe-core (WCAG 2.0/2.1 A + AA, `color-contrast` ham) — har bir ADMIN ekran Light va Dark temada, 1280 px. Kutiladigan natija: 0 buzilish.
// Ommaviy sahifalar `a11y.spec.js` da. Admin ekranlar oldin faqat qo'lda tekshirilgan edi — bu spec ularni regressiyadan himoya qiladi.
// Backend kerak emas: token (JWT ko'rinishida, muddati o'tmagan) `localStorage` ga qo'yiladi va `/api/**` mock qilinadi.
// Parol o'zgartirish so'rovi hech qachon yuborilmaydi (faqat ekran ochiladi).

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url')
const TOKEN = `${b64({ alg: 'none' })}.${b64({ username: 'admin', exp: Math.floor(Date.now() / 1000) + 7 * 86400 })}.x`

const APPLICATIONS = [
  { _id: 'a1', name: 'Ali Valiyev', phone: '+998901111111', faculty: 'Iqtisodiyot', status: 'new', type: 'admission', createdAt: '2026-09-02T10:00:00.000Z' },
  { _id: 'a2', name: 'Nodira Karimova', phone: '+998903333333', email: 'n@example.com', status: 'reviewed', type: 'vacancy', position: 'Dotsent', faculty: 'IT', createdAt: '2026-09-03T10:00:00.000Z' },
]
const TREND = { granularity: 'day', buckets: [{ date: '2026-09-01', admission: 3, vacancy: 1 }, { date: '2026-09-02', admission: 5, vacancy: 2 }, { date: '2026-09-03', admission: 2, vacancy: 0 }] }
const FACULTIES = { total: 9, faculties: [{ faculty: 'Pedagogika', count: 6 }, { faculty: 'Tarix', count: 3 }] }

function adminApi(pathname) {
  if (pathname.endsWith('/api/stats')) return { newsCount: 5, shortsCount: 8, eventsCount: 2, teachersCount: 10, appsCount: 3, vacancyApps: 1, galleryCount: 4 }
  if (pathname.endsWith('/api/stats/applications-trend')) return TREND
  if (pathname.endsWith('/api/stats/top-news')) return NEWS.map(n => ({ _id: n._id, title: n.title, views: n.views, category: 'umumiy' }))
  if (pathname.endsWith('/api/stats/top-events')) return EVENTS.map(e => ({ _id: e._id, title: e.title, views: 50, eventDate: e.eventDate }))
  if (pathname.endsWith('/api/stats/sortinghat-faculties') || pathname.endsWith('/api/stats/applications-faculties')) return FACULTIES
  if (pathname.endsWith('/api/news')) return NEWS
  if (pathname.endsWith('/api/events')) return EVENTS
  if (pathname.endsWith('/api/teachers')) return TEACHERS
  if (pathname.endsWith('/api/gallery')) return GALLERY
  if (pathname.endsWith('/api/applications')) return APPLICATIONS
  return {}
}

const ADMIN_ROUTES = ['/admin', '/admin/news', '/admin/events', '/admin/teachers', '/admin/gallery', '/admin/applications', '/admin/vacancies', '/admin/profile']

for (const theme of ['light', 'dark']) {
  test.describe(`a11y (axe) admin — ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(([t, tok]) => { localStorage.setItem('theme', t); localStorage.setItem('kiu_token', tok) }, [theme, TOKEN])
      await page.route('**/api/**', route => {
        const { pathname } = new URL(route.request().url())
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(adminApi(pathname)) })
      })
    })

    for (const path of ADMIN_ROUTES) {
      test(`${path}: 0 buzilish`, async ({ page }) => {
        await page.goto(path)
        await expect(page.locator('.adm-shell')).toBeVisible() // login'ga qaytarilmagan (token qabul qilingan)
        await expect(page.locator('h2.adm-page-title')).toBeVisible()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(400) // grafik/ro'yxat o'tishlari tugasin
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).exclude('iframe').analyze()
        expect(
          violations.map(v => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`),
        ).toEqual([])
      })
    }
  })
}
