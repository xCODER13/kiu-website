/* global process */
// 6.30: `!important` butunlay yo'q. Qatlam tartibi (reset < tokens < base < components < utilities < QATLAMSIZ) va oddiy specificity yetadi.
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const dir = resolve(process.cwd(), 'src/styles')
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '')
const files = readdirSync(dir).filter(f => f.endsWith('.css'))
const read = f => readFileSync(resolve(dir, f), 'utf8')

describe('6.30: !important yo\'q', () => {
  it.each(files)('%s: izohdan tashqari kodda `!important` yo\'q', f => {
    expect(strip(read(f))).not.toMatch(/!important/)
  })

  it("`.desktop-nav` / `.mobile-nav` — qatlamsiz (qatlamli qoidalardan ustun), `@layer` ichida emas", () => {
    const css = strip(read('global.css'))
    const outside = css.replace(/@layer [a-z]+ \{[\s\S]*?\n\}/g, '')   // qatlam bloklarini olib tashlaymiz
    expect(outside).toMatch(/\.desktop-nav \{ display: flex; \}/)
    expect(outside).toMatch(/\.mobile-nav\s+\{ display: none; \}/)
    expect(outside).toMatch(/@media \(max-width: 1180px\) \{\s*\.desktop-nav \{ display: none; \}\s*\.mobile-nav\s+\{ display: flex; \}/)
  })

  it("`.nav-group.force-closed .nav-group-panel` hover/fokus qoidalaridan KEYIN turadi (bir xil specificity — tartib hal qiladi)", () => {
    const css = strip(read('site.css'))
    const hover = css.indexOf('.nav-group:focus-within .nav-group-panel {')
    const closed = css.indexOf('.nav-group.force-closed .nav-group-panel {')
    expect(hover).toBeGreaterThan(-1)
    expect(closed).toBeGreaterThan(hover)
    expect(css.slice(closed, closed + 200)).toMatch(/opacity: 0;[\s\S]*visibility: hidden;[\s\S]*pointer-events: none;/)
  })
})
