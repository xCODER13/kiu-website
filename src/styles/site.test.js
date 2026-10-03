/* global process */
// site.css (Bosqich 5a): token qoidasi, qatlam va inline-style o'rnini bosgan hover/active qoidalari.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = f => readFileSync(resolve(process.cwd(), f), 'utf8')
const css = read('src/styles/site.css')
const code = css.replace(/\/\*[\s\S]*?\*\//g, '')

describe('site.css', () => {
  it("hex rang yo'q; rgb faqat oq/qora + alfa (soya va to'q yuza ustidagi chiziq)", () => {
    expect(code).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    const rgbs = code.match(/rgba?\([^)]*\)/g) ?? []
    expect(rgbs.every(c => /^rgb\((255 255 255|0 0 0) \//.test(c))).toBe(true)
  })

  it("hammasi `@layer components` ichida (qatlamsiz qoida `.container` kabilarni bosib o'tmasin)", () => {
    expect(code.trim()).toMatch(/^@layer components \{/)
    expect(code.trim()).toMatch(/\}$/)
  })

  it('outline yo\'qotilmagan', () => {
    expect(code).not.toMatch(/outline:\s*(none|0)\b/)
  })

  it("footer havolalari hover/fokusda oltin (`--color-accent-on-dark`) — CSS da (oldin JS onMouseEnter edi)", () => {
    expect(code).toMatch(/\.footer-link:hover, \.footer-link:focus-visible \{ color: var\(--color-accent-on-dark\); \}/)
    expect(code).toMatch(/\.footer-media-link:hover, \.footer-media-link:focus-visible \{ color: var\(--color-accent-on-dark\); \}/)
    expect(code).toMatch(/\.footer-social-link:hover, \.footer-social-link:focus-visible \{ color: var\(--color-accent-on-dark\);/)
  })

  it("faol holat: NavLink `active` klassi va trigger `data-active` bo'yicha", () => {
    expect(code).toMatch(/\.nav-link\.active,\s*\.nav-group-trigger\[data-active="true"\]/)
  })

  it('qidiruv: tanlangan natija va ochiq tugma aria atributlari bo\'yicha bo\'yaladi', () => {
    expect(code).toMatch(/\.search-option\[aria-selected="true"\]/)
    expect(code).toMatch(/\.nav-icon-btn\[aria-expanded="true"\]/)
  })

  it('mobil qidiruv paneli media query orqali (oldin JS `window.innerWidth`)', () => {
    expect(code).toMatch(/@media \(max-width: 768px\) \{\s*\.search-panel \{\s*position: fixed;/)
  })
})

describe('.container qatlamda', () => {
  const components = read('src/styles/components.css').replace(/\/\*[\s\S]*?\*\//g, '')
  const global = read('src/styles/global.css')
  it('components.css da (site.css dan oldin), global.css da qolmagan', () => {
    expect(components).toMatch(/@layer components \{\s*\.container \{/)
    expect(global).not.toMatch(/\.container(-wide)?\s*\{/)
  })
})
