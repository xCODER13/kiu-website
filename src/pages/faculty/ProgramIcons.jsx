/* ── Yo'nalish ikonkalari (to'ldirilgan, bir rangli piktogrammalar) ─────────────────────────────
   kiu.uz dagi "Yo'nalishlarimiz" ko'rinishida: qalin to'ldirilgan shakl, ichida kesilgan detallar (evenodd).
   Rang `currentColor` — brend rangi (`.tile` / `.fac-icon`) yoki hover'dagi `--color-on-brand` dan olinadi, hex yo'q.
   Kalit — yo'nalish `id` si (faculty/data.js); topilmasa chaqiruvchi `IC[icon]` (chiziqli ikonka) ga qaytadi.
   Hammasi 48×48 viewBox, dekorativ (`aria-hidden`): nom doim matnda bor. */

const svg = (size, children) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false">
    {children}
  </svg>
)
const cut = { fillRule: 'evenodd', clipRule: 'evenodd' }

export const PROGRAM_ICONS = {
  // Maktabgacha ta'lim — o'yin kublari: halqali kvadrat, uchburchak va doiralar
  preschool: s => svg(s, <>
    <path {...cut} d="M9 4h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm7 5.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6z" />
    <path {...cut} d="M15.5 27.5 27 44H4zm0 6.5-4 6.5h8z" />
    <path {...cut} d="M37 24a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    <path {...cut} d="M38 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
  </>),

  // Boshlang'ich ta'lim — maktab binosi, bayroqli minora
  primary: s => svg(s, <>
    <path d="M23 2h2v7h-2z" />
    <path d="M25 2.5 33 5l-8 2.5z" />
    <path {...cut} d="M24 9.5 36 16v6H12v-6zm0 4.5a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z" />
    <path {...cut} d="M4 24h40v20H4zm4 4v5h5v-5zm27 0v5h5v-5zM8 36v5h5v-5zm27 0v5h5v-5zm-15 8v-9a4 4 0 0 1 8 0v9z" />
  </>),

  // Milliy g'oya, ma'naviyat asoslari va huquq ta'limi — bayroq va ochiq kitob
  nationalIdea: s => svg(s, <>
    <rect x="7" y="3" width="3" height="41" rx="1.5" />
    <path {...cut} d="M10 5h29l-6 8.5 6 8.5H10zm9 5.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    <path d="M15 29h10.5A3.5 3.5 0 0 1 29 32.5V45a3.5 3.5 0 0 0-3.5-3.5H15zM43 29H32.5A3.5 3.5 0 0 0 29 32.5V45a3.5 3.5 0 0 1 3.5-3.5H43z" />
  </>),

  // Neft va gaz ishi — qazib oluvchi nasos (stanok-kachalka)
  oilGas: s => svg(s, <>
    <path d="M3 42h42a1.5 1.5 0 0 1 0 3H3a1.5 1.5 0 0 1 0-3z" />
    <path d="M13 42 21 16h6l8 26h-4.3L24 22.5 17.3 42z" />
    <path d="M6 11.6 38.6 19.7l-.9 3.6L5.1 15.2z" />
    <circle cx="24" cy="17" r="3.8" />
    <path d="M3 9.5a14 14 0 0 1 11.4 3.6l-2.3 2.6a10.6 10.6 0 0 0-8.1-2.6z" />
    <path d="M6 14h2.4v22H6z" />
    <path d="M2.5 35h9.4v7H2.5z" />
    <path {...cut} d="M39 21.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 3.3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z" />
    <path d="M37.8 32.4h2.4V42h-2.4z" />
  </>),

  // Iqtisodiyot — ustunli diagramma va o'sish strelkasi
  economics: s => svg(s, <>
    <rect x="5" y="30" width="8.5" height="14" rx="1.6" />
    <rect x="19.5" y="22" width="8.5" height="22" rx="1.6" />
    <rect x="34" y="14" width="8.5" height="30" rx="1.6" />
    <path d="M5.5 21.5 17 13.5l9 4.5 10.5-10" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 3.5h12.5V16z" />
  </>),

  // Dasturiy injiniring — noutbuk oldidagi dasturchi, ekranda </>
  softwareEng: s => svg(s, <>
    <circle cx="24" cy="9" r="5.5" />
    <path d="M12 24.5c0-5.2 5-8 12-8s12 2.8 12 8z" />
    <path {...cut} d="M8 27h32a2 2 0 0 1 2 2v13H6V29a2 2 0 0 1 2-2zm11.5 3.5L12 35l7.5 4.5V37L15.5 35l4-2zm9 0V33l4 2-4 2v2.5L36 35zM25.8 30.2h1.6l-5.2 9.6h-1.6z" />
    <path d="M2 43.5h44l-2 2.5H4z" />
  </>),

  // Moliya va moliyaviy texnologiyalar — bank binosi
  finance: s => svg(s, <>
    <path {...cut} d="M24 3 44 13v4H4v-4zm0 5.6a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z" />
    <path d="M8 21h6v16H8zM21 21h6v16h-6zM34 21h6v16h-6z" />
    <path d="M6 37h36v3H6z" />
    <path d="M3 41.5h42V45H3z" />
  </>),

  // Buxgalteriya hisobi — kalkulyator
  accounting: s => svg(s, <>
    <path {...cut} d="M10 3h28a3 3 0 0 1 3 3v36a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm2 5v9h24V8zm0 13.5v5h5.6v-5zm9.2 0v5h5.6v-5zm9.2 0v5H36v-5zM12 29v5h5.6v-5zm9.2 0v5h5.6v-5zm9.2 0v5H36v-5zM12 36.5v5h5.6v-5zm9.2 0v5h5.6v-5zm9.2 0v5H36v-5z" />
  </>),

  // Psixologiya — bosh miya (ikki yarim shar)
  psychology: s => svg(s, <>
    <g>
      <path {...cut} d="M22 5c-3 0-5.2 1.5-6.2 3.6C11.7 9 8.6 12 8.6 16c-2.5 1.5-4 4-4 7s1.6 5.5 4 6.6c.2 4.6 3.4 8.2 7.8 8.2 1.4 3 3.9 5.2 5.6 5.2zM9.5 21c4.2-.2 6.8-2.2 8-5.5-4.2.4-7.2 2.4-8 5.5zm1.4 8c3.6.4 6.5-1.2 8.2-4.6-4 0-7.2 1.5-8.2 4.6zm6 5.5c3.2.2 4.6-1.4 5.1-3.6-3-.6-5.1.5-5.1 3.6z" />
    </g>
    <g transform="translate(48 0) scale(-1 1)">
      <path {...cut} d="M22 5c-3 0-5.2 1.5-6.2 3.6C11.7 9 8.6 12 8.6 16c-2.5 1.5-4 4-4 7s1.6 5.5 4 6.6c.2 4.6 3.4 8.2 7.8 8.2 1.4 3 3.9 5.2 5.6 5.2zM9.5 21c4.2-.2 6.8-2.2 8-5.5-4.2.4-7.2 2.4-8 5.5zm1.4 8c3.6.4 6.5-1.2 8.2-4.6-4 0-7.2 1.5-8.2 4.6zm6 5.5c3.2.2 4.6-1.4 5.1-3.6-3-.6-5.1.5-5.1 3.6z" />
    </g>
  </>),

  // Filologiya va tillarni o'qitish — tarjima belgisi (A va 文)
  philology: s => svg(s, <>
    <path {...cut} d="M6 24h16a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V27a3 3 0 0 1 3-3zm8 3.8L8.4 41h2.9l1.2-3h3l1.2 3h2.9zm0 5.4 1 2.6h-2z" />
    <path {...cut} d="M22 4h20a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H22a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm9 2.2v3.3h-6.8v2H39.8v-2H33V6.2zm-1.2 5.3 1.9 0-4.3 7.1h-2.1zm2.3 0h2.1l4.3 7.1h-2.1z" />
  </>),
}

// Magistratura yo'nalishlari bakalavriat ikonkalarini qayta ishlatadi
PROGRAM_ICONS.linguisticsEn = PROGRAM_ICONS.philology
PROGRAM_ICONS.linguisticsRu = PROGRAM_ICONS.philology
PROGRAM_ICONS.economicsMaster = PROGRAM_ICONS.economics

// Yo'nalish uchun ikonka: avval to'ldirilgan piktogramma (id bo'yicha), bo'lmasa data.js dagi `icon` kaliti (chiziqli IC)
export function programIcon(program, size, fallback) {
  const draw = PROGRAM_ICONS[program.id]
  return draw ? draw(size) : fallback?.[program.icon]?.(size) ?? null
}
