/* global process */
// vercel.json 301 yo'naltirishlari: «Galereya» sahifasi /student-life ga ko'chdi (Talabalar hayoti).
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const cfg = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'))

describe('vercel.json: eski /gallery manzili', () => {
  it("/gallery va /ru|en/gallery doimiy (301) /student-life ga yo'naltiriladi, til prefiksi saqlanadi", () => {
    expect(cfg.redirects).toEqual([
      { source: '/gallery', destination: '/student-life', permanent: true },
      { source: '/:lang(ru|en)/gallery', destination: '/:lang/student-life', permanent: true },
    ])
  })

  it('statik rasmlar (/gallery/…png, public/gallery/) yo\'naltirilmaydi: manbalar aniq manzil', () => {
    for (const r of cfg.redirects) expect(r.source).not.toMatch(/\*|\(\.\*\)|:path/)
  })

  it('SPA rewrite o\'zgarmagan', () => {
    expect(cfg.rewrites).toEqual([{ source: '/(.*)', destination: '/' }])
  })
})
