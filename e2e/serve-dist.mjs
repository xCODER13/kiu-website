// Production build'ni Vercel kabi xizmat qiladi: `vercel.json` dagi `headers` (CSP Report-Only) va
// `rewrites` (SPA → index.html) o'qiladi, shuning uchun CSP E2E testi haqiqiy header bilan ishlaydi
// (Vite dev server'da inline HMR skriptlari soxta buzilishlar beradi). Faqat sinov uchun.
import http from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, normalize, resolve } from 'node:path'

const DIST = resolve(process.env.DIST_DIR || 'dist-csp')
const PORT = Number(process.env.PORT || 4322)
const cfg = JSON.parse(readFileSync(resolve('vercel.json'), 'utf8'))

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml',
}
// vercel.json `source` — path-to-regexp; bu yerda faqat `/(.*)` ishlatiladi
const headerRules = (cfg.headers ?? []).map(h => ({ re: new RegExp(`^${h.source}$`), headers: h.headers }))

http.createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0])
  let file = normalize(join(DIST, path))
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end() } // path traversal himoyasi
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html') // rewrite
  for (const r of headerRules) if (r.re.test(path)) for (const { key, value } of r.headers) res.setHeader(key, value)
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
}).listen(PORT, '127.0.0.1', () => console.log(`serve-dist: http://127.0.0.1:${PORT} (${DIST})`))
