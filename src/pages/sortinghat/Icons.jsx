// ── SVG ICONS ──────────────────────────────────────────────
// Hammasi dekorativ (`aria-hidden`) va rangi tokendan/`currentColor` dan keladi — o'rab turgan element
// (plitka, pill, matn) rangni belgilaydi. Qattiq hex yo'q (6.11d).

// Shlyapa (taxta "SortingHat-*"): to'liq tekis ranglar — qalpoq `--color-brand-hover`, ichki soya `--wine-900`,
// qirra va belbog' `--color-brand-fill`; bant, bog'ich va uchi oltin (+ uchida oq nuqta). Gradient yo'q.
export const IcHat = ({ s = 80 }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={s} height={s} aria-hidden="true">
    <ellipse cx="40" cy="66" rx="28" ry="8" fill="var(--color-brand-fill)" opacity=".3" />
    <ellipse cx="40" cy="60" rx="30" ry="9" fill="var(--color-brand-fill)" />
    <path d="M40 8 L64 58 H16 Z" fill="var(--color-brand-hover)" />
    <path d="M40 8 L56 48 H24 Z" fill="var(--wine-900)" opacity=".85" />
    <rect x="11" y="57" width="58" height="8" rx="4" fill="var(--color-brand-fill)" />
    <path d="M35 36 Q40 30 45 36 Q40 33 35 36Z" fill="var(--color-accent)" />
    <circle cx="40" cy="11" r="4" fill="var(--color-accent)" />
    <circle cx="40" cy="11" r="2" fill="var(--color-on-brand)" opacity=".5" />
  </svg>
)

// Yulduz: standart rang — oltin (`--color-accent`); matn yonida ishlatilganda `c="currentColor"`
export const IcStar = ({ s = 14, c = 'var(--color-accent)' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c} aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const Stroke = ({ s, w = 2, children }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

export const IcQuestion = ({ s = 28 }) => (
  <Stroke s={s}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </Stroke>
)

export const IcBolt = ({ s = 28 }) => (
  <Stroke s={s}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </Stroke>
)

export const IcTarget = ({ s = 28 }) => (
  <Stroke s={s}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </Stroke>
)

export const IcSparkle = ({ s = 28 }) => (
  <Stroke s={s}>
    <path d="M12 3L14 9L20 12L14 15L12 21L10 15L4 12L10 9Z"/>
    <path d="M5 3L5.8 5.2L8 6L5.8 6.8L5 9L4.2 6.8L2 6L4.2 5.2Z"/>
    <path d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2Z"/>
  </Stroke>
)

export const IcCheck = ({ s = 14 }) => (
  <Stroke s={s} w={3}><polyline points="20 6 9 17 4 12"/></Stroke>
)

export const IcArrow = ({ s = 13 }) => (
  <Stroke s={s}><polyline points="9 18 15 12 9 6"/></Stroke>
)

export const IcArrowRight = ({ s = 16 }) => (
  <Stroke s={s}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </Stroke>
)

export const IcRefresh = ({ s = 15 }) => (
  <Stroke s={s}>
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </Stroke>
)

export const IcPlay = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)

export const IcGrad = ({ s = 16 }) => (
  <Stroke s={s}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </Stroke>
)

export const IcFile = ({ s = 16 }) => (
  <Stroke s={s}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </Stroke>
)

export const IcBulb = ({ s = 28 }) => (
  <Stroke s={s}>
    <line x1="9" y1="18" x2="15" y2="18"/>
    <line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </Stroke>
)

// Medallar: bitta brend rangda (`currentColor`); o'rin matn bilan ham aytiladi ("Birinchi tavsiya") — rang yolg'iz emas
const Medal = () => (
  <Stroke s={18}>
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </Stroke>
)
export const IcMedal1 = Medal
export const IcMedal2 = Medal
export const IcMedal3 = Medal
