// public/sitemap.xml'ni src/i18n/locale.js dagi tarjima ro'yxatlaridan yaratadi.
// Ishlatish: `node scripts/generate-sitemap.mjs` (faylni yangilaydi).
// Test (src/i18n/sitemap.test.js) fayl generator natijasi bilan bir xilligini tekshiradi —
// shuning uchun TRANSLATED_BY_LANG o'zgarganda sitemap'ni qo'lda yozish shart emas.
import { writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { DEFAULT_LANG, localizePath, translatedLangs } from '../src/i18n/locale.js'

export const SITE_URL = 'https://kiu-university.vercel.app'

// [yo'l, ustuvorlik] — tartib sitemap'dagi tartib
const PAGES = [
  ['/', 1.0], ['/about', 0.8], ['/faculty', 0.9], ['/admission', 0.9], ['/news', 0.8],
  ['/contact', 0.8], ['/faq', 0.7], ['/events', 0.7], ['/teachers', 0.7], ['/international', 0.7],
  ['/documents', 0.6], ['/achievements', 0.6], ['/student-life', 0.6], ['/hemis', 0.6],
  ['/vacancies', 0.6], ['/sorting-hat', 0.6], ['/testimonials', 0.5], ['/map', 0.5], ['/qrcode', 0.4],
]

const url = (path, lang) => `${SITE_URL}${localizePath(path, lang)}`

export function buildSitemap() {
  const out = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ]
  for (const [path, priority] of PAGES) {
    const langs = translatedLangs(path)
    for (const lang of langs) {
      const p = path === '/' && lang !== DEFAULT_LANG ? 0.9 : priority
      out.push('  <url>', `    <loc>${url(path, lang)}</loc>`)
      if (langs.length > 1) {
        for (const l of langs) out.push(`    <xhtml:link rel="alternate" hreflang="${l}" href="${url(path, l)}"/>`)
        out.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${url(path, DEFAULT_LANG)}"/>`)
      }
      out.push(`    <priority>${p.toFixed(1)}</priority>`, '  </url>')
    }
  }
  out.push('</urlset>', '')
  return out.join('\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const target = fileURLToPath(new URL('../public/sitemap.xml', import.meta.url))
  writeFileSync(target, buildSitemap())
  console.log(`sitemap yangilandi: ${target}`)
}
