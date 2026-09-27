import { test, expect } from '@playwright/test'

// SortingHat.jsx lead so'rovi (postSortingHatLead) xato bo'lsa ham UI'ni
// to'xtatmaydi (faqat console.log), shuning uchun bu oqim backend'siz ham
// to'liq ishlaydi — lekin E2E muhitida baribir haqiqiy backend ishlab turadi.
//
// `main` bilan doiralab olamiz: Navbar/Footer ham har sahifada mavjud va
// o'zining "Ariza topshirish" kabi tugmalari bor — `<main>` faqat SortingHat
// sahifasining o'zini o'z ichiga oladi (App.jsx: PublicLayout -> <main>{children}</main>).

test.describe("Sorting Hat — to'liq oqim", () => {
  test('intro → royxatdan otish → test → natija → qayta otish', async ({ page }) => {
    await page.goto('/sorting-hat')
    const main = page.locator('main')

    await main.getByRole('button', { name: /Testni boshlash/ }).click()
    await expect(main.getByText('Bir qadam qoldi!')).toBeVisible()

    await main.getByPlaceholder(/Xurshid/).fill('Ali Valiyev')
    await main.getByPlaceholder('+998 90 123 45 67').fill('+998 90 123 45 67')
    await main.getByRole('button', { name: /Testni boshlash/ }).click()

    await expect(main.getByText(/Savol 1 \//)).toBeVisible()

    // Har safar birinchi variantni tanlaymiz. Har javobdan keyin ichki 480ms
    // taymer bor (SortingHat.jsx `pick`), shuning uchun kichik kutish qo'shildi.
    // 25 — haqiqiy savollar sonidan (bir necha o'nlab emas) ancha katta chegara.
    for (let i = 0; i < 25; i++) {
      if (await main.getByText('Tahlil tayyor!').isVisible().catch(() => false)) break
      await main.locator('button').first().click()
      await page.waitForTimeout(600)
    }

    await expect(main.getByText('Tahlil tayyor!')).toBeVisible()
    await expect(main.getByText('Eng mos', { exact: true })).toBeVisible()

    await main.getByRole('button', { name: /Qayta o'tish/ }).click()
    await expect(main.getByText('Bir qadam qoldi!')).toBeVisible()
  })

  test("ro'yxatdan o'tish: noto'g'ri ma'lumot bilan test boshlanmaydi", async ({ page }) => {
    await page.goto('/sorting-hat')
    const main = page.locator('main')

    await main.getByRole('button', { name: /Testni boshlash/ }).click()
    await main.getByPlaceholder(/Xurshid/).fill('Ali')
    await main.getByPlaceholder('+998 90 123 45 67').fill('12')
    await main.getByRole('button', { name: /Testni boshlash/ }).click()

    await expect(main.getByText(/to'liq kiriting/)).toBeVisible()
    await expect(main.getByText(/Telefon raqam noto'g'ri/)).toBeVisible()
    await expect(main.getByText(/Savol 1 \//)).not.toBeVisible()
  })

  test('"Orqaga" intro bosqichiga qaytaradi', async ({ page }) => {
    await page.goto('/sorting-hat')
    const main = page.locator('main')

    await main.getByRole('button', { name: /Testni boshlash/ }).click()
    await main.getByRole('button', { name: /Orqaga/ }).click()
    await expect(main.getByText('Bir qadam qoldi!')).not.toBeVisible()
    await expect(main.getByRole('button', { name: /Testni boshlash/ })).toBeVisible()
  })
})