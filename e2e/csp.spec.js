import { test, expect } from '@playwright/test'
import { mockPublicApi, stubExternal } from './mocks.js'

// CSP Report-Only regressiya testi. Production build (`dist-csp`) Vercel kabi — `vercel.json` dagi
// haqiqiy header bilan — xizmat qilinadi (e2e/serve-dist.mjs), barcha ommaviy sahifalar va asosiy
// oqimlar (qidiruv, ariza modali, video, xarita) ochiladi va `securitypolicyviolation` hodisalari yig'iladi.
// Kutiladigan natija: 0 ta. Yangi tashqi manba (skript, shrift, iframe, API) yoki inline skript qo'shilsa,
// bu test production'dan OLDIN yiqiladi — siyosat (vercel.json) yoki kod shunga moslanadi.

const ROUTES = [
  '/', '/about', '/admission', '/faculty', '/international', '/contact', '/faq', '/documents', '/hemis',
  '/achievements', '/testimonials', '/map', '/qrcode', '/student-life', '/teachers', '/events', '/vacancies',
  '/news', '/news/n1', '/sorting-hat', '/zzz-yo-q',
  '/ru', '/en/admission', '/ru/faq', '/admin/login',
]

test.describe('CSP Report-Only: ommaviy sayt buzilishsiz', () => {
  test('header haqiqatan yuboriladi (Report-Only, enforce emas)', async ({ request }) => {
    const res = await request.get('/')
    expect(res.headers()['content-security-policy-report-only']).toContain("default-src 'self'")
    expect(res.headers()['content-security-policy']).toBeUndefined()
  })

  test("boshqa xavfsizlik header'lari haqiqiy javobda (HTML va statik fayl uchun ham)", async ({ request }) => {
    for (const path of ['/', '/about', '/fonts-init.js']) {
      const h = (await request.get(path)).headers()
      expect(h['strict-transport-security'], path).toMatch(/^max-age=\d+$/)
      expect(h['x-content-type-options'], path).toBe('nosniff')
      expect(h['x-frame-options'], path).toBe('SAMEORIGIN')
      expect(h['referrer-policy'], path).toBe('strict-origin-when-cross-origin')
      expect(h['permissions-policy'], path).toContain('camera=()')
    }
  })

  test("Google Fonts CSS'i /fonts-init.js orqali ulanadi (inline onload o'rniga)", async ({ page }) => {
    await mockPublicApi(page)
    await stubExternal(page, new Set())
    await page.goto('/')
    await expect(page.locator('head link[rel="stylesheet"][href^="https://fonts.googleapis.com/css2"]')).toHaveCount(1)
  })

  test("barcha sahifalar va oqimlar: 0 ta `securitypolicyviolation`", async ({ page }) => {
    test.setTimeout(120_000) // 25 ta sahifa × (tarmoq tinchishi + aylantirish)
    const violations = []
    const seen = new Set()
    await mockPublicApi(page)
    await stubExternal(page, seen)
    await page.addInitScript(() => {
      window.__csp = []
      document.addEventListener('securitypolicyviolation', e => {
        window.__csp.push(`${e.violatedDirective} ← ${e.blockedURI || e.sample || 'inline'} @ ${location.pathname}`)
      })
    })
    const collect = async () => { violations.push(...await page.evaluate(() => window.__csp.splice(0))) }

    for (const path of ROUTES) {
      await page.goto(path)
      await page.locator('#root > *').first().waitFor()
      await page.waitForLoadState('networkidle')
      // Sahifa oxirigacha aylantirish — `loading="lazy"` iframe/rasmlar yuklanadi
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)) }
      })
      await collect()
    }

    // Qidiruv paneli
    await page.goto('/')
    await page.getByRole('button', { name: 'Qidiruv' }).first().click()
    await expect(page.getByRole('dialog', { name: /Qidiruv|qidir/i })).toBeVisible()
    await collect()

    // Ariza modali
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Ariza topshirish' }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Production build'da (minify'dan keyin) modal orqasi xiralashishi — standart `backdrop-filter` tashlab yuborilmagan (6.16)
    await expect(page.locator('.modal-overlay').first()).toHaveCSS('backdrop-filter', /blur\(8px\)/)
    await collect()

    // Video (YouTube iframe) — Yangiliklar → Video
    await page.goto('/news')
    await page.getByRole('button', { name: /^Video/ }).click()
    await expect(page.locator('img.shorts-thumb').first()).toBeAttached() // poster (i.ytimg.com)
    await page.locator('.shorts-play').first().click() // iframe faqat bosilganda (6.16)
    await expect(page.locator('iframe[src*="youtube.com/embed"]').first()).toBeAttached()
    await collect()

    // Xarita (Google Maps iframe)
    await page.goto('/map')
    await page.locator('iframe[src*="maps.google.com"]').first().scrollIntoViewIfNeeded()
    await collect()

    // Tashqi originlar faqat siyosatda ruxsat etilganlar (qo'shimcha kafolat — kutilmagan uchinchi tomon yo'q)
    const allowed = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|www\.youtube\.com|i\.ytimg\.com|maps\.google\.com|www\.google\.com|www\.googletagmanager\.com|api\.qrserver\.com|[a-z0-9-]+\.supabase\.co|kiu-backend-9fwp\.onrender\.com)$/
    const unexpected = [...seen].filter(o => !allowed.test(o))
    expect(unexpected, "kutilmagan tashqi origin").toEqual([])
    expect(violations, 'CSP buzilishlari').toEqual([])
  })
})
