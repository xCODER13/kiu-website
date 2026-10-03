import { test, expect } from '@playwright/test'
import { mockPublicApi, stubExternal, PUBLIC_ROUTES } from './mocks.js'

// Ommaviy sayt smoke: har bir sahifa ochiladi, <h1> bor, JS xatosi yo'q, sarlavha (SEO) bo'sh emas va sahifalar
// orasida takrorlanmaydi. API mock (e2e/mocks.js), tashqi manbalar (shrift, xarita, YouTube) bo'sh javob bilan almashtiriladi —
// shuning uchun testlar tarmoq va backend holatiga bog'liq emas.

test.beforeEach(async ({ page }) => {
  await mockPublicApi(page)
  await stubExternal(page, new Set())
})

test.describe('ommaviy sahifalar', () => {
  for (const path of PUBLIC_ROUTES) {
    test(`${path}: ochiladi, <h1> bor, JS xatosi yo'q`, async ({ page }) => {
      const errors = []
      page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
      page.on('console', m => {
        // tashqi manbalar stub qilingan — "Failed to load resource" (rasm/shrift) shovqin; React/JS xatolari esa muhim
        if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errors.push(`console.error: ${m.text()}`)
      })

      await page.goto(path)
      await expect(page.locator('main h1, h1').first()).toBeVisible()
      await page.waitForLoadState('networkidle')
      expect(errors).toEqual([])

      expect((await page.title()).trim(), 'document.title').not.toBe('')
      await expect(page.locator('html')).toHaveAttribute('lang', 'uz')
    })
  }

  test("<title> har sahifada noyob (SEO): sahifalar orasida takrorlanmaydi", async ({ page }) => {
    const seen = new Map()
    for (const path of PUBLIC_ROUTES.filter(p => p !== '/news/n1')) { // yangilik sarlavhasi maqola nomidan olinishi mumkin
      await page.goto(path)
      await expect(page.locator('h1').first()).toBeVisible()
      await page.waitForLoadState('networkidle') // sarlavhani React o'rnatadi (index.html dagi standart emas)
      const title = (await page.title()).trim()
      expect(seen.get(title), `"${title}" sarlavhasi ${seen.get(title)} bilan takrorlanadi`).toBeUndefined()
      seen.set(title, path)
    }
  })

  test("mavjud bo'lmagan manzil: 404 sahifa, ilova buzilmaydi", async ({ page }) => {
    await page.goto('/zzz-yo-q')
    await expect(page.locator('main h1, h1').first()).toBeVisible()
    await expect(page.getByRole('navigation').first()).toBeVisible()
  })

  test("navbar'dagi havolalar orqali sahifadan sahifaga o'tish (SPA, to'liq qayta yuklanmasdan)", async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => { window.__spa = true })
    await page.locator('a.nav-link[href="/faq"], .nav-group-item[href="/faq"]').first().evaluate(a => a.click())
    await expect(page).toHaveURL(/\/faq$/)
    await expect(page.locator('h1').first()).toBeVisible()
    expect(await page.evaluate(() => window.__spa), 'sahifa to\'liq qayta yuklanmasligi kerak').toBe(true)
  })

  test("tema: tugma Dark'ga o'tkazadi va qayta yuklanganda saqlanadi (theme-init.js, FOUC yo'q)", async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: "Qorong'i rejimga o'tish" }).first().click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.reload()
    // theme-init.js React'dan oldin qo'yadi — h1 chizilmasdan turib ham atribut bor
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('button', { name: "Yorug' rejimga o'tish" }).first()).toBeVisible()
  })
})
