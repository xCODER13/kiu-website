import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { buildSitemap } from '../../scripts/generate-sitemap.mjs'

describe('public/sitemap.xml', () => {
  it("generator natijasi bilan bir xil (tarjima ro'yxati o'zgarsa: node scripts/generate-sitemap.mjs)", () => {
    // cwd = loyiha ildizi (jsdom'da import.meta.url file: emas).
    // Windows'da git (core.autocrlf) faylni CRLF bilan chiqarishi mumkin — mazmun bir xil bo'lsa yetarli.
    const actual = readFileSync('public/sitemap.xml', 'utf-8').replace(/\r\n/g, '\n')
    expect(actual).toBe(buildSitemap())
  })

  it("har URL o'z tilidagi hreflang'ni o'z ichiga oladi va x-default o'zbekcha", () => {
    const xml = buildSitemap()
    expect(xml).toContain('<loc>https://kiu-university.vercel.app/ru</loc>')
    expect(xml).toContain('hreflang="ru" href="https://kiu-university.vercel.app/ru"')
    expect(xml).toContain('hreflang="x-default" href="https://kiu-university.vercel.app/"')
    expect(xml).toContain('<loc>https://kiu-university.vercel.app/ru/about</loc>')
    expect(xml).toContain('<loc>https://kiu-university.vercel.app/ru/news</loc>')
    expect((xml.match(/<url>/g) || []).length).toBe(57) // 19 sahifa × 3 til
  })
})