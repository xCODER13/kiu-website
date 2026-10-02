/* global process */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')

// `selector { ... }` tanasini (ichma-ich qavslarsiz) qaytaradi
function bodyOf(selector) {
  const start = css.indexOf(selector)
  if (start === -1) return null
  const open = css.indexOf('{', start)
  return css.slice(open + 1, css.indexOf('}', open))
}

const declarations = (body) =>
  body.split(';').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean).sort()

describe('tokens.css', () => {
  it('Dark qiymatlar ikki blokda bir xil (tizim sozlamasi va foydalanuvchi tanlovi)', () => {
    const system = bodyOf(':root:not([data-theme="light"])')
    const chosen = bodyOf(':root[data-theme="dark"]')
    expect(system).not.toBeNull()
    expect(chosen).not.toBeNull()
    expect(declarations(system)).toEqual(declarations(chosen))
  })

  it('Dark blok color-scheme: dark e\'lon qiladi, Light — light', () => {
    expect(bodyOf(':root[data-theme="dark"]')).toMatch(/color-scheme:\s*dark/)
    expect(bodyOf(':root {')).toMatch(/color-scheme:\s*light/)
  })

  it('Dark blok faqat :root da e\'lon qilingan token\'larni o\'zgartiradi', () => {
    const light = bodyOf(':root {')
    const defined = new Set(light.match(/--[\w-]+(?=\s*:)/g))
    const dark = declarations(bodyOf(':root[data-theme="dark"]'))
      .map((line) => line.match(/^(--[\w-]+)\s*:/)?.[1])
      .filter(Boolean)
    expect(dark.filter((name) => !defined.has(name))).toEqual([])
  })
})
