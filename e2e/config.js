// E2E muhiti uchun umumiy konstantalar — playwright.config.js va barcha
// *.spec.js fayllari shu yerdan o'qiydi (parol/port bir joyda, ikki marta
// yozilmasin). BU YERDAGI PAROL/KALITLAR FAQAT SINOV UCHUN — production'da
// hech qachon ishlatilmaydi, shuning uchun repo'da ochiq turishi xavfsiz
// (kiu-backend/tests/setup.js dagi JWT_SECRET bilan bir xil mantiq).
import bcrypt from 'bcryptjs'

export const BACKEND_PORT = 5057
export const FRONTEND_PORT = 4321

export const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`
export const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`

// kiu-backend/tests/testDbGuard.js bilan BIR XIL qoida: faqat lokal host va
// "-test" bilan tugaydigan baza nomi. E2E haqiqiy server.js'ni (Jest emas)
// ishga tushiradi, shuning uchun bu tekshiruv Jest orqali kelmaydi — shu
// sababli aynan shu yerda, backend ishga tushishidan OLDIN qayta tekshiramiz.
const DEFAULT_E2E_MONGODB_URI = 'mongodb://127.0.0.1:27019/kiu-e2e-test'
export const E2E_MONGODB_URI = process.env.E2E_MONGODB_URI || DEFAULT_E2E_MONGODB_URI

export function assertSafeE2EMongoUri(uri) {
  const ALLOWED_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]', 'mongo-test'])
  let parsed
  try {
    parsed = new URL(uri)
  } catch {
    throw new Error(`E2E_MONGODB_URI noto'g'ri formatda: ${uri}`)
  }
  if (parsed.protocol !== 'mongodb:') {
    throw new Error(`E2E_MONGODB_URI faqat "mongodb://" bo'lishi kerak (Atlas'ga ruxsat yo'q): ${uri}`)
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`E2E Mongo hosti lokal bo'lishi shart, lekin: "${parsed.hostname}"`)
  }
  const dbName = parsed.pathname.replace(/^\//, '')
  if (!/-test$/.test(dbName)) {
    throw new Error(`E2E baza nomi "-test" bilan tugashi shart, lekin: "${dbName}"`)
  }
  return uri
}

// JWT_SECRET talabi (config/env.js): kamida 32 belgi, .env.example namunasi bilan bir xil bo'lmasin.
export const E2E_JWT_SECRET = 'e2e-sinov-uchun-maxfiy-kalit-hech-qachon-productionda-ishlatilmaydi-64'

export const E2E_ADMIN_USERNAME = 'e2e_admin'
export const E2E_ADMIN_PASSWORD = 'E2E-Sinov-Kuchli-Parol-2026!'
export const E2E_WRONG_PASSWORD = 'Notogri-Parol-000!'

// bcrypt cost 12 — backend o'zi ishlatadigan bilan bir xil (authController.js, changePassword)
export const E2E_ADMIN_PASSWORD_HASH = bcrypt.hashSync(E2E_ADMIN_PASSWORD, 12)

// CSP E2E (csp.spec.js): production build shu API manziliga bog'lanadi. vercel.json dagi `connect-src` da
// AYNAN shu origin bo'lishi shart (src/csp.test.js tekshiradi) — Vercel'dagi VITE_API_URL bilan bir xil bo'lsin.
export const CSP_API_ORIGIN = 'https://kiu-backend-9fwp.onrender.com'
export const CSP_PORT = 4322
export const CSP_URL = `http://127.0.0.1:${CSP_PORT}`
