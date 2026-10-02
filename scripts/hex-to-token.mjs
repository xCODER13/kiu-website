#!/usr/bin/env node
// Hardcoded ranglarni design token'larga almashtiradi (Bosqich 1).
//
//   node scripts/hex-to-token.mjs              — dry-run: fayl bo'yicha hisobot, hech narsa yozilmaydi
//   node scripts/hex-to-token.mjs --diff       — dry-run + o'zgaradigan qatorlar
//   node scripts/hex-to-token.mjs --manual     — dry-run + qo'lda ko'riladigan joylar (fayl:qator)
//   node scripts/hex-to-token.mjs --write      — o'zgarishlarni yozadi
//
// Qoida: faqat QIYMATI AYNAN BIR XIL va har ikki temada o'zgarmaydigan token'ga almashtiriladi,
// shuning uchun ko'rinish o'zgarmaydi. Noaniq joylar tegilmaydi — "qo'lda" ro'yxatiga chiqadi.
//
// Almashtirish xavfsiz bo'lgan joylar:
//   - .css fayllar;
//   - JSX `style={{ ... }}` ichidagi satrlar;
//   - DOM/SVG elementlarning rang atributlari (<path fill="#..."/>).
// Qolgan hamma joy (o'zgaruvchi, ma'lumot massivi, string qo'shish, <Komponent color="#..."/>) —
// qo'lda: u yerdagi hex canvas/kutubxonaga yoki `${rang}18` kabi hex+alpha yig'ishga ketishi mumkin,
// `var(--...)` esa ular uchun ishlamaydi.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as espree from 'espree'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const SRC = join(ROOT, 'src')
const rel = (file) => relative(ROOT, file).split(sep).join('/')

const WRITE = process.argv.includes('--write')
const SHOW_DIFF = process.argv.includes('--diff')
const SHOW_MANUAL = process.argv.includes('--manual')

// ── Xarita ────────────────────────────────────────────────────────────────
// Faqat har ikki temada bir xil qiymatli token'lar (tokens.css).
const STATIC = {
  '#7c3aed': 'var(--color-brand)',
  '#4f46e5': 'var(--color-brand-hover)',
  '#c8960c': 'var(--color-accent)',
  '#dc2626': 'var(--color-danger)',
  '#059669': 'var(--color-success)',
  '#d97706': 'var(--color-warning)',
  '#2563eb': 'var(--color-info)',
}
const ON_BRAND = 'var(--color-on-brand)' // faqat `color: #fff` uchun (fon bo'lsa — tema bilan almashadi)
const WHITE = new Set(['#fff', '#ffffff'])

// rgba(124, 58, 237, a) → brend rang a% shaffoflikda. `in srgb` — rgba bilan matematik jihatdan
// aynan bir xil natija beradi (oklab'da yaxlitlash farqi piksellarda ko'rinishi mumkin).
const BRAND_RGBA = /rgba\(\s*124\s*,\s*58\s*,\s*237\s*,\s*(0?\.\d+|1|0)\s*\)/g
const brandMix = (alpha) => `color-mix(in srgb, var(--color-brand) ${+(Number(alpha) * 100).toFixed(2)}%, transparent)`

// Ijtimoiy tarmoq brend ranglari — token'ga almashtirilmaydi.
const ALLOW = new Set(['#0088cc', '#0055aa', '#1877f2', '#ff0000'])
// Tema bilan almashadigan token kerak (light/dark qiymati farq qiladi) — Bosqich 3 da.
const THEMED = new Set(['#fff', '#ffffff', '#000', '#1a1a2e', '#6b7280', '#9ca3af', '#faf5ff', '#ede9fe', '#f0eeff',
  '#e5e7eb', '#f3f4f6', '#e8e8f0', '#0f0f1a', '#1e1b4b', '#2d1b69', '#13102b', '#16213e', '#e0e7ff'])

const HEX = /(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g
const SVG_COLOR_ATTRS = new Set(['fill', 'stroke', 'stopColor', 'floodColor', 'lightingColor', 'color'])
const SKIP_FILE = /(\.test\.[jt]sx?|tokens\.css|index\.css|App\.css)$/

// ── Yordamchilar ──────────────────────────────────────────────────────────
function* walkFiles(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) yield* walkFiles(full)
    else if (['.css', '.js', '.jsx'].includes(extname(name)) && !SKIP_FILE.test(name)) yield full
  }
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length

function reasonFor(hex) {
  const h = hex.toLowerCase()
  if (ALLOW.has(h)) return 'allow-list (ijtimoiy tarmoq)'
  if (THEMED.has(h)) return 'tema bilan almashadi (Bosqich 3)'
  return "aniq token yo'q (Bosqich 2)"
}

// ── JS/JSX: AST orqali kontekstni aniqlash ─────────────────────────────────
// Tugun `style={{...}}` ichida ekanini aniqlaydi (faqat xavfsiz oraliq tugunlar orqali).
const PASS_THROUGH = new Set(['Property', 'ObjectExpression', 'SpreadElement', 'ConditionalExpression',
  'LogicalExpression', 'TemplateLiteral', 'JSXExpressionContainer'])

function styleContext(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i]
    if (node.type === 'JSXAttribute') return node.name.name === 'style' ? 'style' : null
    if (!PASS_THROUGH.has(node.type)) return null
  }
  return null
}

function svgAttrContext(ancestors) {
  const attr = ancestors.at(-1)
  if (attr?.type !== 'JSXAttribute' || !SVG_COLOR_ATTRS.has(attr.name.name)) return false
  const element = ancestors.at(-2)?.name?.name
  return typeof element === 'string' && /^[a-z]/.test(element) // faqat DOM/SVG elementlar, <Komponent> emas
}

