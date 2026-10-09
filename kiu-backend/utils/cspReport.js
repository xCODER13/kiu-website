// ── CSP HISOBOTLARINI TOZALASH (5.1) ──
// `POST /api/csp-report` ga HAR KIM yubora oladi (autentifikatsiyasiz), shuning uchun kelgan narsa
// ishonchsiz: faqat ma'lum maydonlar olinadi, matnlar qisqartiriladi, URL'lardan query/hash olib tashlanadi
// (ularda token yoki shaxsiy ma'lumot bo'lishi mumkin). Natija logga yoziladi — DB'ga HECH QACHON.
//
// Ikki format bor:
//  - eski (`report-uri`):   { "csp-report": { "blocked-uri": ..., "effective-directive": ... } }  (application/csp-report)
//  - yangi (Reporting API): [ { type: 'csp-violation', body: { blockedURL, effectiveDirective, ... } } ]  (application/reports+json)

const MAX_REPORTS_PER_REQUEST = 10
const MAX_FIELD_LENGTH = 200

// Brauzer kengaytmalari (parol menejer, reklama bloker va h.k.) o'z skriptlarini sahifaga qo'shadi va
// bizning siyosatni «buzadi» — bu saytning xatosi emas, shuning uchun logga yozilmaydi.
const EXTENSION_SCHEME_RE = /^(chrome-extension|moz-extension|safari-extension|safari-web-extension|ms-browser-extension):/i

const isExtensionNoise = (...values) => values.some(v => typeof v === 'string' && EXTENSION_SCHEME_RE.test(v.trim()))

// Faqat `http(s)` URL'lar `origin + path` ko'rinishida qoladi; `data:`, `blob:` kabilar — faqat sxema;
// `inline`/`eval` kabi kalit so'zlar o'zgarishsiz. Yaroqsiz qiymat — query/hash'siz, qisqartirilgan matn.
function cleanUrl(value) {
  if (typeof value !== 'string') return undefined
  const v = value.trim().slice(0, 500)
  if (!v) return undefined
  try {
    const u = new URL(v)
    const out = (u.protocol === 'http:' || u.protocol === 'https:') ? `${u.origin}${u.pathname}` : u.protocol.slice(0, -1)
    return out.slice(0, MAX_FIELD_LENGTH)
  } catch {
    return v.split(/[?#]/)[0].slice(0, MAX_FIELD_LENGTH)
  }
}

// Direktiva nomi: `script-src-elem` yoki «script-src 'self' https://...» dan birinchi so'z.
function cleanDirective(value) {
  if (typeof value !== 'string') return undefined
  const first = value.trim().split(/\s+/)[0].slice(0, 60)
  return /^[a-z-]+$/i.test(first) ? first : undefined
}

const cleanNumber = value => (Number.isSafeInteger(value) && value >= 0 ? value : undefined)

const cleanDisposition = value => (value === 'enforce' || value === 'report' ? value : undefined)

// Ikkala formatdagi maydon nomlarini bitta shaklga keltiradi. Noma'lum maydonlar tashlanadi.
function pickReport(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const blockedRaw = raw['blocked-uri'] ?? raw.blockedURL
  const sourceRaw = raw['source-file'] ?? raw.sourceFile
  if (isExtensionNoise(blockedRaw, sourceRaw)) return null

  const report = {
    directive: cleanDirective(raw['effective-directive'] ?? raw.effectiveDirective ?? raw['violated-directive'] ?? raw.violatedDirective),
    blocked: cleanUrl(blockedRaw),
    document: cleanUrl(raw['document-uri'] ?? raw.documentURL),
    source: cleanUrl(sourceRaw),
    line: cleanNumber(raw['line-number'] ?? raw.lineNumber),
    column: cleanNumber(raw['column-number'] ?? raw.columnNumber),
    disposition: cleanDisposition(raw.disposition)
  }
  // Bo'sh qiymatlar logni to'ldirmasin; hech narsa qolmasa — hisobot emas.
  const entries = Object.entries(report).filter(([, v]) => v !== undefined)
  return entries.length ? Object.fromEntries(entries) : null
}

function extractRaw(body) {
  if (Array.isArray(body)) return body.filter(r => r && r.type === 'csp-violation').map(r => r.body)
  if (body && typeof body === 'object' && body['csp-report']) return [body['csp-report']]
  return []
}

// Tozalangan hisobotlar ro'yxati (bo'sh bo'lishi mumkin). Bir so'rovda ko'pi bilan MAX_REPORTS_PER_REQUEST ta.
function normalizeCspReports(body) {
  return extractRaw(body).slice(0, MAX_REPORTS_PER_REQUEST).map(pickReport).filter(Boolean)
}

module.exports = { normalizeCspReports, MAX_REPORTS_PER_REQUEST, MAX_FIELD_LENGTH }
