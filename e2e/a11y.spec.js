import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'
import { mockPublicApi, stubExternal, PUBLIC_ROUTES } from './mocks.js'

// axe-core (WCAG 2.0/2.1 A + AA, `color-contrast` ham) — har bir ommaviy sahifa Light va Dark temada. Kutiladigan natija: 0 buzilish.
// Bazaviy o'lchov (PR #36 oldidan): 22 sahifa × 2 tema × 3 kenglik — 0. Shu testlar uni regressiyadan himoya qiladi.
// `.stat-2022` (Home hero dagi tashkil yili plitkasi) va iframe'lar chiqarib tashlanadi — avvalgi auditlar bilan bir xil.

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

for (const theme of ['light', 'dark']) {
  test.describe(`a11y (axe) — ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(t => localStorage.setItem('theme', t), theme)
      await mockPublicApi(page)
      await stubExternal(page, new Set())
    })

    for (const path of PUBLIC_ROUTES) {
      test(`${path}: 0 buzilish`, async ({ page }) => {
        await page.goto(path)
        await expect(page.locator('h1').first()).toBeVisible()
        await page.waitForLoadState('networkidle')
        // `.reveal` elementlar ko'rinish zonasiga kelganda paydo bo'ladi — kontrast ularda ham o'lchanishi uchun oxirigacha aylantiramiz
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) }
          scrollTo(0, 0)
        })
        await page.waitForTimeout(700) // `.reveal` o'tishi (0.6 s) tugasin
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).exclude('.stat-2022').exclude('iframe').analyze()
        expect(
          violations.map(v => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`),
        ).toEqual([])
      })
    }
  })
}
