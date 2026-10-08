/* global process */
// admin.css (Bosqich 6a): token qoidasi, qatlam, yig'ilgan holat va kontrast tuzatishi.
import { existsSync, readFileSync } from 'node:fs'
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
    // 6.21: taxta bo'yicha yig'ilgan kenglik 60 → 72 px
    expect(code).toMatch(/\.adm-shell\[data-collapsed="true"\] \.adm-sidebar \{ width: 72px; \}/)
    expect(code).toMatch(/\.adm-shell\[data-collapsed="true"\] \.adm-nav-link/)
    // 6.21: pastki qism paddingi (8 px) yig'ilganda ham o'zgarmaydi — alohida qoida kerak emas; amallar o'zi markazlanadi
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

describe('6.21: admin qobig\'i va kirish — taxta bo\'yicha', () => {
  const tokens = strip(read('src/styles/tokens.css'))
  const tok = n => [...tokens.matchAll(new RegExp(`${n}:\\s*([^;]+);`, 'g'))].map(m => m[1].trim())

  it("sidebar va kirish foni — tepadan pastga (180deg), radial dog' va nuqta yo'q", () => {
    expect(tok('--gradient-sidebar')).toHaveLength(1)
    for (const v of [...tok('--gradient-sidebar'), ...tok('--gradient-auth')]) {
      expect(v).toMatch(/^linear-gradient\(180deg,/)
      expect(v).not.toMatch(/radial-gradient/)
    }
    expect(tok('--gradient-auth')).toHaveLength(3)
    expect(code).not.toMatch(/radial-gradient/)
  })

  it('`--shadow-auth` Light + Dark (ikkala blok) da e\'lon qilingan, kartada ishlatiladi', () => {
    expect(tok('--shadow-auth')).toHaveLength(3)
    expect(code).toMatch(/\.auth-card \{[^}]*box-shadow: var\(--shadow-auth\)/)
  })

  it("sidebar o'lchamlari: 240 px (yig'ilgan 72), bo'lim 44 px (yig'ilgan 48), tepada oltin chiziq", () => {
    expect(code).toMatch(/\.adm-sidebar \{[^}]*width: 240px/)
    expect(code).toMatch(/\.adm-nav-link \{[^}]*height: 44px/)
    expect(code).toMatch(/\.adm-shell\[data-collapsed="true"\] \.adm-nav-link \{[^}]*height: 48px/)
    expect(code).toMatch(/\.adm-sidebar::before \{[^}]*var\(--color-accent\)/)
  })

  it("bo'lim holatlari: hover va faol (oltin chiziq) bor; fokus halqasi ichkariga (kesilmasin)", () => {
    expect(code).toMatch(/\.adm-nav-link:hover \{/)
    expect(code).toMatch(/\.adm-nav-link\.active::before \{[^}]*var\(--color-accent\)/)
    expect(code).toMatch(/\.adm-nav-link:focus-visible \{ outline-offset: -2px; \}/)
  })

  it("sidebar ekran balandligida qotadi (sticky, 100vh/100dvh), ro'yxat ichida aylanadi; yig'ilganda ham kesilmaydi", () => {
    expect(code).toMatch(/\.adm-sidebar \{[^}]*position: sticky;[^}]*top: 0;[^}]*height: 100vh;\s*height: 100dvh;/)
    expect(code).toMatch(/\.adm-nav \{[^}]*min-height: 0;[^}]*overflow-y: auto;/)
    expect(code).not.toMatch(/\.adm-nav \{ overflow: visible; \}/)
    expect(code).not.toMatch(/data-collapsed="true"\] \.adm-sidebar \{[^}]*overflow: visible/)
  })

  it("yig'ilgandagi tooltip: `position: fixed` qatlam (sidebar kesmaydi), joyi `--tip-y` dan", () => {
    expect(code).toMatch(/\.adm-tip \{[^}]*position: fixed;[^}]*top: var\(--tip-y, 0\);/)
    expect(code).not.toMatch(/\[data-tip\]/)
  })

  it('kirish kartasi: 440 px, radius 22, tepada oltin chiziq; maydon 48 px, tugma 52 px', () => {
    expect(code).toMatch(/\.auth-card \{[^}]*max-width: 440px/)
    expect(code).toMatch(/\.auth-card \{[^}]*border-radius: 22px/)
    expect(code).toMatch(/\.auth-card::before \{[^}]*var\(--color-accent\)/)
    expect(code).toMatch(/\.auth-input \{[^}]*height: 48px/)
    expect(code).toMatch(/\.auth-submit \{[^}]*min-height: 52px/)
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

  // 6.22 (taxta): chap `border-left: 3px` o'rniga 4 px `::before` chiziq; ikonka plitkasi 10 % `color-mix`
  // o'rniga to'liq `--kpi-c` fonida (ustida `--color-on-stat`). Qiymat hamon `--color-text` da.
  it("KPI: rang chiziq (`::before`), fon, chegara va ikonka plitkasida (`--kpi-c`), qiymat matni `--color-text` da", () => {
    expect(code).toMatch(/\.adm-kpi::before \{[^}]*width: 4px;[^}]*background: var\(--kpi-c\)/)
    expect(code).toMatch(/\.adm-kpi \{[^}]*border-color: color-mix\(in srgb, var\(--kpi-c\) 40%, var\(--color-border\)\)/)
    expect(code).toMatch(/\.adm-kpi \{[^}]*background: color-mix\(in srgb, var\(--kpi-c\) var\(--stat-tint\), var\(--color-surface-3\)\)/)
    expect(code).toMatch(/\.adm-kpi-value \{[^}]*color: var\(--color-text\)/)
    expect(code).toMatch(/\.adm-kpi-icon \{[^}]*background: var\(--kpi-c\);[^}]*color: var\(--color-on-stat\)/)
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

describe('Bosqich 6c: CRUD sahifalar (shared/styles.js klasslarga o\'tdi)', () => {
  const PAGES = ['NewsAdmin', 'EventsAdmin', 'GalleryAdmin', 'TeachersAdmin', 'ProfileAdmin']
  const src = n => read(`src/pages/admin/${n}.jsx`)

  it("`shared/styles.js` o'chirilgan va hech kim import qilmaydi", () => {
    expect(existsSync(resolve(process.cwd(), 'src/pages/admin/shared/styles.js'))).toBe(false)
    for (const n of PAGES) expect(src(n)).not.toMatch(/shared\/styles/)
  })

  it("5 sahifada inline stil yo'q; faqat TeachersAdmin avatar foni (indeksdan — spec 7.5 dinamik)", () => {
    for (const n of PAGES.filter(x => x !== 'TeachersAdmin')) expect(src(n), n).not.toMatch(/style=\{/)
    expect(src('TeachersAdmin').match(/style=\{/g)).toHaveLength(1)
    expect(src('TeachersAdmin')).toMatch(/className="adm-avatar" style=\{\{ background: colors\[i % colors\.length\] \}\}/)
  })

  it("JS orqali stil yozilmaydi: `onError` → `markBroken` (`data-broken`), `style.opacity/display` yo'q", () => {
    for (const n of PAGES) {
      expect(src(n), n).not.toMatch(/\.style\.(opacity|display)/)
      expect(src(n), n).not.toMatch(/onMouse(Enter|Leave)|onFocus|onBlur/)
    }
    expect(code).toMatch(/img\[data-broken="true"\] \{ opacity: \.3; \}/)
    expect(code).toMatch(/\.adm-avatar img\[data-broken="true"\] \{ display: none; \}/)
  })

  it("forma elementlari tokenlarda: `.adm-input` chegarasi `--color-border-strong`, `.adm-label` 11px token, tugma variantlari", () => {
    expect(code).toMatch(/\.adm-input \{[^}]*border: 1px solid var\(--color-border-strong\)/)
    expect(code).toMatch(/\.adm-input \{[^}]*font-size: var\(--text-sm\)/)
    expect(code).toMatch(/\.adm-label \{[^}]*font-size: var\(--text-2xs\)/)
    expect(code).toMatch(/\.adm-btn--edit \{[^}]*color: var\(--color-brand\)/)
    expect(code).toMatch(/\.adm-btn--primary:disabled \{ opacity: \.6; \}/)
  })

  it("`.adm-msg` rangi `data-type` → `--msg-c` (success/danger tokenlari); Shorts belgisi `--brand-youtube`", () => {
    expect(code).toMatch(/\.adm-msg\[data-type="success"\] \{ --msg-c: var\(--color-success\); \}/)
    expect(code).toMatch(/\.adm-msg\[data-type="error"\]\s+\{ --msg-c: var\(--color-danger\); \}/)
    expect(code).toMatch(/\.adm-pill--youtube \{[^}]*var\(--brand-youtube\)/)
  })

  it("spinner `--color-brand-subtle-2` + `spin` animatsiyasi (eski `#ede9fe` yo'q); fayl kiritish `hidden`", () => {
    expect(code).toMatch(/\.adm-spinner \{[^}]*border: 2px solid var\(--color-brand-subtle-2\)/)
    expect(code).toMatch(/animation: spin 0\.7s linear infinite/)
    for (const n of ['NewsAdmin', 'EventsAdmin', 'GalleryAdmin', 'TeachersAdmin']) {
      expect(src(n), n).not.toMatch(/ede9fe/i)
      expect(src(n), n).toMatch(/type="file"[^>]* hidden \/>/)
    }
  })
})

describe('Bosqich 6.18: admin logotipi', () => {
  const css = read('src/styles/admin.css')

  it("sidebar logotipi to'q gradient ustida `--color-brand-on-dark`, topbar'da `--color-brand` (hex yo'q)", () => {
    expect(css).toMatch(/\.adm-logo--side\s*\{\s*color:\s*var\(--color-brand-on-dark\)/)
    expect(css).toMatch(/\.adm-logo--top\s*\{\s*color:\s*var\(--color-brand\)/)
  })

  it("yig'ilgan sarlavha logotip va tugmani ustma-ust joylaydi", () => {
    expect(css).toMatch(/\[data-collapsed="true"\] \.adm-sidebar-head\s*\{[^}]*flex-direction:\s*column/)
  })

  it("Dashboard va Login umumiy `Logo` komponentini ishlatadi (qo'lda SVG emas)", () => {
    for (const f of ['Dashboard.jsx', 'Login.jsx'])
      expect(read(`src/pages/admin/${f}`)).toMatch(/import Logo from '\.\.\/\.\.\/components\/Logo'/)
  })
})


describe('Bosqich 6.22: Statistika (taxta bo\'yicha)', () => {
  const css = strip(read('src/styles/admin.css'))
  const tokens = read('src/styles/tokens.css')

  it("karta: radius 16, padding 24, `--shadow-card-board` (taxta soyasi) va `--color-surface-3` foni", () => {
    expect(css).toMatch(/\.adm-card \{[^}]*padding: 24px;[^}]*border-radius: 16px;[^}]*background: var\(--color-surface-3\);[^}]*box-shadow: var\(--shadow-card-board\)/)
  })

  it("sarlavhalar: h2 28/800, h3 18/700; karta sarlavhasi 15/700 va 32 px ikonka plitkasi (rangli — `data-tone`)", () => {
    expect(css).toMatch(/\.adm-page-title \{[^}]*font-size: 1\.75rem;[^}]*font-weight: 800/)
    expect(css).toMatch(/\.adm-subtitle \{[^}]*font-size: 1\.125rem;[^}]*font-weight: 700/)
    expect(css).toMatch(/\.adm-card-title \{[^}]*font-size: 0\.9375rem;[^}]*font-weight: 700/)
    expect(css).toMatch(/\.adm-card-title-icon \{[^}]*width: 32px;[^}]*height: 32px;[^}]*border-radius: 10px/)
    expect(css).toMatch(/\.adm-card-title\[data-tone\] \.adm-card-title-icon \{[^}]*color-mix\(in srgb, var\(--kpi-c\) 18%/)
  })

  it("KPI: 16 px radius, padding 16/16/16/20, 40 px ikonka (12 radius), qiymat 30/800; fokus offset 3 px", () => {
    expect(css).toMatch(/\.adm-kpi \{[^}]*padding: 16px 16px 16px 20px/)
    expect(css).toMatch(/\.adm-kpi-icon \{[^}]*width: 40px;[^}]*height: 40px;[^}]*border-radius: 12px/)
    expect(css).toMatch(/\.adm-kpi-value \{[^}]*font-size: 1\.875rem;[^}]*font-weight: 800/)
    expect(css).toMatch(/\.adm-kpi-link:focus-visible \{ outline-offset: 3px; \}/)
    expect(css).toMatch(/\.adm-kpi:hover \{ box-shadow: var\(--shadow-pop\); \}/)
  })

  it("holatlar: `.adm-load-state` (28 px padding), banner (radius 12, max 640), bo'sh holat plitkasi 44 px; spinner `reduce` da to'xtaydi", () => {
    expect(css).toMatch(/\.adm-load-state \{[^}]*padding: 28px 0/)
    expect(css).toMatch(/\.adm-banner \{[^}]*max-width: 640px;[^}]*border-radius: 12px;[^}]*background: var\(--color-danger-bg\)/)
    expect(css).toMatch(/\.adm-empty-state-icon \{[^}]*width: 44px;[^}]*height: 44px/)
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.adm-load-state-spinner \{ animation: none; \}/)
  })

  it("`.adm-load-state-spinner` mavjud `.adm-spinner` (rasm yuklash) bilan to'qnashmaydi", () => {
    expect(css).toMatch(/\.adm-load-state-spinner \{/)
    expect((css.match(/\.adm-spinner \{/g) ?? [])).toHaveLength(1)
  })

  it("grafik: trend tooltip 10 px radius, `--color-border-2` chegara, `--shadow-pop`; yo'naltiruvchi chiziq; svg fokus halqasi", () => {
    expect(css).toMatch(/\.adm-tooltip \{[^}]*padding: 10px 12px;[^}]*border: 1px solid var\(--color-border-2\);[^}]*border-radius: 10px;[^}]*box-shadow: var\(--shadow-pop\)/)
    expect(css).toMatch(/\.adm-chart-guide \{ stroke: var\(--color-border-2\); \}/)
    expect(css).toMatch(/\.adm-chart-svg--visible:focus-visible \{[^}]*outline: 2px solid var\(--color-focus\)/)
  })

  it("Kun/Hafta: faol tugmada yorqin soya yo'q (faqat ichki yoritma); faol emasi `--color-border-2` chegarali", () => {
    expect(css).toMatch(/\.adm-seg \.btn-primary,\s*\.adm-seg \.btn-primary:hover:not\(:disabled\) \{ box-shadow: inset 0 1px 0 rgb\(255 255 255 \/ 0\.16\); \}/)
    expect(css).toMatch(/\.adm-seg \.btn:not\(\.btn-primary\) \{[^}]*border-color: var\(--color-border-2\)/)
  })

  it("yangi tokenlar (`--color-border-2`, `--color-on-stat`, `--stat-tint`, `--shadow-pop`) Light + ikkala Dark blokida", () => {
    for (const t of ['--color-border-2', '--color-on-stat', '--stat-tint', '--shadow-pop'])
      expect(tokens.match(new RegExp(`${t}:`, 'g')), t).toHaveLength(3)
  })

  it("Stats va grafiklar hex/rgb'siz, grafiklarda `<style>` yo'q; trend grafigida 2 ta inline xolos (nuqta rangi, balandlik)", () => {
    for (const f of ['Stats.jsx', 'shared/StateViews.jsx', 'shared/useApiGet.js', 'charts/RankedBarChart.jsx', 'charts/TrendLineChart.jsx']) {
      const src = strip(read(`src/pages/admin/${f}`))
      expect(src, f).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(src, f).not.toMatch(/rgba?\(/)
    }
    expect(read('src/pages/admin/Stats.jsx')).not.toMatch(/style=\{/)
  })
})
