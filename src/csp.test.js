/* global process */
// CSP Report-Only (vercel.json) va CSP bilan mos index.html: statik qoidalar. Haqiqiy brauzerda 0 buzilish — e2e/csp.spec.js.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = f => readFileSync(resolve(process.cwd(), f), 'utf8')
const cfg = JSON.parse(read('vercel.json'))
const html = read('index.html')
const headers = Object.fromEntries((cfg.headers.find(h => h.source === '/(.*)')?.headers ?? []).map(h => [h.key.toLowerCase(), h.value]))
const policy = headers['content-security-policy-report-only'] ?? ''
const dir = name => policy.split(';').map(d => d.trim()).find(d => d.startsWith(`${name} `)) ?? ''

describe('vercel.json: Content-Security-Policy-Report-Only', () => {
  it("faqat Report-Only (enforce emas) — butun saytga (`/(.*)`) beriladi; SPA rewrite saqlangan", () => {
    expect(policy).not.toBe('')
    expect(headers['content-security-policy']).toBeUndefined()
    expect(cfg.rewrites).toEqual([{ source: '/(.*)', destination: '/' }])
  })

  it("qat'iy asos: default-src 'self', object-src 'none', base-uri/form-action 'self', frame-ancestors 'self'", () => {
    expect(dir('default-src')).toBe("default-src 'self'")
    expect(dir('object-src')).toBe("object-src 'none'")
    expect(dir('base-uri')).toBe("base-uri 'self'")
    expect(dir('form-action')).toBe("form-action 'self'")
    expect(dir('frame-ancestors')).toBe("frame-ancestors 'self'")
  })

  it("skript va uslub: 'unsafe-inline' / 'unsafe-eval' yo'q; skript manbalari — o'zimiz + Google Tag Manager; uslub — o'zimiz + Google Fonts", () => {
    expect(policy).not.toMatch(/unsafe-eval|unsafe-inline|unsafe-hashes/)
    expect(dir('script-src')).toBe("script-src 'self' https://www.googletagmanager.com")
    expect(dir('style-src')).toBe("style-src 'self' https://fonts.googleapis.com")
    expect(dir('font-src')).toBe('font-src https://fonts.gstatic.com')
  })

  it("connect-src: API origin e2e/config.js (CSP_API_ORIGIN) bilan bir xil; Supabase (yuklash) va GA; http: va `*` yo'q", () => {
    const api = read('e2e/config.js').match(/CSP_API_ORIGIN = '([^']+)'/)?.[1]
    expect(api).toMatch(/^https:\/\//)
    const connect = dir('connect-src')
    expect(connect).toContain(` ${api}`)
    expect(connect).toContain('https://*.supabase.co')
    expect(connect).toContain('https://*.google-analytics.com')
    expect(policy).not.toMatch(/(^|[\s;])\*([\s;]|$)|\shttp:/)
  })

  it("iframe: faqat YouTube (Shorts) va Google Maps", () => {
    expect(dir('frame-src')).toBe('frame-src https://www.youtube.com https://maps.google.com https://www.google.com')
    // kodda ishlatiladigan iframe manbalari siyosatda bor
    expect(read('src/pages/news/ShortsTab.jsx')).toContain('https://www.youtube.com/embed/')
    expect(read('src/pages/Map.jsx')).toContain('https://maps.google.com/maps')
  })
})

describe('vercel.json: boshqa xavfsizlik header\'lari', () => {
  it("HSTS: kamida 1 yil; `includeSubDomains`/`preload` YO'Q (subdomen'lar HTTPS'ga tayyorligi noma'lum)", () => {
    const hsts = headers['strict-transport-security']
    expect(Number(hsts.match(/max-age=(\d+)/)?.[1])).toBeGreaterThanOrEqual(31536000)
    expect(hsts).not.toMatch(/includeSubDomains|preload/i)
  })

  it('nosniff, X-Frame-Options (CSP frame-ancestors enforce emas, shuning uchun alohida), Referrer-Policy', () => {
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })

  it("Permissions-Policy: ishlatilmaydigan imkoniyatlar yopiq; iframe'lar (YouTube/Xarita) ishlatadiganlariga tegilmagan", () => {
    const pp = headers['permissions-policy']
    for (const f of ['camera', 'microphone', 'geolocation', 'payment', 'usb']) expect(pp).toContain(`${f}=()`)
    // ShortsTab `allow=` bergan imkoniyatlarni yuqori darajada yopsak, delegatsiya ishlamay qoladi
    const allowed = read('src/pages/news/ShortsTab.jsx').match(/allow="([^"]+)"/)?.[1].split(';').map(x => x.trim()) ?? []
    expect(allowed.length).toBeGreaterThan(0)
    for (const f of allowed) expect(pp).not.toMatch(new RegExp(`(^|[\\s,])${f}=`))
  })

  it("barcha header'lar bitta `/(.*)` qoidada; SPA rewrite saqlangan", () => {
    expect(cfg.headers).toHaveLength(1)
    expect(cfg.rewrites).toEqual([{ source: '/(.*)', destination: '/' }])
  })
})

describe('index.html: CSP bilan mos', () => {
  it("inline hodisa handler (`onload=` va h.k.) va inline <script> yo'q; skriptlar tashqi fayl", () => {
    expect(html).not.toMatch(/\son[a-z]+\s*=\s*["']/i)
    const scripts = [...html.matchAll(/<script\b([^>]*)>/gi)].map(m => m[1])
    expect(scripts.length).toBeGreaterThan(0)
    for (const attrs of scripts) expect(attrs, '<script> src bilan bo\'lishi shart').toMatch(/\ssrc=|^src=/)
  })

  it("Google Fonts: preload + /fonts-init.js (stylesheet'ni qo'shadi) + <noscript> zaxirasi; uchalasida bir xil manzil", () => {
    const href = html.match(/rel="preload"\s+as="style"\s+href="([^"]+)"/)?.[1]
    expect(href).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?/)
    expect(html).toContain('<script src="/fonts-init.js" defer></script>')
    expect(html).toMatch(new RegExp(`<noscript>\\s*<link rel="stylesheet" href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
    expect(read('public/fonts-init.js')).toContain(`link.href = '${href}'`)
  })
})
