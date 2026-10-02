#!/usr/bin/env node
// Qo'lda yozilgan (hardcoded) ranglar hisoboti.
//
// Foydalanish:
//   node scripts/check-colors.mjs            — hisobotni konsolga chiqaradi
//   node scripts/check-colors.mjs --write    — hisobotni scripts/check-colors.baseline.json ga saqlaydi
//   node scripts/check-colors.mjs --compare  — baza bilan solishtiradi (o'sish bo'lsa ogohlantiradi)
//
// Bosqich 0: faqat HISOBOT — chiqish kodi har doim 0, CI'ni to'xtatmaydi.
// Maqsad: Bosqich 1–2 da hex qiymatlar token'larga almashgani sayin son kamayishini ko'rish.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join, relative, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const SRC = join(ROOT, 'src')
const rel = (file) => relative(ROOT, file).split(sep).join('/') // Windows'da ham baza bir xil bo'lsin
const BASELINE = join(ROOT, 'scripts', 'check-colors.baseline.json')

const EXTENSIONS = new Set(['.css', '.js', '.jsx'])
const SKIP_FILE = /(\.test\.[jt]sx?|tokens\.css)$/

// #rgb, #rgba, #rrggbb, #rrggbbaa (HTML entity `&#123;` va URL bo'lagi `/#abc` hisobga olinmaydi)
const HEX = /(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g
const FUNC = /\b(?:rgba?|hsla?)\(/g

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) yield* walk(full)
    else if (EXTENSIONS.has(extname(name)) && !SKIP_FILE.test(name)) yield full
  }
}

function scan() {
  const perFile = {}
  const perValue = {}
  for (const file of walk(SRC)) {
    const text = readFileSync(file, 'utf8')
    const hexes = (text.match(HEX) ?? []).map((v) => v.toLowerCase())
    const funcs = (text.match(FUNC) ?? []).length
    if (hexes.length + funcs === 0) continue
    perFile[rel(file)] = { hex: hexes.length, func: funcs }
    for (const v of hexes) perValue[v] = (perValue[v] ?? 0) + 1
  }
  const sum = (key) => Object.values(perFile).reduce((n, f) => n + f[key], 0)
  return {
    totals: { hex: sum('hex'), func: sum('func'), files: Object.keys(perFile).length, uniqueHex: Object.keys(perValue).length },
    perFile: sortByCount(perFile, (f) => f.hex + f.func),
    perValue: sortByCount(perValue, (n) => n),
  }
}

function sortByCount(obj, score) {
  return Object.fromEntries(Object.entries(obj).sort((a, b) => score(b[1]) - score(a[1]) || a[0].localeCompare(b[0])))
}

function print(report) {
  const { totals, perFile, perValue } = report
  console.log(`Hardcoded ranglar: ${totals.hex} ta hex (${totals.uniqueHex} xil), ${totals.func} ta rgb()/hsl(), ${totals.files} ta faylda\n`)
  console.log('Eng ko\'p ishlatilgan hex qiymatlar:')
  for (const [v, n] of Object.entries(perValue).slice(0, 15)) console.log(`  ${v.padEnd(10)} ${n}`)
  console.log('\nEng ko\'p rang bor fayllar:')
  for (const [f, c] of Object.entries(perFile).slice(0, 15)) console.log(`  ${String(c.hex + c.func).padStart(4)}  ${f}`)
}

const report = scan()
const args = new Set(process.argv.slice(2))

if (args.has('--write')) {
  writeFileSync(BASELINE, JSON.stringify(report, null, 2) + '\n')
  console.log(`Baza saqlandi: ${rel(BASELINE)} (${report.totals.hex} hex, ${report.totals.func} rgb/hsl)`)
} else if (args.has('--compare')) {
  if (!existsSync(BASELINE)) {
    console.log('Baza yo\'q. Avval: node scripts/check-colors.mjs --write')
  } else {
    const base = JSON.parse(readFileSync(BASELINE, 'utf8')).totals
    const diff = (k) => report.totals[k] - base[k]
    console.log(`hex: ${base.hex} → ${report.totals.hex} (${diff('hex') >= 0 ? '+' : ''}${diff('hex')})`)
    console.log(`rgb/hsl: ${base.func} → ${report.totals.func} (${diff('func') >= 0 ? '+' : ''}${diff('func')})`)
    if (diff('hex') > 0 || diff('func') > 0) console.log('Ogohlantirish: yangi hardcoded rang qo\'shilgan — token ishlating.')
  }
} else {
  print(report)
}
