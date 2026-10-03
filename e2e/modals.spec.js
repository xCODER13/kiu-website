import { test, expect } from '@playwright/test'
import { mockPublicApi, stubExternal } from './mocks.js'

// Ommaviy sayt oynalari: yo'nalish modali, o'qituvchi modali, qidiruv paneli — klaviatura (Esc, Tab tuzog'i, fokus qaytishi),
// skrollsiz sig'ish (PR #35) va shaxsiy ma'lumot (email) chiqmasligi.

test.beforeEach(async ({ page }) => {
  await mockPublicApi(page)
  await stubExternal(page, new Set())
})

test.describe("yo'nalish modali", () => {
  test('ochiladi, Esc yopadi, fokus kartaga qaytadi; ichki skroll yo\'q (1440×730)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 730 })
    await page.goto('/faculty')
    const card = page.locator('.card.faculty-card').first()
    await card.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const scrolls = await dialog.evaluate(el => el.scrollHeight > el.clientHeight + 1)
    expect(scrolls, 'modal ichida vertikal skroll bo\'lmasligi kerak').toBe(false)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(card).toBeFocused()
  })

  test("Tab fokusni sahifa kontentiga chiqarmaydi (fon `inert`): fokus modal ichida yoki brauzer interfeysida", async ({ page }) => {
    await page.goto('/faculty')
    await page.locator('.card.faculty-card').first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      // Modal ichida yoki <body> (brauzer interfeysiga chiqish — native <dialog> kabi); `#root` (fon) ichida emas
      const ok = await dialog.evaluate(el => el.contains(document.activeElement) || document.activeElement === document.body)
      expect(ok, `Tab #${i + 1}: fokus fon sahifaga chiqib ketdi`).toBe(true)
    }
  })
})

test.describe("o'qituvchi modali", () => {
  test("karta bosilganda: ism, lavozim, kafedra; email yo'q; Esc yopadi, fokus qaytadi", async ({ page }) => {
    await page.goto('/teachers')
    const card = page.getByRole('button', { name: 'Ali Valiyev' })
    await card.click()
    const dialog = page.getByRole('dialog', { name: 'Ali Valiyev' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Dotsent')
    await expect(dialog).toContainText('Aniq fanlar kafedrasi')
    await expect(dialog).not.toContainText('@')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(card).toBeFocused()
  })

  test('klaviatura: Enter bilan ochiladi', async ({ page }) => {
    await page.goto('/teachers')
    await page.getByRole('button', { name: 'Nodira Qodirova' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Nodira Qodirova' })).toBeVisible()
  })
})

test.describe('qidiruv paneli', () => {
  test("ochiladi, yozilganda natija chiqadi, natija sahifaga olib boradi; Esc yopadi", async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Qidiruv' }).first().click()
    const panel = page.getByRole('dialog', { name: /Qidiring/ })
    await expect(panel).toBeVisible()
    await panel.getByRole('combobox').fill('qabul')
    const first = panel.getByRole('option').first()
    await expect(first).toBeVisible()
    await first.click()
    await expect(panel).toBeHidden()
    await expect(page.locator('h1').first()).toBeVisible()

    await page.getByRole('button', { name: 'Qidiruv' }).first().click()
    await expect(panel).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
  })
})
