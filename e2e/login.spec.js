import { test, expect } from '@playwright/test'
import { E2E_ADMIN_USERNAME, E2E_WRONG_PASSWORD } from './config.js'

// Diqqat: bu fayldagi barcha testlar BITTA backend instance'ni (bitta login
// rate-limiter hisoblagichini) ishlatadi va standart bo'yicha ketma-ket
// ishlaydi (playwright.config.js: workers=1) — shuning uchun tartib muhim:
// "429" testi keyin turadi va o'z ichida yetarlicha urinish qiladi, shu bilan
// undan oldingi testning 1 ta muvaffaqiyatsiz urinishi hisobga olinadi.

test.describe('Admin login', () => {
  test("noto'g'ri parolda aniq xato ko'rsatiladi", async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByPlaceholder('Login').fill(E2E_ADMIN_USERNAME)
    await page.getByPlaceholder('Parol').fill(E2E_WRONG_PASSWORD)

    await Promise.all([
      page.waitForResponse(res => res.url().endsWith('/api/admin/login')),
      page.getByRole('button', { name: 'Kirish' }).click(),
    ])

    await expect(page.getByText("Login yoki parol noto'g'ri")).toBeVisible()
    // Muvaffaqiyatsiz login'da tokenga /admin ochilmaydi
    await expect(page).toHaveURL(/\/admin\/login$/)
  })

  test("juda ko'p muvaffaqiyatsiz urinishdan keyin 429 (rate limit)", async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByPlaceholder('Login').fill(E2E_ADMIN_USERNAME)
    await page.getByPlaceholder('Parol').fill(E2E_WRONG_PASSWORD)
    const submit = page.getByRole('button', { name: /Kirish|Kirmoqda/ })

    // loginLimiter: 5 muvaffaqiyatsiz urinish / 15 daqiqa / IP (rateLimiters.js).
    // Oldingi testda allaqachon 1 ta muvaffaqiyatsiz urinish sarflangan bo'lishi
    // mumkin, shuning uchun aniq sonni emas, "qachonlardir 429 kelishi"ni tekshiramiz.
    let limited = false
    for (let i = 0; i < 7 && !limited; i++) {
      const [response] = await Promise.all([
        page.waitForResponse(res => res.url().endsWith('/api/admin/login')),
        submit.click(),
      ])
      limited = response.status() === 429
    }

    expect(limited).toBe(true)
    await expect(page.getByText(/Juda ko'p muvaffaqiyatsiz urinish/)).toBeVisible()
  })

  test("muddati o'tgan token bilan /admin ochilsa /admin/login ga yo'naltiradi", async ({ page }) => {
    // isTokenValid (src/utils/auth.js) faqat JWT payload'idagi `exp`ni o'qiydi,
    // imzoni tekshirmaydi — shuning uchun haqiqiy backend/JWT_SECRET kerak emas,
    // shaklan to'g'ri (3 qismli, muddati o'tgan) token yetarli.
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
    const payload = Buffer.from(JSON.stringify({
      username: E2E_ADMIN_USERNAME,
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 soat oldin tugagan
    })).toString('base64')
    const expiredToken = `${header}.${payload}.fake-signature`

    await page.goto('/')
    await page.evaluate(token => localStorage.setItem('kiu_token', token), expiredToken)

    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login$/)
    // PrivateRoute yaroqsiz/muddati o'tgan tokenni localStorage'dan o'chiradi
    const stored = await page.evaluate(() => localStorage.getItem('kiu_token'))
    expect(stored).toBeNull()
  })
})