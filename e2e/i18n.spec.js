import { test, expect } from '@playwright/test'
import { mockPublicApi, stubExternal } from './mocks.js'

// Til: /ru, /en prefikslari, almashtirgich, lazy tarjima paketlari (PR #37). Standart til (uz) kirish faylida,
// en/ru faqat kerak bo'lganda yuklanadi; birinchi chizilishda o'zbekcha matn "miltillamasligi" kerak.

test.beforeEach(async ({ page }) => {
  await mockPublicApi(page)
  await stubExternal(page, new Set())
})

const localeRequests = page => {
  const hits = []
  page.on('request', r => { const m = r.url().match(/locales\/(ru|en)(?:-[\w-]+)?\.(?:json|js)/); if (m) hits.push(m[1]) })
  return hits
}

test.describe('til', () => {
  test("o'zbekcha sahifa en/ru paketini yuklamaydi", async ({ page }) => {
    const hits = localeRequests(page)
    await page.goto('/faq')
    await expect(page.locator('h1').first()).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(hits).toEqual([])
  })

  test("/ru: faqat ru paketi, <html lang>, h1 ruscha — birinchi chizilishdan o'zbekcha matn ko'rinmaydi", async ({ page }) => {
    const hits = localeRequests(page)
    await page.addInitScript(() => {
      window.__h1 = []
      new MutationObserver(() => {
        const h = document.querySelector('h1')
        if (h && window.__h1.at(-1) !== h.textContent) window.__h1.push(h.textContent)
      }).observe(document, { childList: true, subtree: true, characterData: true })
    })
    await page.goto('/ru/faq')
    await expect(page.locator('h1').first()).toHaveText('Часто задаваемые вопросы')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
    expect(new Set(hits)).toEqual(new Set(['ru']))
    expect(await page.evaluate(() => window.__h1)).toEqual(['Часто задаваемые вопросы'])
  })

  test("/en/admission: inglizcha matn va <html lang=en>", async ({ page }) => {
    await page.goto('/en/admission')
    await expect(page.locator('h1').first()).toContainText('Admission')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test("almashtirgich: UZ → RU → EN → UZ, sahifa saqlanadi (/faq), URL prefiksi va matn almashadi", async ({ page }) => {
    await page.goto('/faq')
    const h1 = page.locator('h1').first()
    await expect(h1).toHaveText("Ko'p so'raladigan savollar")

    await page.locator('.lang-switch a[lang="ru"]:visible').first().click()
    await expect(page).toHaveURL(/\/ru\/faq$/)
    await expect(h1).toHaveText('Часто задаваемые вопросы')

    await page.locator('.lang-switch a[lang="en"]:visible').first().click()
    await expect(page).toHaveURL(/\/en\/faq$/)
    await expect(h1).not.toHaveText('Часто задаваемые вопросы')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    await page.locator('.lang-switch a[lang="uz"]:visible').first().click()
    await expect(page).toHaveURL(/\/faq$/)
    await expect(h1).toHaveText("Ko'p so'raladigan savollar")
  })

  test("ichki havolalar tilni saqlaydi: /ru da navbar havolasi /ru/... ga olib boradi", async ({ page }) => {
    await page.goto('/ru')
    const href = await page.locator('a[href$="/admission"]:visible').first().getAttribute('href')
    expect(href).toBe('/ru/admission')
  })
})
