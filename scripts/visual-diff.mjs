#!/usr/bin/env node
// Ikki build'ning ko'rinishini solishtiradi (migratsiya bosqichlarida "vizual farq 0" tekshiruvi).
//
// Foydalanish:
//   VITE_API_URL=http://api.test npx vite build --outDir /tmp/dist-old   # eski commit'da
//   VITE_API_URL=http://api.test npx vite build --outDir /tmp/dist-new   # yangi commit'da
//   node scripts/visual-diff.mjs /tmp/dist-old /tmp/dist-new [--quick] [--theme=light|dark]
//
// 19 sahifa × 3 kenglik × 2 tema × 2 til = 228 ta to'liq sahifa surati (--quick: 3 sahifa).
// Tashqi so'rovlar (shrift, xarita, rasm) to'sib qo'yiladi, API javobi bo'sh `[]` — natija
// deterministik. Farqli chiqqan sahifa 2 marta qayta olinadi:
//   - bitta build'ning o'zi har safar boshqacha chiqsa → "shovqin" (animatsiya, vaqt),
//   - har build barqaror, lekin ikkisi bir-biridan farq qilsa → "HAQIQIY farq".
// Chiqish kodi: haqiqiy farq bo'lsa 1, aks holda 0. "Shovqin" ro'yxatini ham ko'zdan kechiring:
// animatsiyali sahifada haqiqiy rang farqi shovqin ichida yashirinishi mumkin.
//
// Chromium: odatiy Playwright brauzeri; boshqa yo'l kerak bo'lsa PW_CHROMIUM_PATH=/yo'l/chrome.
import http from 'node:http'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { chromium } from '@playwright/test'

const [dirA, dirB] = process.argv.slice(2).filter((a) => !a.startsWith('--')).map((d) => resolve(d))
if (!dirA || !dirB) {
  console.error('Foydalanish: node scripts/visual-diff.mjs <eski-dist> <yangi-dist> [--quick]')
  process.exit(2)
}
const QUICK = process.argv.includes('--quick')

const ROUTES = QUICK
  ? ['/', '/faculty', '/contact']
  : ['/', '/faculty', '/admission', '/news', '/contact', '/about', '/hemis', '/international', '/documents',
     '/vacancies', '/faq', '/events', '/testimonials', '/achievements', '/qrcode', '/teachers', '/student-life',
     '/map', '/sorting-hat']
const LANGS = ['', '/ru']
const WIDTHS = [390, 768, 1280]
const THEME_ARG = process.argv.find((a) => a.startsWith('--theme='))?.slice(8)
const THEMES = THEME_ARG ? [THEME_ARG] : ['light', 'dark']
const RETRIES = 2

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }

function serve(dir) {
  return new Promise((done) => {
    const server = http.createServer((req, res) => {
      let file = join(dir, decodeURIComponent(req.url.split('?')[0]))
      if (!existsSync(file) || statSync(file).isDirectory()) file = join(dir, 'index.html') // SPA fallback
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
      res.end(readFileSync(file))
    })
    server.listen(0, '127.0.0.1', () => done({ server, origin: `http://127.0.0.1:${server.address().port}` }))
  })
}

async function newPage(browser, { theme, width }) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
  await context.addInitScript((t) => localStorage.setItem('theme', t), theme)
  await context.route((url) => !/^(http:\/\/127\.0\.0\.1|http:\/\/api\.test|data:|blob:)/.test(url.href), (r) => r.abort())
  await context.route(/api\.test/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  return { context, page: await context.newPage() }
}

async function shoot(page, url, settleMs) {
  await page.goto(url, { waitUntil: 'load' })
  // Sahifalar lazy yuklanadi: "Yuklanmoqda..." yo'qolib, footer chiqquncha kutamiz
  await page.waitForFunction(() => !document.body.innerText.includes('Yuklanmoqda') && document.querySelector('footer'), null, { timeout: 15_000 })
  await page.waitForTimeout(settleMs)
  const buffer = await page.screenshot({ fullPage: true, animations: 'disabled' })
  return createHash('sha256').update(buffer).digest('hex')
}

const [a, b] = await Promise.all([serve(dirA), serve(dirB)])
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {})
const real = []
const noise = []
let total = 0

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const { context, page } = await newPage(browser, { theme, width })
    for (const lang of LANGS) {
      for (const route of ROUTES) {
        const path = lang && route === '/' ? lang : `${lang}${route}`
        const label = `${theme} ${width}px ${lang || '/uz'}${route === '/' ? '' : route}`
        total++
        const first = [await shoot(page, a.origin + path, 500), await shoot(page, b.origin + path, 500)]
        if (first[0] === first[1]) continue

        // Farq bor: har build'ni qayta olib, barqarorligini tekshiramiz
        const hashesA = [first[0]]
        const hashesB = [first[1]]
        for (let i = 1; i <= RETRIES; i++) {
          hashesA.push(await shoot(page, a.origin + path, 500 + i * 700))
          hashesB.push(await shoot(page, b.origin + path, 500 + i * 700))
        }
        const stable = (hashes) => new Set(hashes).size === 1
        ;(stable(hashesA) && stable(hashesB) ? real : noise).push(label)
      }
    }
    await context.close()
  }
}

await browser.close()
a.server.close()
b.server.close()

console.log(`Jami: ${total} | bir xil: ${total - real.length - noise.length} | shovqin: ${noise.length} | HAQIQIY farq: ${real.length}`)
if (noise.length) console.log('Shovqin (animatsiya/vaqt, build\'ning o\'zi ham beqaror):\n  ' + noise.join('\n  '))
if (real.length) console.log('HAQIQIY farq:\n  ' + real.join('\n  '))
process.exit(real.length ? 1 : 0)
