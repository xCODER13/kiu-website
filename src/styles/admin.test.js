/* global process */
// admin.css (Bosqich 6a): token qoidasi, qatlam, yig'ilgan holat va kontrast tuzatishi.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = f => readFileSync(resolve(process.cwd(), f), 'utf8')
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '')
const code = strip(read('src/styles/admin.css'))

describe('admin.css', () => {
  it("hex rang yo'q; rgb faqat oq/qora + alfa (to'q sidebar ustidagi chiziq va fon)", () => {
    expect(code).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    const rgbs = code.match(/rgba?\([^)]*\)/g) ?? []
    expect(rgbs.every(c => /^rgb\((255 255 255|0 0 0) \//.test(c))).toBe(true)
  })

  it('hammasi `@layer components` ichida', () => {
    expect(code.trim()).toMatch(/^@layer components \{/)
    expect(code.trim()).toMatch(/\}$/)
  })

  it("outline yo'qotilmagan", () => {
    expect(code).not.toMatch(/outline:\s*(none|0)\b/)
  })

  it("yig'ilgan holat ildizdagi `data-collapsed` orqali (sidebar kengligi, bo'limlar, pastki qism)", () => {
    expect(code).toMatch(/\.adm-shell\[data-collapsed="true"\] \.adm-sidebar \{ width: 60px; \}/)
    expect(code).toMatch(/\.adm-shell\[data-collapsed="true"\] \.adm-nav-link/)
    expect(code).toMatch(/\.adm-shell\[data-collapsed="true"\] \.adm-sidebar-foot/)
    expect(code).toMatch(/\.adm-shell\[data-collapsed="true"\] \.adm-side-action/)
  })

  it("sidebar ichida fokus halqasi to'q yuzaga mos (`--color-brand-on-dark`)", () => {
    expect(code).toMatch(/\.adm-sidebar :focus-visible \{ outline-color: var\(--color-brand-on-dark\); \}/)
  })

  it("faol bo'lim: NavLink `active` klassi bo'yicha", () => {
    expect(code).toMatch(/\.adm-nav-link\.active \{/)
  })

  it("to'q sidebar ustidagi kamdan-kam ko'rinadigan matnlar token orqali (kontrast ≥ 4.5; oldin .3–.45 alfa)", () => {
    for (const sel of ['adm-brand-sub', 'adm-side-search-icon', 'adm-nav-empty', 'adm-side-action']) {
      const block = code.match(new RegExp(`\\.${sel} \\{[^}]*\\}`))?.[0] ?? ''
      expect(block, sel).toMatch(/color: var\(--color-on-dark-muted\)/)
    }
    expect(code).toMatch(/\.adm-side-action\.is-danger \{ color: var\(--color-danger-on-dark\); \}/)
  })

  it("main.jsx da components.css, site.css va pages.css dan KEYIN, global.css dan OLDIN", () => {
    const main = read('src/main.jsx')
    const order = ['components.css', 'site.css', 'pages.css', 'admin.css', 'global.css'].map(f => main.indexOf(f))
    expect(order.every(i => i > -1)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })
})

describe('admin qobig\'i va Login: inline stil yo\'q', () => {
  it.each(['Dashboard.jsx', 'Login.jsx'])('%s', f => {
    expect(read(`src/pages/admin/${f}`)).not.toMatch(/style=\{\{/)
  })

  it("Login: parol maydoni `.input` ustiga qurilgan (yagona input uslubi)", () => {
    const src = read('src/pages/admin/Login.jsx')
    expect(src.match(/className="input auth-input/g)).toHaveLength(2)
  })
})

describe('tokens.css: --color-danger-on-dark', () => {
  it("to'q yuzalar guruhida, tema bilan almashmaydi", () => {
    const tokens = strip(read('src/styles/tokens.css'))
    expect(tokens.match(/--color-danger-on-dark:/g)).toHaveLength(1)
  })
})

describe('Bosqich 6b: statistika va grafiklar', () => {
  const tokens = strip(read('src/styles/tokens.css'))
  const STAT = ['blue', 'orange', 'emerald', 'indigo', 'amber', 'cyan', 'lime', 'violet']

  it("`--stat-*` (8) va `--chart-1…6` Light'da va Dark'ning ikkala blokida e'lon qilingan", () => {
    for (const n of [...STAT.map(x => `--stat-${x}`), ...[1, 2, 3, 4, 5, 6].map(i => `--chart-${i}`)]) {
      expect(tokens.match(new RegExp(`${n}:`, 'g')), n).toHaveLength(3)
    }
  })

  it('`data-tone` har bir `--stat-*` ni `--kpi-c` ga bog\'laydi', () => {
    for (const t of STAT) expect(code).toMatch(new RegExp(`\\[data-tone="${t}"\\]\\s*\\{ --kpi-c: var\\(--stat-${t}\\); \\}`))
  })

  it("KPI: rang chiziq va ikonkada (`--kpi-c`), qiymat matni `--color-text` da; ikonka foni `color-mix`", () => {
    expect(code).toMatch(/\.adm-kpi \{[^}]*border-left: 3px solid var\(--kpi-c\)/)
    expect(code).toMatch(/\.adm-kpi-value \{[^}]*color: var\(--color-text\)/)
    expect(code).toMatch(/\.adm-kpi-icon \{[^}]*background: color-mix\(in srgb, var\(--kpi-c\) 10%, transparent\)/)
  })

  it('KPI hover CSS da (oldin JS onMouseEnter/Leave)', () => {
    expect(code).toMatch(/\.adm-kpi:hover \{ transform: translateY\(-2px\); \}/)
    expect(read('src/pages/admin/Stats.jsx')).not.toMatch(/onMouse(Enter|Leave)/)
  })

  it("`.adm-status-select` rangi `data-status` → status tokeni; badge klasslari STATUS_BADGE da", () => {
    expect(code).toMatch(/\[data-status="new"\]\s*\{ --st: var\(--color-info\); \}/)
    expect(code).toMatch(/\[data-status="rejected"\]\s*\{ --st: var\(--color-danger\); \}/)
    const consts = read('src/pages/admin/shared/constants.js')
    expect(consts).toMatch(/STATUS_BADGE = \{ new: 'badge-info', reviewed: 'badge-warning', accepted: 'badge-success', rejected: 'badge-danger' \}/)
    expect(consts).not.toMatch(/STATUS_COLORS|#[0-9a-f]{6}/i)
  })

  it("Stats, ApplicationsAdmin va grafiklarda hex rang va `style` rang/joylashuvi yo'q", () => {
    for (const f of ['Stats.jsx', 'ApplicationsAdmin.jsx', 'charts/RankedBarChart.jsx', 'charts/TrendLineChart.jsx']) {
      const src = strip(read(`src/pages/admin/${f}`))
      expect(src, f).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(src, f).not.toMatch(/rgba?\(/)
    }
    // inline qolganlar — faqat geometriya (`height`, `width`, `top`, `left`, `lineHeight`) va seriya rangi (tooltip nuqtasi)
    const inline = f => (read(`src/pages/admin/${f}`).match(/style=\{\{[^}]*\}\}/g) ?? [])
    expect(inline('Stats.jsx')).toHaveLength(0)
    expect(inline('ApplicationsAdmin.jsx')).toHaveLength(0)
    expect(inline('charts/TrendLineChart.jsx')).toEqual(['style={{ background: s.color }}', 'style={{ height }}'])
  })

  it("tooltip visx standart stillarisiz (`unstyled`) va `.adm-tooltip` klassida", () => {
    expect(read('src/pages/admin/charts/TrendLineChart.jsx')).toMatch(/<TooltipWithBounds[^>]*unstyled[^>]*className="adm-tooltip"/)
    expect(code).toMatch(/\.adm-tooltip \{[^}]*position: absolute;[^}]*pointer-events: none;/)
  })
})
