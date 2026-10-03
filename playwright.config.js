import { defineConfig, devices } from '@playwright/test'
import {
  BACKEND_PORT,
  BACKEND_URL,
  FRONTEND_PORT,
  FRONTEND_URL,
  E2E_MONGODB_URI,
  assertSafeE2EMongoUri,
  E2E_JWT_SECRET,
  E2E_ADMIN_USERNAME,
  E2E_ADMIN_PASSWORD_HASH,
  CSP_API_ORIGIN,
  CSP_PORT,
  CSP_URL,
} from './e2e/config.js'

// Backend haqiqiy server.js orqali (Jest emas) ishga tushiriladi, shuning uchun
// kiu-backend/tests/testDbGuard.js bu yerga avtomatik tegishli emas — xavfsizlik
// uchun xuddi shu tekshiruvni backend ishga tushishidan OLDIN, konfiguratsiya
// yuklanayotgan paytda o'zimiz bajaramiz. Noto'g'ri (masalan production Atlas)
// URI bilan E2E ishga tushirilishga urinilsa, hech qanday server ochilmasdan
// darhol aniq xato bilan to'xtaydi.
assertSafeE2EMongoUri(E2E_MONGODB_URI)

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  // Bitta backend/Mongo instance va bitta admin hisobi barcha spec fayllar
  // orasida umumiy — login rate-limiter, Mongo state va h.k. parallel workerlar
  // orasida musobaqa holatiga (race condition) olib kelmasligi uchun ketma-ket.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: FRONTEND_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Vite dev server + haqiqiy backend
    { name: 'chromium', testIgnore: /csp\.spec\.js/, use: { ...devices['Desktop Chrome'] } },
    // Production build, vercel.json header'lari bilan (e2e/serve-dist.mjs) — CSP Report-Only regressiyasi
    { name: 'csp', testMatch: /csp\.spec\.js/, use: { ...devices['Desktop Chrome'], baseURL: CSP_URL } },
  ],
  webServer: [
    {
      // CSP testi uchun production build: API manzili siyosatdagi `connect-src` bilan bir xil, GA yoqilgan (skript yo'li tekshiriladi)
      command: 'npx vite build --outDir dist-csp --emptyOutDir && node e2e/serve-dist.mjs',
      cwd: '.',
      url: CSP_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        VITE_API_URL: CSP_API_ORIGIN,
        VITE_GA_MEASUREMENT_ID: 'G-E2ECSP01',
        DIST_DIR: 'dist-csp',
        PORT: String(CSP_PORT),
      },
    },
    {
      command: 'node server.js',
      cwd: 'kiu-backend',
      url: `${BACKEND_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        PORT: String(BACKEND_PORT),
        NODE_ENV: 'test',
        LOG_LEVEL: 'info',
        MONGODB_URI: E2E_MONGODB_URI,
        JWT_SECRET: E2E_JWT_SECRET,
        ADMIN_USERNAME: E2E_ADMIN_USERNAME,
        // login/refreshAdminSettingsFromDb bo'sh "settings" kolleksiyasida hech
        // narsa topmaydi (yangi baza), shuning uchun shu qiymat saqlanib qoladi.
        ADMIN_PASSWORD_HASH: E2E_ADMIN_PASSWORD_HASH,
        FRONTEND_URL: FRONTEND_URL,
        // BACKEND_URL o'rnatilmaydi — aks holda keep-alive ping (pingSelf) E2E
        // paytida keraksiz fon so'rovlarini yubora boshlaydi.
      },
    },
    {
      // --host 127.0.0.1: bayroqsiz Vite "localhost"ni o'zi hal qiladi va
      // ba'zi Windows/Node kombinatsiyalarida buni IPv6 (::1) sifatida
      // bog'laydi — shunda Playwright'ning 127.0.0.1'ga qilgan tekshiruvi
      // ECONNREFUSED bilan tugaydi, garchi server terminalda "ready" deb
      // yozgan bo'lsa ham. Majburan 127.0.0.1'ga bog'lab shu noaniqlikni olib tashlaymiz.
      command: `npx vite --port ${FRONTEND_PORT} --strictPort --host 127.0.0.1`,
      cwd: '.',
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        VITE_API_URL: BACKEND_URL,
      },
    },
  ],
})