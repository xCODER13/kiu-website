import { test, expect } from '@playwright/test'

// Ariza formasi — haqiqiy backend + haqiqiy (bo'sh) test Mongo bazasiga
// POST /api/applications yuboradi (ApplyModal.jsx). Navbar'dagi global
// "Ariza topshirish" tugmasi ishlatiladi — u har qanday sahifada mavjud.

test.describe('Ariza topshirish (public)', () => {
  test("to'g'ri ma'lumot bilan ariza muvaffaqiyatli yuboriladi", async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Ariza topshirish' }).click()

    await page.getByPlaceholder('Ism Familiya').fill('Aziz Karimov')
    await page.getByPlaceholder('+998 90 123 45 67').fill('+998 90 123 45 67')
    await page.locator('select[name="faculty"]').selectOption({ label: 'Dasturiy injiniring' })

    await Promise.all([
      page.waitForResponse(res => res.url().endsWith('/api/applications') && res.request().method() === 'POST'),
      page.getByRole('button', { name: 'Yuborish' }).click(),
    ])

    await expect(page.getByText('Ariza yuborildi!')).toBeVisible()
    await page.getByRole('button', { name: 'Yopish', exact: true }).click()
    await expect(page.getByText('Ariza yuborildi!')).not.toBeVisible()
  })

  test("noto'g'ri telefon raqami bilan forma yuborilmaydi (client validatsiya)", async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Ariza topshirish' }).click()

    await page.getByPlaceholder('Ism Familiya').fill('Aziz Karimov')
    await page.getByPlaceholder('+998 90 123 45 67').fill('123')
    await page.getByRole('button', { name: 'Yuborish' }).click()

    await expect(page.getByText(/Telefon raqam noto'g'ri/)).toBeVisible()
    await expect(page.getByText('Ariza yuborildi!')).not.toBeVisible()
  })

  test("ism-familiya bitta so'zdan iborat bo'lsa forma yuborilmaydi", async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Ariza topshirish' }).click()

    await page.getByPlaceholder('Ism Familiya').fill('Aziz')
    await page.getByPlaceholder('+998 90 123 45 67').fill('+998 90 123 45 67')
    await page.getByRole('button', { name: 'Yuborish' }).click()

    await expect(page.getByText(/to'liq kiriting/)).toBeVisible()
    await expect(page.getByText('Ariza yuborildi!')).not.toBeVisible()
  })
})