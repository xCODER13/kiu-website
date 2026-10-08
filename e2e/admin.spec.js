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

  // 6.25: tasdiq dialogida «O'chirish» tugmasi band bo'lganda BITTA spinner bo'lishi kerak. 6.23 da umumiy
  // `.btn[aria-busy]::after` (CSS spinner) va ichidagi SVG spinner birga aylanardi; birlik testi faqat CSS matnini
  // tekshirgani uchun xatoni ushlamadi — shuning uchun haqiqiy brauzerda hisoblangan uslub tekshiriladi.
  // `ConfirmDialog` hamma admin sahifalarida (Arizalar, Vakansiyalar, Yangiliklar, Tadbirlar …) bitta komponent.
  test("o'chirish dialogi band holatda bitta spinner (ikkinchi `::after` yo'q)", async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('link', { name: 'Yangiliklar', exact: true }).click()
    const title = `E2E dialog sinovi ${Date.now()}`
    await page.getByRole('button', { name: 'Yangi yangilik' }).first().click()
    await page.getByLabel(/^Sarlavha/).fill(title)
    await Promise.all([
      page.waitForResponse(res => res.url().endsWith('/api/news') && res.request().method() === 'POST'),
      page.getByRole('button', { name: "Qo'shish", exact: true }).click(),
    ])
    await expect(page.getByText(title)).toBeVisible()

    // DELETE so'rovi ushlab turiladi — dialog «band» holatda qoladi
    let release
    const held = new Promise(resolve => { release = resolve })
    await page.route('**/api/news/*', async route => {
      if (route.request().method() !== 'DELETE') return route.continue()
      await held
      await route.continue()
    })

    await page.getByRole('button', { name: `O'chirish: ${title}` }).click()
    const confirm = page.getByRole('alertdialog').getByRole('button', { name: "O'chirish" })
    await confirm.click()
    await expect(confirm).toHaveAttribute('aria-busy', 'true')
    const spinners = await confirm.evaluate(el => ({
      svgs: el.querySelectorAll('svg').length,
      after: getComputedStyle(el, '::after').content,
    }))
    expect(spinners).toEqual({ svgs: 1, after: 'none' })

    // Tozalash: ushlangan so'rov yuboriladi
    release()
    await expect(page.getByRole('alertdialog')).toBeHidden()
    await expect(page.getByRole('heading', { name: title })).toHaveCount(0)
  })
})

test.describe('Admin: tadbirlar boshqaruvi', () => {
  test("login → tadbir qo'shish (kelgusi bo'limda) → o'chirish", async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('link', { name: 'Tadbirlar', exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/events$/)

    const title = `E2E sinov tadbiri ${Date.now()}`
    await page.getByRole('button', { name: 'Yangi tadbir' }).first().click()

    // Bo'sh maydonlar: sarlavha va sana uchun ALOHIDA xabar (avval bitta `alert()`), so'rov ketmaydi
    await page.getByRole('button', { name: "Qo'shish", exact: true }).click()
    await expect(page.getByText('Sarlavha kiritilishi shart.')).toBeVisible()
    await expect(page.getByText('Sanani tanlang.')).toBeVisible()

    await page.getByLabel(/^Sarlavha/).fill(title)
    await page.getByLabel(/^Sana/).fill('2099-10-15')
    await Promise.all([
      page.waitForResponse(res => res.url().endsWith('/api/events') && res.request().method() === 'POST'),
      page.getByRole('button', { name: "Qo'shish", exact: true }).click(),
    ])

    // Sana 2099 — «Kelgusi tadbirlar» bo'limida, plitka va yil bilan
    const upcoming = page.getByRole('region', { name: 'Kelgusi tadbirlar' })
    const row = upcoming.getByRole('listitem').filter({ hasText: title })
    await expect(row).toBeVisible()
    await expect(row).toContainText('15 oktyabr 2099')

    await page.getByRole('button', { name: `O'chirish: ${title}` }).click()
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/events/') && res.request().method() === 'DELETE'),
      page.getByRole('alertdialog').getByRole('button', { name: "O'chirish" }).click(),
    ])
    await expect(page.getByRole('alertdialog')).toBeHidden()
    await expect(page.getByRole('heading', { name: title })).toHaveCount(0)
  })
})

test.describe('Admin: galereya boshqaruvi', () => {
  // Albom yaratish rasm yuklashni (Supabase) talab qiladi — CI'da u yo'q, shuning uchun yozish so'rovlari yuborilmaydi:
  // forma, validatsiya, rasm tanlash, 10/10 holati va «saqlanmagan o'zgarishlar» dialogi tekshiriladi.
  const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
  const file = i => ({ name: `rasm-${i}.png`, mimeType: 'image/png', buffer: PNG })

  test("login → forma validatsiyasi → rasm tanlash → 10/10 → saqlanmagan o'zgarishlar dialogi", async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('link', { name: 'Galereya', exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/gallery$/)
    await expect(page.getByRole('heading', { level: 2, name: 'Galereya' })).toBeVisible()

    await page.getByRole('button', { name: 'Yangi albom' }).first().click()

    // Bo'sh forma: nom va rasm uchun ALOHIDA xabar (avval ketma-ket ikkita `alert()`)
    await page.getByRole('button', { name: "Qo'shish", exact: true }).click()
    await expect(page.getByText('Albom nomini kiriting.')).toBeVisible()
    await expect(page.getByText('Kamida bitta rasm tanlang.')).toBeVisible()

    await page.getByLabel(/^Nomi/).fill('E2E albom')
    const input = page.locator('input[type=file]')
    await input.setInputFiles([file(1), file(2)])
    await expect(page.locator('.adm-ithumb')).toHaveCount(2)
    await expect(page.getByText('2 / 10')).toBeVisible()
    await expect(page.getByText('Kamida bitta rasm tanlang.')).toBeHidden()

    // 10 / 10: yuklash maydoni o'chadi, qo'shish imkonsiz
    await input.setInputFiles(Array.from({ length: 8 }, (_, i) => file(i + 3)))
    await expect(page.locator('.adm-ithumb')).toHaveCount(10)
    await expect(page.getByText("Albom to'ldi — 10 ta rasm")).toBeVisible()
    await expect(input).toBeDisabled()

    // Saqlanmagan o'zgarishlar: «Bekor qilish» jimgina tozalamaydi
    await page.getByRole('button', { name: 'Bekor qilish' }).click()
    const dialog = page.getByRole('alertdialog', { name: "Saqlanmagan o'zgarishlar bor" })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Tahrirlashda qolish' }).click()
    await expect(page.getByLabel(/^Nomi/)).toHaveValue('E2E albom')
    await page.getByRole('button', { name: 'Bekor qilish' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Chiqish' }).click()
    await expect(page.getByLabel(/^Nomi/)).toHaveCount(0)
  })
})