function* stringNodes(node, ancestors = []) {
  if (node.type === 'Literal' && typeof node.value === 'string') yield { node, ancestors }
  if (node.type === 'TemplateElement') yield { node, ancestors }
  for (const key of Object.keys(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range') continue
    const value = node[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child && typeof child.type === 'string') yield* stringNodes(child, [...ancestors, node])
    }
  }
}

// Shu tugun ichidagi rang bo'laklarini `edits` (almashtirishlar) yoki `manual` ga yig'adi.
function collect(text, { node, ancestors }, edits, manual) {
  const [start, end] = node.range
  const slice = text.slice(start, end)
  const inStyle = styleContext(ancestors) === 'style'
  const inSvgAttr = svgAttrContext(ancestors)
  const safe = inStyle || inSvgAttr
  const parent = ancestors.at(-1)
  const keyName = parent?.type === 'Property' && !parent.computed ? (parent.key.name ?? parent.key.value) : null
  const isWholeValue = node.type === 'Literal' && /^(['"])#[0-9a-fA-F]+\1$/.test(slice)

  for (const m of slice.matchAll(HEX)) {
    const hex = m[0].toLowerCase()
    const at = start + m.index
    const concatAlpha = text.startsWith('${', at + m[0].length) // `#7c3aed${alpha}` — hex + alpha yig'ish
    let token = STATIC[hex]
    if (!token && WHITE.has(hex) && keyName === 'color' && isWholeValue) token = ON_BRAND
    if (token && safe && !concatAlpha) {
      edits.push({ at, length: m[0].length, text: token, hex })
    } else if (!ALLOW.has(hex)) {
      const why = concatAlpha ? "hex + alpha qo'shiladi" : "style tashqarisida (ma'lumot/o'zgaruvchi)"
      manual.push({ at, hex, reason: token ? why : reasonFor(hex) })
    }
  }

  for (const m of slice.matchAll(BRAND_RGBA)) {
    const at = start + m.index
    if (safe) edits.push({ at, length: m[0].length, text: brandMix(m[1]), hex: 'rgba(124,58,237)' })
    else manual.push({ at, hex: m[0], reason: "style tashqarisida (ma'lumot/o'zgaruvchi)" })
  }
}

function processJs(text) {
  const edits = []
  const manual = []
  const ast = espree.parse(text, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true }, range: true })
  for (const entry of stringNodes(ast)) collect(text, entry, edits, manual)
  return { edits, manual }
}

// ── CSS: oddiy qidiruv ─────────────────────────────────────────────────────
function processCss(text) {
  const edits = []
  const manual = []
  for (const m of text.matchAll(HEX)) {
    const hex = m[0].toLowerCase()
    let token = STATIC[hex]
    if (!token && WHITE.has(hex) && /(?<![-\w])color\s*:\s*$/.test(text.slice(Math.max(0, m.index - 20), m.index))) token = ON_BRAND
    if (token) edits.push({ at: m.index, length: m[0].length, text: token, hex })
    else if (!ALLOW.has(hex)) manual.push({ at: m.index, hex, reason: reasonFor(hex) })
  }
  for (const m of text.matchAll(BRAND_RGBA)) edits.push({ at: m.index, length: m[0].length, text: brandMix(m[1]), hex: 'rgba(124,58,237)' })
  return { edits, manual }
}

function apply(text, edits) {
  let out = text
  for (const e of [...edits].sort((a, b) => b.at - a.at)) out = out.slice(0, e.at) + e.text + out.slice(e.at + e.length)
  return out
}

// ── Asosiy oqim ───────────────────────────────────────────────────────────
const perFile = []
const byToken = {}
const manualByReason = {}
let changed = 0

for (const file of walkFiles(SRC)) {
  const text = readFileSync(file, 'utf8')
  const { edits, manual } = extname(file) === '.css' ? processCss(text) : processJs(text)
  if (!edits.length && !manual.length) continue
  for (const e of edits) byToken[e.text] = (byToken[e.text] ?? 0) + 1
  for (const m of manual) manualByReason[m.reason] = (manualByReason[m.reason] ?? 0) + 1
  changed += edits.length
  perFile.push({ file, text, edits, manual })
  if (WRITE && edits.length) writeFileSync(file, apply(text, edits))
}

perFile.sort((a, b) => b.edits.length - a.edits.length)
console.log(`${WRITE ? 'YOZILDI' : 'DRY-RUN'}: ${changed} ta almashtirish, ${perFile.filter((f) => f.edits.length).length} ta faylda\n`)
console.log('Token bo\'yicha:')
for (const [t, n] of Object.entries(byToken).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${t}`)
console.log('\nQo\'lda qoladi (tegilmaydi):')
for (const [r, n] of Object.entries(manualByReason).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${r}`)
console.log('\nFayl bo\'yicha (almashtirish / qo\'lda):')
for (const f of perFile.slice(0, 25)) console.log(`  ${String(f.edits.length).padStart(4)} / ${String(f.manual.length).padEnd(4)} ${rel(f.file)}`)

if (SHOW_DIFF) {
  console.log('\n── O\'zgaradigan qatorlar (birinchi 40) ──')
  let shown = 0
  for (const f of perFile) {
    for (const e of f.edits) {
      if (shown++ >= 40) break
      const line = lineOf(f.text, e.at)
      console.log(`${rel(f.file)}:${line}  ${e.hex} → ${e.text}`)
    }
  }
}
if (SHOW_MANUAL) {
  console.log('\n── Qo\'lda ko\'riladigan joylar ──')
  for (const f of perFile) for (const m of f.manual) console.log(`${rel(f.file)}:${lineOf(f.text, m.at)}  ${m.hex}  [${m.reason}]`)
}
