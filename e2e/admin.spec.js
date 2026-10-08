import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { loginAsAdmin } from './helpers.js'

// 1x1 shaffof PNG — faqat rasm yuklash yo'lini (multer -> Supabase) sinash
// uchun eng kichik haqiqiy PNG. Hech qanday haqiqiy/production fayl emas.
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

// Sidebar havolasi va Dashboard'dagi "N Yangiliklar" KPI kartasi ikkalasi ham /admin/news'ga
// olib boruvchi link. /Yangiliklar/ regex'i Stats yuklangach IKKALASIGA mos keladi (strict mode
// violation) — ya'ni test faqat KPI kartalari chiqishidan oldin bosilsagina o'tardi (poyga).
// Sidebar havolasining nomi aynan "Yangiliklar"; kartaniki "<son> Yangiliklar" — shuning uchun exact: true.
test.describe('Admin: yangiliklar boshqaruvi', () => {
  test("login → yangilik qo'shish → o'chirish", async ({ page }) => {
    await loginAsAdmin(page)

    await page.getByRole('link', { name: 'Yangiliklar', exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/news$/)

    const title = `E2E sinov yangiligi ${Date.now()}`
    // Bo'sh ro'yxatda «Yangi yangilik» tugmasi ikkita (sarlavha + bo'sh holat) — birinchisi
    await page.getByRole('button', { name: 'Yangi yangilik' }).first().click()
    await page.getByLabel(/^Sarlavha/).fill(title)
    await page.locator('textarea').fill("Bu — Playwright E2E test tomonidan yaratilgan vaqtinchalik yozuv.")

    await Promise.all([
      page.waitForResponse(res => res.url().endsWith('/api/news') && res.request().method() === 'POST'),
      page.getByRole('button', { name: "Qo'shish", exact: true }).click(),
    ])

    // Yangi yozuv ro'yxatda ko'rinishi kerak
    await expect(page.getByText(title)).toBeVisible()

    // 6.24: o'chirish tugmasi `aria-label="O'chirish: <sarlavha>"`, tasdiq — ilovaning o'z `alertdialog`i
    // (avval brauzer `confirm()` dialogi edi).
    await page.getByRole('button', { name: `O'chirish: ${title}` }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/news/') && res.request().method() === 'DELETE'),
      dialog.getByRole('button', { name: "O'chirish" }).click(),
    ])

    await expect(page.getByText(title)).not.toBeVisible()
  })

  // Haqiqiy rasm yuklash Supabase Storage'ga (service_role kalit bilan) boradi —
  // hech qanday kalit repo'ga yozilmaydi (loyihada avval aynan shu turdagi
  // hardcoded Supabase kaliti bo'lgan xato takrorlanmasin). Shuning uchun bu
  // test faqat SUPABASE_URL/SUPABASE_SERVICE_KEY CI sirlari (sinov bucket'iga
  // ishora qiladigan) mavjud bo'lgandagina ishlaydi, aks holda ochiq skip qilinadi.
  test('rasm yuklash (faqat Supabase sinov kalitlari mavjud bo\'lsa)', async ({ page }) => {
    test.skip(
      !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY,
      'SUPABASE_URL / SUPABASE_SERVICE_KEY sozlanmagan — rasm yuklash sinovi o\'tkazib yuborildi'
    )

    await loginAsAdmin(page)
    await page.getByRole('link', { name: 'Yangiliklar', exact: true }).click()

    const title = `E2E rasm sinovi ${Date.now()}`
    const imgPath = path.join(os.tmpdir(), `e2e-tiny-${Date.now()}.png`)
    fs.writeFileSync(imgPath, Buffer.from(TINY_PNG_BASE64, 'base64'))

    try {
      await page.getByRole('button', { name: 'Yangi yangilik' }).first().click()
      await page.getByLabel(/^Sarlavha/).fill(title)
      await page.locator('input[type="file"]').setInputFiles(imgPath)
      await expect(page.getByAltText('rasm-1')).toBeVisible()

      await Promise.all([
        page.waitForResponse(res => res.url().endsWith('/api/news') && res.request().method() === 'POST'),
        page.getByRole('button', { name: "Qo'shish", exact: true }).click(),
      ])

      await expect(page.getByText(title)).toBeVisible()

      // Tozalash
      await page.getByRole('button', { name: `O'chirish: ${title}` }).click()
      await page.getByRole('alertdialog').getByRole('button', { name: "O'chirish" }).click()
      await expect(page.getByText(title)).not.toBeVisible()
    } finally {
      fs.rmSync(imgPath, { force: true })
    }
  })
})