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

  // 6.27 (O'qituvchilar): avval bu yerda TeachersAdmin dagi YAGONA inline stil (`colors[i % colors.length]` — 6 ta hardcoded hex)
  // kutilardi. Endi avatar rangi bitta brend gradienti (CSS) — 5 sahifaning hech birida inline stil yo'q.
  it("5 sahifada inline stil yo'q (O'qituvchilar avatari ham — 6.27 dan beri CSS gradient)", () => {
    for (const n of PAGES) expect(src(n), n).not.toMatch(/style=\{/)
    expect(read('src/pages/admin/shared/Avatar.jsx')).not.toMatch(/style=\{/)
    expect(src('TeachersAdmin')).not.toMatch(/colors\[|#[0-9a-f]{6}\b/i)
  })

  it("JS orqali stil yozilmaydi: `onError` → `markBroken` (`data-broken`), `style.opacity/display` yo'q", () => {
    for (const n of PAGES) {
      expect(src(n), n).not.toMatch(/\.style\.(opacity|display)/)
      // 6.28: `onBlur` Profilda «Parolni takrorlang» mos kelmasligini maydondan chiqilganda tekshirish uchun (stil emas) — shu sababli
      // ProfileAdmin uchun `onBlur` istisno; hover/fokus holatini JS bilan yozish (`onMouse*`, `onFocus`) baribir taqiqlangan.
      expect(src(n), n).not.toMatch(n === 'ProfileAdmin' ? /onMouse(Enter|Leave)|onFocus/ : /onMouse(Enter|Leave)|onFocus|onBlur/)
    }
    expect(code).toMatch(/img\[data-broken="true"\] \{ opacity: \.3; \}/)
    // 6.27: `.adm-avatar img[data-broken] { display: none }` o'rniga `Avatar.jsx` yuklanmagan fotoda bosh harflarga qaytadi (holat orqali)
    expect(read('src/pages/admin/shared/Avatar.jsx')).toMatch(/onError=\{\(\) => setFailedSrc\(image\)\}/)
  })

  // 6.28: Profil `.adm-formcard`/`.adm-ctl`/`btn-primary` ga o'tdi → eski `.adm-input`, `.adm-label`, `.adm-btn*`, `.adm-msg*`, `.adm-info*`,
  // `.adm-form-body` va (avvaldan o'lik) `.adm-pill*`, `.adm-row*`, `.adm-section-title`, `.adm-list--spaced` o'chirildi. Eski ikki qo'riqchi shu klasslarni
  // tekshirgani uchun o'zgartirildi: endi ularning YO'QLIGINI va yangi `.adm-ctl` tokenlarini tekshiradi.
  it("forma elementlari tokenlarda: `.adm-ctl` chegarasi `--color-border-2`; eski `.adm-input`/`.adm-label`/`.adm-btn*` yo'q", () => {
    expect(code).toMatch(/\.adm-ctl \{[^}]*border: 1px solid var\(--color-border-2\)/)
    expect(code).not.toMatch(/\.adm-(input|label)\s*\{|\.adm-btn(--primary)?\s*[{:,]/)
    expect(code).not.toMatch(/\.adm-(info|msg|pill|row|form-body)\b|\.adm-(section-title|list--spaced)\b/)
  })

  // 6.27: `.adm-spinner` va `spin` animatsiyali eski «Saqlanmoqda» spinneri o'chirildi (O'qituvchilar ham `Ic.spinner` + `btn-spin` ga o'tdi)
  it("eski `.adm-spinner` yo'q (eski `#ede9fe` ham yo'q); fayl kiritish `.adm-sr-only` (`hidden` emas)", () => {
    expect(code).not.toMatch(/\.adm-spinner\b/)
    for (const n of ['NewsAdmin', 'EventsAdmin', 'GalleryAdmin', 'TeachersAdmin']) {
      expect(src(n), n).not.toMatch(/ede9fe/i)
    }
    // 6.24: Yangiliklar fayl kiritishi `shared/ImageField.jsx` ga o'tdi va `hidden` o'rniga `.adm-sr-only` — `hidden` (display: none)
    // inputni klaviaturadan ham, ekran o'quvchidan ham olib tashlardi; endi Tab bilan fokuslanadi (fokus halqasi yuklash maydonida).
    // 6.25: Tadbirlar ham xuddi shunday — fayl kiritishi `shared/PosterField.jsx` da (`.adm-sr-only`).
    // 6.26: Galereya ham (`shared/ImageField.jsx`). 6.27: O'qituvchilar ham (`shared/AvatarField.jsx`) — endi hamma sahifada `.adm-sr-only`.
    expect(src('TeachersAdmin')).not.toMatch(/type="file"/)
    for (const f of ['ImageField', 'PosterField', 'AvatarField']) {
      const field = read(`src/pages/admin/shared/${f}.jsx`)
      expect(field, f).toMatch(/className="adm-sr-only"\s+type="file"/)
      expect(field, f).not.toMatch(/type="file"[^>]*\shidden[\s/>]/)
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
    // 6.27: eski `.adm-spinner` butunlay o'chirildi (oldin aynan 1 ta bo'lishi tekshirilardi) — to'qnashadigan narsa qolmadi
    expect((css.match(/\.adm-spinner \{/g) ?? [])).toHaveLength(0)
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

describe("Bosqich 6.23: Arizalar (taxta bo'yicha)", () => {
  const css = code
  const rule = sel => (css.match(new RegExp(`${sel.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`)) ?? [])[1] ?? ''
  const tokens = read('src/styles/tokens.css')

  it("filtr chip'i — 36 px kapsula; faol — to'ldirilgan brend foni, hisoblagich `rgb(255 255 255 / .22)`", () => {
    expect(rule('.adm-chip')).toMatch(/height: 36px;/)
    expect(rule('.adm-chip')).toMatch(/border-radius: var\(--radius-pill\);/)
    expect(rule('.adm-chip[data-active="true"]')).toMatch(/background: var\(--color-brand-fill\);[\s\S]*color: var\(--color-on-brand\)/)
    expect(css).toMatch(/\.adm-chip\[data-active="true"\] \.adm-chip-count \{[^}]*rgb\(255 255 255 \/ 0\.22\)/)
    expect(rule('.adm-chip-dot')).toMatch(/background: var\(--st\);/)
  })

  it("holat tanlagichi neytral (holat rangini takrorlamaydi): `--st` ishlatilmaydi, chegara `--color-border-2`", () => {
    expect(rule('.adm-status-select')).not.toMatch(/var\(--st\)/)
    expect(rule('.adm-status-select')).toMatch(/border: 1px solid var\(--color-border-2\);/)
    expect(css).toMatch(/\.adm-status-select:focus-visible \{[^}]*border-color: var\(--color-brand\);/)
    expect(css).toMatch(/\.adm-status-select:disabled \{[^}]*cursor: not-allowed;/)
  })

  it("ariza kartasi: padding 20, avatar 44 px doira, sana 13 px (avval 10 px)", () => {
    expect(rule('.adm-app-card')).toMatch(/padding: 20px;/)
    expect(rule('.adm-app-avatar')).toMatch(/width: 44px;[\s\S]*height: 44px;[\s\S]*border-radius: 50%;/)
    expect(rule('.adm-app-date')).toMatch(/font-size: 0\.8125rem;/)
  })

  it("vakansiya teglari: neytral, lavozim — brend (avval 4 xil `color-mix` rang)", () => {
    expect(css).not.toMatch(/\.adm-tag--(strong|success|warning)/)
    expect(rule('.adm-tag--brand')).toMatch(/background: var\(--color-brand-subtle\);/)
  })

  it("tasdiq dialogi: overlay `--color-modal-overlay`, `--z-modal`, radius 20, oltin hairline, `--shadow-confirm`", () => {
    expect(rule('.adm-dialog-overlay')).toMatch(/position: fixed;/)
    expect(rule('.adm-dialog-overlay')).toMatch(/z-index: var\(--z-modal\);/)
    expect(rule('.adm-dialog-overlay')).toMatch(/background: var\(--color-modal-overlay\);/)
    expect(rule('.adm-dialog')).toMatch(/width: 440px;[\s\S]*border-radius: 20px;[\s\S]*box-shadow: var\(--shadow-confirm\);/)
    expect(rule('.adm-dialog::before')).toMatch(/background: var\(--gradient-hairline\);/)
    expect(rule('.adm-dialog-confirm')).toMatch(/background: var\(--color-danger\);[\s\S]*color: var\(--color-on-danger\);/)
  })

  it("`--shadow-confirm` va `--color-on-danger` Light, tizim Dark'i va `data-theme=dark` da bor", () => {
    expect(tokens.match(/--shadow-confirm:/g)).toHaveLength(3)
    expect(tokens.match(/--color-on-danger:/g)).toHaveLength(3)
  })

  it("`window.confirm`/`alert` ishlatilmaydi; eski `.adm-state` klasslari olib tashlangan", () => {
    const src = strip(read('src/pages/admin/ApplicationsAdmin.jsx')).replace(/\/\/.*$/gm, '')   // izohlar emas, kod
    expect(src).not.toMatch(/window\.confirm|\balert\(/)
    expect(src).not.toMatch(/adm-state/)
    expect(css).not.toMatch(/\.adm-state(--dashed)? \{/)
  })

  it("skelet animatsiyasiz (taxtada statik); aylanuvchi ikonkalar `prefers-reduced-motion` da to'xtaydi", () => {
    expect(rule('.adm-skel')).not.toMatch(/animation/)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.adm-select-icon--spin svg \{ animation: none; \}/)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.adm-dialog-confirm\[aria-busy="true"\] svg \{ animation: none; \}/)
  })

  it("tasdiq tugmasi band bo'lganda bitta spinner: umumiy `.btn[aria-busy]::after` o'chiriladi (ikki marta aylanardi)", () => {
    expect(css).toMatch(/\.btn\.adm-dialog-confirm\[aria-busy="true"\]::after \{ content: none; \}/)
  })

  it("`.adm-sr-only` ko'rinmas, lekin ekran o'quvchiga ochiq (`display: none` emas)", () => {
    expect(rule('.adm-sr-only')).toMatch(/clip-path: inset\(50%\);/)
    expect(rule('.adm-sr-only')).not.toMatch(/display: none/)
  })
})

describe('Bosqich 6.24: Yangiliklar', () => {
  const css = code
  const rule = sel => (css.match(new RegExp(`${sel.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`)) ?? [])[1] ?? ''
  const tokens = read('src/styles/tokens.css')
  const srcOf = f => strip(read(f)).replace(/\/\/.*$/gm, '')

  it("Yangiliklar kodida `alert()`, `window.confirm` va inline `style=` yo'q", () => {
    for (const f of ['src/pages/admin/NewsAdmin.jsx', 'src/pages/admin/NewsForm.jsx', 'src/pages/admin/shared/FormField.jsx', 'src/pages/admin/shared/ImageField.jsx']) {
      const src = srcOf(f)
      expect(src, f).not.toMatch(/window\.confirm|\balert\(|\bconfirm\(/)
      expect(src, f).not.toMatch(/\bstyle=/)
    }
  })

  it("`--color-scrim-thumb` tokeni bor va miniatyura qatlami shuni ishlatadi", () => {
    expect(tokens).toMatch(/--color-scrim-thumb:/)
    expect(css).toMatch(/var\(--color-scrim-thumb\)/)
  })

  it("forma maydonlarining fokus halqasi o'chirilmagan (`outline: none` yo'q)", () => {
    expect(rule('.adm-ctl:focus-visible')).not.toMatch(/outline:\s*none/)
  })

  it("saqlash tugmasi band bo'lganda bitta spinner (`.btn[aria-busy]::after`), SVG ikonka qo'shilmaydi", () => {
    expect(css).toMatch(/\.btn\.btn-primary\.adm-save\[aria-busy="true"\]/)
    expect(srcOf('src/pages/admin/NewsForm.jsx')).toMatch(/\{!saving && Ic\.save\}/)
  })
})

describe('Bosqich 6.25: Tadbirlar', () => {
  const css = code
  const rule = sel => (css.match(new RegExp(`${sel.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`)) ?? [])[1] ?? ''
  const srcOf = f => strip(read(f)).replace(/\/\/.*$/gm, '')

  it("Tadbirlar kodida `alert()`, `window.confirm`, `.catch(() => {})` va inline `style=` yo'q", () => {
    for (const f of ['src/pages/admin/EventsAdmin.jsx', 'src/pages/admin/EventsForm.jsx', 'src/pages/admin/shared/PosterField.jsx']) {
      const src = srcOf(f)
      expect(src, f).not.toMatch(/window\.confirm|\balert\(|\bconfirm\(/)
      expect(src, f).not.toMatch(/\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/)
      expect(src, f).not.toMatch(/\bstyle=/)
    }
  })

  it("rang faqat tokenlar orqali: eski hardcoded gradient/`#dc2626` yo'q; Events klasslari `--color-*`/`--radius-*` ishlatadi", () => {
    for (const sel of ['.adm-date-tile', '.adm-badge-past', '.adm-poster-img']) {
      expect(rule(sel), sel).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    }
    expect(rule('.adm-date-tile')).toMatch(/background: var\(--color-brand-subtle\);[\s\S]*color: var\(--color-brand\);/)
    expect(css).toMatch(/\.adm-date-tile\[data-past="true"\] \{[^}]*var\(--color-surface-2\)[^}]*var\(--color-text-muted\)/)
  })

  it("sana plitkasi 60×68, poster ro'yxatda 96×68 va formada 192×108; o'lchamlar taxtadagi bilan bir xil", () => {
    expect(rule('.adm-date-tile')).toMatch(/width: 60px;\s*height: 68px;/)
    expect(rule('.adm-item-poster')).toMatch(/width: 96px;\s*height: 68px;/)
    expect(rule('.adm-poster-img')).toMatch(/width: 192px;\s*height: 108px;/)
    expect(css).toMatch(/\.adm-poster-img\[data-new="true"\] \{ border: 2px solid var\(--color-brand\); \}/)
  })

  it("poster tugmalari fokus halqasi bilan (`:has(:focus-visible)`), `outline: none` yo'q", () => {
    expect(css).toMatch(/\.adm-poster-btn:has\(:focus-visible\) \{[^}]*outline: 2px solid var\(--color-brand\)/)
    expect(css).not.toMatch(/outline:\s*(none|0)\b/)
  })

  // 6.27: `.adm-thumb-x` va `.adm-upload` (O'qituvchilar eski formasi) o'chirildi — «umumiylari qoladi» sharti bajarilib bo'ldi
  it("Tadbirlarga xos eski klasslar olib tashlangan (`.adm-event-*`, `.adm-row-thumb`); O'qituvchilarning eski yuklash klasslari ham yo'q (6.27)", () => {
    expect(css).not.toMatch(/\.adm-event-(date|day|month)|\.adm-row-thumb\b|\.adm-preview-img--poster/)
    expect(css).not.toMatch(/\.adm-thumb-x\b|\.adm-upload\b|\.adm-preview\b/)
  })
})

describe('Bosqich 6.26: Galereya', () => {
  const css = code
  const rule = sel => (css.match(new RegExp(`${sel.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`)) ?? [])[1] ?? ''
  const srcOf = f => strip(read(f)).replace(/\/\/.*$/gm, '')

  it("Galereya kodida `alert()`, `window.confirm`, `.catch(() => {})` va inline `style=` yo'q", () => {
    for (const f of ['src/pages/admin/GalleryAdmin.jsx', 'src/pages/admin/GalleryForm.jsx', 'src/pages/admin/shared/ImageField.jsx']) {
      const src = srcOf(f)
      expect(src, f).not.toMatch(/window\.confirm|\balert\(|\bconfirm\(/)
      expect(src, f).not.toMatch(/\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/)
      expect(src, f).not.toMatch(/\bstyle=/)
    }
  })

  it("mozaika balandligi 200 px, oraliq 2 px; 3 rasmda katta (2fr) + ikkita kichik (1fr); belgi `--color-scrim-thumb`", () => {
    expect(rule('.adm-album-mosaic')).toMatch(/height: 200px;/)
    expect(rule('.adm-album-mosaic')).toMatch(/gap: 2px;/)
    expect(css).toMatch(/\.adm-album-mosaic\[data-count="2"\] \{ grid-template-columns: 1fr 1fr; \}/)
    expect(css).toMatch(/\.adm-album-mosaic\[data-count="3"\] \{ grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; \}/)
    expect(css).toMatch(/\.adm-album-tile:first-child \{ grid-row: 1 \/ span 2; \}/)
    expect(rule('.adm-album-badge')).toMatch(/height: 26px;/)
    expect(rule('.adm-album-badge')).toMatch(/background: var\(--color-scrim-thumb\);/)
  })

  it("karta radius 16; tavsif 2 qatorga qisqaradi va `min-height: 42px` (kartalar balandligi tekis)", () => {
    expect(rule('.adm-album')).toMatch(/border-radius: 16px;/)
    expect(rule('.adm-album-desc')).toMatch(/-webkit-line-clamp: 2;/)
    expect(rule('.adm-album-desc')).toMatch(/min-height: 42px;/)
  })

  it("Galereya klasslarida hardcoded rang yo'q (faqat tokenlar)", () => {
    for (const sel of ['.adm-album', '.adm-album-mosaic', '.adm-album-tile', '.adm-album-fallback', '.adm-album-badge', '.adm-album-title', '.adm-album-desc', '.adm-ithumb-num']) {
      expect(rule(sel), sel).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    }
  })

  it("tartib raqami plitkada; to'lgan yuklash maydoni o'chirilgan ko'rinishda; xato — danger chegara", () => {
    expect(rule('.adm-ithumb-num')).toMatch(/top: 6px;\s*left: 6px;/)
    expect(css).toMatch(/\.adm-dz\[data-full="true"\],\s*\.adm-dz\[data-full="true"\]:hover \{[^}]*var\(--color-surface-2\)/)
    expect(css).toMatch(/\.adm-dz\[data-invalid="true"\] \{ border-color: var\(--color-danger\); \}/)
  })

  // 6.27: «O'qituvchilar ishlatadiganlari qoladi» sharti bajarilib bo'ldi — `.adm-thumb-x`, `.adm-upload`, `.adm-grid--teachers` o'chirildi
  it("Galereyaga xos eski klasslar olib tashlangan (`.adm-album-cover/-count`, `.adm-thumbs`, `.adm-note`); O'qituvchilarniki ham (6.27)", () => {
    expect(css).not.toMatch(/\.adm-album-cover|\.adm-album-count|\.adm-grid--albums|\.adm-thumbs\b|\.adm-thumb-img|\.adm-thumb-new|\.adm-note\b/)
    expect(css).not.toMatch(/\.adm-thumb-x\b|\.adm-upload\b|\.adm-grid--teachers/)
  })
})

describe("Bosqich 6.27: O'qituvchilar", () => {
  const css = code
  const rule = sel => (css.match(new RegExp(`${sel.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`)) ?? [])[1] ?? ''

  it("eski klasslar olib tashlangan: `.adm-teacher-head`, `.adm-grid`, `.adm-crud-head`, `.adm-blank`, `.adm-form-grid`, `.adm-hint`, `.adm-saving`", () => {
    expect(css).not.toMatch(/\.adm-teacher-head|\.adm-grid\b|\.adm-crud-head|\.adm-blank\b|\.adm-form-grid|\.adm-hint\b|\.adm-saving\b|\.adm-actions\b|\.adm-form-actions|\.adm-preview-img/)
  })

  it("avatar: bitta brend gradienti (6 ta hardcoded hex o'rniga), 56 / 96 px, foto `object-fit: cover`", () => {
    expect(rule('.adm-avatar')).toMatch(/linear-gradient\(135deg, var\(--color-brand-fill\), var\(--color-brand-hover\)\)/)
    expect(rule('.adm-avatar')).toMatch(/color: var\(--color-on-brand\);/)
    expect(rule('.adm-avatar[data-size="md"]')).toMatch(/width: 56px;\s*height: 56px;/)
    expect(rule('.adm-avatar[data-size="lg"]')).toMatch(/width: 96px;\s*height: 96px;/)
    expect(rule('.adm-avatar img')).toMatch(/object-fit: cover;/)
  })

  it("karta radius 16, ichki 20; lavozim pill'i brend-subtle; kafedra 2 qatorga qisqaradi (`min-height: 42px`)", () => {
    expect(rule('.adm-teacher')).toMatch(/padding: 20px;/)
    expect(rule('.adm-teacher')).toMatch(/border-radius: 16px;/)
    expect(rule('.adm-teacher-role')).toMatch(/background: var\(--color-brand-subtle\);/)
    expect(rule('.adm-teacher-role')).toMatch(/color: var\(--color-brand\);/)
    expect(rule('.adm-teacher-dept')).toMatch(/-webkit-line-clamp: 2;/)
    expect(rule('.adm-teacher-dept')).toMatch(/min-height: 42px;/)
    expect(rule('.adm-teacher-actions')).toMatch(/margin-top: auto;/)
  })

  it("ro'yxatda yo'q kafedra — `--color-warning` chegara va xabar; foto maydoni: yangi — 3 px brend halqa", () => {
    expect(rule('.adm-ctl[data-warn="true"]')).toMatch(/var\(--color-warning\)/)
    expect(rule('.adm-fld-warn')).toMatch(/color: var\(--color-warning\);/)
    expect(css).toMatch(/\.adm-avfield-pic\[data-new="true"\] \.adm-avatar \{ box-shadow: 0 0 0 3px var\(--color-brand\); \}/)
  })

  it("O'qituvchilar klasslarida hardcoded rang yo'q (faqat tokenlar)", () => {
    for (const sel of ['.adm-teacher', '.adm-teacher-role', '.adm-teacher-name', '.adm-teacher-dept', '.adm-avatar', '.adm-avfield-new', '.adm-fld-warn', '.adm-toolbar-count']) {
      expect(rule(sel), sel).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    }
  })
})

describe('Bosqich 6.28 — Profil', () => {
  const css = code
  const rule = sel => (css.match(new RegExp(`${sel.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`)) ?? [])[1] ?? ''
  it('to\'r: 380 px forma/hisob ustuni + `minmax(0, 1fr)`', () => {
    expect(rule('.adm-profile-grid')).toMatch(/grid-template-columns: 380px minmax\(0, 1fr\);/)
  })

  it('kuch o\'lchagichi va talablar holatlari faqat holat tokenlaridan (danger / warning / success)', () => {
    expect(css).toMatch(/\.adm-strength\[data-level="1"\] \.adm-strength-bar:nth-child\(-n\+1\) \{ background: var\(--color-danger\); \}/)
    expect(css).toMatch(/\.adm-strength\[data-level="2"\] \.adm-strength-bar:nth-child\(-n\+2\) \{ background: var\(--color-warning\); \}/)
    expect(css).toMatch(/\.adm-strength\[data-level="4"\] \.adm-strength-bar \{ background: var\(--color-success\); \}/)
    expect(css).toMatch(/\.adm-req\[data-state="ok"\] \{ color: var\(--color-success\); \}/)
    expect(css).toMatch(/\.adm-req\[data-state="fail"\] \{ color: var\(--color-danger\); \}/)
  })

  it('banner: `data-tone` → `--pb` (success / warning); to\'g\'ri parol maydoni — `--color-success` chegara', () => {
    expect(css).toMatch(/\.adm-pbanner\[data-tone="success"\] \{ --pb: var\(--color-success\); --pb-bg: var\(--color-success-bg\); \}/)
    expect(css).toMatch(/\.adm-pbanner\[data-tone="warning"\] \{ --pb: var\(--color-warning\); --pb-bg: var\(--color-warning-bg\); \}/)
    expect(rule('.adm-ctl[data-ok="true"]')).toMatch(/var\(--color-success\)/)
  })

  it('«ko\'z» tugmasi 36 px, fokus halqasi bor', () => {
    expect(rule('.adm-pw-eye')).toMatch(/width: 36px;\s*height: 36px;/)
    expect(rule('.adm-pw-eye:focus-visible')).toMatch(/outline: 2px solid var\(--color-brand\);/)
  })

  it('Profil klasslarida hardcoded rang yo\'q (faqat tokenlar)', () => {
    for (const sel of ['.adm-account', '.adm-account-icon', '.adm-pwform-icon', '.adm-pw-eye', '.adm-fld-ok', '.adm-strength-bar', '.adm-req', '.adm-req-dot', '.adm-pbanner']) {
      expect(rule(sel), sel).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    }
  })

  it('Profil komponentlarida inline style va qo\'lda hodisa-uslub yo\'q', () => {
    for (const n of ['src/pages/admin/ProfileAdmin.jsx', 'src/pages/admin/shared/PasswordField.jsx']) {
      expect(read(n), n).not.toMatch(/style=\{\{/)
      expect(read(n), n).not.toMatch(/\.style\.(opacity|display)|onMouse(Enter|Leave)/)
    }
  })
})
