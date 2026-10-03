/* global process */
// components.css qoidalari (6-bo'lim): faqat token, fokus halqasi bor, outline yo'qotilmagan.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles/components.css'), 'utf8')
const code = css.replace(/\/\*[\s\S]*?\*\//g, '')

describe('components.css', () => {
  it("qattiq hex/rgb rang yo'q — faqat token (soya uchun oq `rgb(255 255 255 / a)` istisno)", () => {
    expect(code).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    const rgbs = code.match(/rgba?\([^)]*\)/g) ?? []
    expect(rgbs.every(c => c.startsWith('rgb(255 255 255 /'))).toBe(true)
  })

  it('yagona :focus-visible halqasi base qatlamida e\'lon qilingan va outline yo\'qotilmagan', () => {
    expect(code).toMatch(/@layer base[\s\S]*:focus-visible[\s\S]*outline: 2px solid var\(--color-focus\)/)
    expect(code).not.toMatch(/outline:\s*(none|0)\b/)
  })

  it('forced-colors rejimida halqa tizim rangida', () => {
    expect(code).toMatch(/forced-colors: active[\s\S]*Highlight/)
  })

  it("hover siljishi faqat prefers-reduced-motion: no-preference ichida", () => {
    const withoutMotion = code.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}/g, '')
    expect(withoutMotion).not.toMatch(/translateY/)
  })

  it('barcha tugma variantlari mavjud', () => {
    for (const v of ['primary', 'secondary', 'ghost', 'danger', 'accent', 'gold']) {
      expect(code).toContain(`.btn-${v}`)
    }
  })

  it("`.btn-gold` — `.btn-accent` bilan bir qoida (alias)", () => {
    expect(code).toMatch(/\.btn-accent, \.btn-gold \{/)
  })
})

describe('global.css', () => {
  const global = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8')

  it('eski .btn / .card qoidalari qayta qatlamsiz yozilmagan (components.css da)', () => {
    expect(global).not.toMatch(/^\.btn\b/m)
    expect(global).not.toMatch(/^\.card\b/m)
  })

  it('reset va base qatlamlarga olingan (qatlamsiz `*` qoida komponent padding\'ini bosib o\'tmasin)', () => {
    expect(global).toMatch(/@layer reset \{\s*\*, \*::before, \*::after/)
    expect(global).toMatch(/@layer base \{[\s\S]*?\ba \{/)
  })
})

describe('6.19: ContentLangNote — inline style klassga ko\'chdi', () => {
  it('`.content-lang-note` qoidasi token orqali: 12 px, 6 px, --color-text-muted (hex yo\'q)', () => {
    const rule = css.match(/\.content-lang-note\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/margin-top:\s*6px/)
    expect(rule).toMatch(/font-size:\s*12px/)
    expect(rule).toMatch(/color:\s*var\(--color-text-muted\)/)
    expect(rule).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })
})

