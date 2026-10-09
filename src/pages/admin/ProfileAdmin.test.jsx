import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import ProfileAdmin from './ProfileAdmin'
import { installUnauthorizedHandler } from './shared/api'
import { mockApi } from '../../test/helpers'

const b64 = o => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const makeJwt = payload => `${b64({ alg: 'none' })}.${b64(payload)}.x`
const DAY = 24 * 3600

// `GET /admin/me` (Hisob kartasi) har renderda ketadi — barcha testlar uchun standart javob
const ME = {
  username: 'admin',
  passwordChangedAt: new Date(Date.now() - 20 * DAY * 1000).toISOString(),
  sessionExpiresAt: new Date(Date.now() + (7 * DAY + 600) * 1000).toISOString(),
}
const mockProfile = (routes = {}) => mockApi({ 'GET /admin/me': ME, ...routes })
// «so'rov ketmaydi» tekshiruvlari: `GET /admin/me` dan boshqa so'rovlar
// Joriy `fetch` mock'iga ketgan so'rovlar (path bo'yicha)
const mockCallsTo = path => globalThis.fetch.mock.calls.filter(([u]) => String(u).endsWith(path))
const sent = api => api.calls.filter(c => !(c.method === 'GET' && c.path === '/admin/me'))

const renderProfile = () => render(
  <MemoryRouter initialEntries={['/admin/profile']}>
    <Routes>
      <Route path="/admin/profile" element={<ProfileAdmin />} />
      <Route path="/admin/login" element={<div>LOGIN</div>} />
    </Routes>
  </MemoryRouter>
)

beforeEach(() => {
  mockProfile()
  localStorage.setItem('kiu_token', makeJwt({ username: 'admin', exp: Math.floor(Date.now() / 1000) + 7 * DAY + 600 }))
})
afterEach(() => vi.restoreAllMocks())

const current = () => screen.getByLabelText(/^Joriy parol/)
const next = () => screen.getByLabelText(/^Yangi parol(?!ni)/)
const confirm = () => screen.getByLabelText(/^Yangi parolni takrorlang/)
const saveBtn = () => screen.getByRole('button', { name: /Parolni saqlash|Saqlanmoqda/ })

async function fill(user, cur = 'eski-parol', nw = 'yangi-parol-1', conf = nw) {
  await user.type(current(), cur)
  await user.type(next(), nw)
  await user.type(confirm(), conf)
}
const submit = (user) => user.click(saveBtn())

describe('ProfileAdmin: «Hisob» kartasi (GET /admin/me)', () => {
  const card = () => screen.getByRole('region', { name: 'Hisob' })

  it("yuklanmoqda — 3 satr skeleti (`aria-busy`), tayyor bo'lgach haqiqiy ma'lumot; qattiq yozilgan «Rol», «Tizim», «URL» yo'q", async () => {
    renderProfile()
    expect(card()).toHaveAttribute('aria-busy', 'true')
    expect(card().querySelectorAll('.adm-skel--icon')).toHaveLength(3)
    expect(await within(card()).findByText('Login')).toBeInTheDocument()
    expect(card()).not.toHaveAttribute('aria-busy')
    expect(card().querySelector('.adm-skel')).toBeNull()
    expect(within(card()).getByText('admin')).toBeInTheDocument()
    for (const t of ['Rol', 'Super Admin', 'Tizim', 'KIU Admin Panel', 'URL', 'localhost:5173/admin']) expect(screen.queryByText(t)).toBeNull()
  })

  it("«Parol oxirgi o'zgargan» — sana va «20 kun oldin»; «Sessiya tugaydi» — sana va «7 kundan so'ng»", async () => {
    renderProfile()
    await within(card()).findByText("Parol oxirgi o'zgargan")
    expect(within(card()).getByText('20 kun oldin')).toBeInTheDocument()
    expect(within(card()).getByText('Sessiya tugaydi')).toBeInTheDocument()
    expect(within(card()).getByText("7 kundan so'ng")).toBeInTheDocument()
    expect(mockCallsTo('/admin/me')).toHaveLength(1)
  })

  it("parol hech o'zgarmagan (null) — «Hech qachon» va boshlang'ich parol izohi", async () => {
    mockProfile({ 'GET /admin/me': { ...ME, passwordChangedAt: null } })
    renderProfile()
    expect(await within(card()).findByText('Hech qachon')).toBeInTheDocument()
    expect(within(card()).getByText("Hozir server sozlamasidagi boshlang'ich parol ishlatilmoqda.")).toBeInTheDocument()
  })

  it("sessiya muddati yo'q (null) — qator ko'rsatilmaydi, karta qulamaydi", async () => {
    mockProfile({ 'GET /admin/me': { ...ME, sessionExpiresAt: null } })
    renderProfile()
    await within(card()).findByText('Login')
    expect(within(card()).queryByText('Sessiya tugaydi')).toBeNull()
  })

  it("so'rov xatosi — xato paneli, parol formasi baribir ishlaydi; «Qayta urinish» qayta yuklaydi", async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let ok = false
    mockProfile({ 'GET /admin/me': () => (ok ? ME : { status: 500, body: { error: 'x' } }) })
    const user = userEvent.setup()
    renderProfile()
    const alert = await within(card()).findByRole('alert')
    expect(alert).toHaveTextContent("Hisob ma'lumoti yuklanmadi")
    expect(current()).toBeEnabled()
    ok = true
    await user.click(within(card()).getByRole('button', { name: 'Qayta urinish' }))
    expect(await within(card()).findByText('Login')).toBeInTheDocument()
    expect(within(card()).queryByRole('alert')).toBeNull()
  })

  it("javob kutilgan shaklda emas ({}) — xato holati, 'undefined' ko'rsatilmaydi", async () => {
    mockProfile({ 'GET /admin/me': {} })
    renderProfile()
    expect(await within(card()).findByRole('alert')).toBeInTheDocument()
    expect(card()).not.toHaveTextContent('undefined')
  })

  it("parol muvaffaqiyatli almashtirilganda karta mahalliy yangilanadi («hozirgina»), `/admin/me` ga qayta so'rov ketmaydi", async () => {
    mockProfile({ 'POST /admin/change-password': { success: true } })
    const user = userEvent.setup()
    renderProfile()
    await within(card()).findByText('20 kun oldin')
    await fill(user)
    await submit(user)
    await screen.findByText(/Parol o'zgartirildi/)
    expect(within(card()).getByText('hozirgina')).toBeInTheDocument()
    expect(mockCallsTo('/admin/me')).toHaveLength(1)
  })

  it("yashirin login maydoni parol menejeri uchun tokendagi loginni oladi", async () => {
    renderProfile()
    await within(card()).findByText('Login')
    expect(document.querySelector('input[name="username"]')).toHaveValue('admin')
  })
})

describe('ProfileAdmin: maydonlar', () => {
  it("yorliqlar maydonlarga bog'langan; `autocomplete`; parol menejeri uchun yashirin login; 3 ta parol maydoni yashirin", () => {
    const { container } = renderProfile()
    expect(current()).toHaveAttribute('autocomplete', 'current-password')
    expect(next()).toHaveAttribute('autocomplete', 'new-password')
    expect(confirm()).toHaveAttribute('autocomplete', 'new-password')
    expect(next()).toHaveAttribute('placeholder', 'Kamida 8 ta belgi')
    expect(container.querySelectorAll('input[type=password]')).toHaveLength(3)
    const username = container.querySelector('input[autocomplete="username"]')
    expect(username).toHaveValue('admin')
    expect(username).toHaveAttribute('readonly')
  })

  it("«ko'z» tugmasi parolni ko'rsatadi / yashiradi (`aria-pressed`, `aria-label`)", async () => {
    const user = userEvent.setup()
    renderProfile()
    const eye = within(next().closest('.adm-pw')).getByRole('button')
    expect(eye).toHaveAccessibleName("Parolni ko'rsatish")
    expect(eye).toHaveAttribute('aria-pressed', 'false')
    await user.click(eye)
    expect(next()).toHaveAttribute('type', 'text')
    expect(eye).toHaveAccessibleName('Parolni yashirish')
    expect(eye).toHaveAttribute('aria-pressed', 'true')
    await user.click(eye)
    expect(next()).toHaveAttribute('type', 'password')
  })

  it("parol kuchi: bo'sh — faqat «Parol kuchi»; keyin Juda zaif / Zaif / Yaxshi / Kuchli (matn bilan, rang yolg'iz emas)", async () => {
    const user = userEvent.setup()
    const { container } = renderProfile()
    const meter = () => container.querySelector('.adm-strength')
    expect(meter()).toHaveAttribute('data-level', '0')
    expect(screen.queryByText('Juda zaif')).toBeNull()
    await user.type(next(), '1234567')
    expect(screen.getByText('Juda zaif')).toBeInTheDocument()
    expect(meter()).toHaveAttribute('data-level', '1')
    await user.clear(next()); await user.type(next(), 'abcdefgh')
    expect(screen.getByText('Zaif')).toBeInTheDocument()
    await user.clear(next()); await user.type(next(), 'abcdefg123')
    expect(screen.getByText('Yaxshi')).toBeInTheDocument()
    await user.clear(next()); await user.type(next(), 'Kuz-Qarshi-2026!')
    expect(screen.getByText('Kuchli')).toBeInTheDocument()
    expect(screen.getByText(/^Parol kuchi/)).toHaveAttribute('role', 'status')
  })

  it('talablar ro\'yxati: kutilmoqda → bajarilgan / bajarilmagan (har tugmada yangilanadi)', async () => {
    const user = userEvent.setup()
    renderProfile()
    const state = text => screen.getByText(text).closest('li').dataset.state
    expect(state('Kamida 8 ta belgi')).toBe('idle')
    await user.type(next(), '12345')
    expect(state('Kamida 8 ta belgi')).toBe('fail')
    expect(state('Joriy paroldan farq qiladi')).toBe('idle')   // joriy parol hali kiritilmagan
    await user.type(next(), '678')
    expect(state('Kamida 8 ta belgi')).toBe('ok')
    await user.type(current(), '12345678')
    expect(state('Joriy paroldan farq qiladi')).toBe('fail')
    await user.type(current(), 'x')
    expect(state('Joriy paroldan farq qiladi')).toBe('ok')
    await user.clear(next()); await user.type(next(), 'я'.repeat(37))   // 74 bayt (kirill — 2 bayt)
    expect(state(/72 baytdan oshmaydi/)).toBe('fail')
  })
})

describe('ProfileAdmin: validatsiya (alert emas — maydon ostida)', () => {
  it("bo'sh forma: har maydonga o'z xabari, so'rov ketmaydi, fokus birinchi xatoli maydonda", async () => {
    const api = mockProfile()
    const user = userEvent.setup()
    renderProfile()
    await submit(user)
    expect(screen.getByText('Joriy parolni kiriting.')).toBeInTheDocument()
    expect(screen.getByText("Parol kamida 8 ta belgidan iborat bo'lishi kerak.")).toBeInTheDocument()
    expect(screen.getByText('Yangi parolni takrorlang.')).toBeInTheDocument()
    expect(current()).toHaveAttribute('aria-invalid', 'true')
    expect(current()).toHaveFocus()
    expect(sent(api)).toHaveLength(0)
  })

  it("parollar mos kelmasa — takrorlash maydoni ostida xabar, so'rov yuborilmaydi", async () => {
    const api = mockProfile()
    const user = userEvent.setup()
    renderProfile()
    await fill(user, 'eski', 'yangi-parol-1', 'boshqa-parol-2')
    await submit(user)
    expect(screen.getByText('Parollar mos kelmadi.')).toBeInTheDocument()
    expect(confirm()).toHaveFocus()
    expect(sent(api)).toHaveLength(0)
  })

  it("8 belgidan qisqa parol frontend da to'xtatiladi (backend bilan mos); aynan 8 belgi — yuboriladi", async () => {
    const api = mockProfile({ 'POST /admin/change-password': { success: true } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user, 'eski', '1234567')
    await submit(user)
    expect(screen.getByText("Parol kamida 8 ta belgidan iborat bo'lishi kerak.")).toBeInTheDocument()
    expect(sent(api)).toHaveLength(0)
    await user.type(next(), '8')
    await user.type(confirm(), '8')
    await submit(user)
    expect(await screen.findByText(/Parol o'zgartirildi/)).toBeInTheDocument()
    expect(api.find('POST', '/admin/change-password')).toHaveLength(1)
  })

  it("yangi parol joriyga teng — rad etiladi (avval hech qayerda tekshirilmasdi); 72 baytdan uzun — rad etiladi", async () => {
    const api = mockProfile()
    const user = userEvent.setup()
    renderProfile()
    await fill(user, 'bir-xil-parol', 'bir-xil-parol')
    await submit(user)
    expect(screen.getByText('Yangi parol joriy paroldan farq qilishi kerak.')).toBeInTheDocument()
    await user.clear(next()); await user.clear(confirm())
    await user.type(next(), 'я'.repeat(37)); await user.type(confirm(), 'я'.repeat(37))
    await submit(user)
    expect(screen.getByText('Parol 72 baytdan oshmasligi kerak.')).toBeInTheDocument()
    expect(sent(api)).toHaveLength(0)
  })

  it("takrorlash maydonidan chiqilganda mos kelmasa darrov xabar; mos bo'lsa — «Parollar mos.»; yozilganda xato tozalanadi", async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.type(next(), 'yangi-parol-1')
    await user.type(confirm(), 'yangi')
    await user.tab()
    expect(screen.getByText('Parollar mos kelmadi.')).toBeInTheDocument()
    await user.type(confirm(), '-parol-1')
    expect(screen.queryByText('Parollar mos kelmadi.')).toBeNull()
    expect(screen.getByText('Parollar mos.').closest('[role="status"]')).toBeInTheDocument()
  })
})

describe('ProfileAdmin: parolni o\'zgartirish', () => {
  it("muvaffaqiyat: to'g'ri body va header (confirm yuborilmaydi), forma tozalanadi va qulflanadi, token o'chiriladi, «Hozir kirish»", async () => {
    const api = mockProfile({ 'POST /admin/change-password': { success: true } })
    const user = userEvent.setup()
    const { container } = renderProfile()
    await fill(user)
    await submit(user)
    const banner = await screen.findByText(/Parol o'zgartirildi\. Xavfsizlik uchun barcha qurilmalardan chiqarildingiz — 4 soniyadan so'ng/)
    expect(banner.closest('[role="status"]')).toBeInTheDocument()
    const [c] = api.find('POST', '/admin/change-password')
    expect(JSON.parse(c.body)).toEqual({ currentPassword: 'eski-parol', newPassword: 'yangi-parol-1' })
    expect(c.headers.Authorization).toMatch(/^Bearer /)
    container.querySelectorAll('input[type=password]').forEach(i => { expect(i).toHaveValue(''); expect(i).toBeDisabled() })
    expect(localStorage.getItem('kiu_token')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Hozir kirish' }))
    expect(screen.getByText('LOGIN')).toBeInTheDocument()
  })

  it("avtomatik o'tish 4 soniyadan keyin; unmount bo'lsa taymer tozalanadi", async () => {
    mockProfile({ 'POST /admin/change-password': { success: true } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    await screen.findByText(/Parol o'zgartirildi/)
    expect(screen.queryByText('LOGIN')).toBeNull()
    expect(await screen.findByText('LOGIN', {}, { timeout: 5500 })).toBeInTheDocument()
  }, 10000)

  it("unmount: kutayotgan o'tish bekor qilinadi (`clearTimeout`)", async () => {
    mockProfile({ 'POST /admin/change-password': { success: true } })
    const clear = vi.spyOn(globalThis, 'clearTimeout')
    const user = userEvent.setup()
    const { unmount } = renderProfile()
    await fill(user)
    await submit(user)
    await screen.findByText(/Parol o'zgartirildi/)
    clear.mockClear()
    unmount()
    expect(clear).toHaveBeenCalled()
  })

  it("joriy parol noto'g'ri (401) — JORIY PAROL maydoni ostida xabar, fokus shu yerda, forma saqlanadi; token saqlanadi, tizimdan CHIQMAYDI", async () => {
    mockProfile({ 'POST /admin/change-password': { status: 401, body: { error: "Joriy parol noto'g'ri" } } })
    // `Dashboard.jsx` dagi umumiy 401 handler: avval aynan shu javob adminni login'ga chiqarib yuborardi
    const onUnauthorized = vi.fn()
    const cleanup = installUnauthorizedHandler(onUnauthorized)
    const token = localStorage.getItem('kiu_token')
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    expect(await screen.findByText("Joriy parol noto'g'ri.")).toBeInTheDocument()
    expect(current()).toHaveFocus()
    expect(current()).toHaveAttribute('aria-invalid', 'true')
    expect(next()).toHaveValue('yangi-parol-1')
    expect(onUnauthorized).not.toHaveBeenCalled()
    expect(localStorage.getItem('kiu_token')).toBe(token)
    expect(screen.queryByText('LOGIN')).toBeNull()
    expect(saveBtn()).toBeEnabled()
    cleanup()
  })

  it("403 (backend tuzatilgach) ham xuddi shunday — maydon xatosi", async () => {
    mockProfile({ 'POST /admin/change-password': { status: 403, body: { error: "Joriy parol noto'g'ri" } } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    expect(await screen.findByText("Joriy parol noto'g'ri.")).toBeInTheDocument()
    expect(screen.queryByText('LOGIN')).toBeNull()
  })

  it("boshqa 401 (token eskirgan) — token o'chadi va login ga o'tiladi", async () => {
    mockProfile({ 'POST /admin/change-password': { status: 401, body: { error: "Sessiya eskirgan — parol o'zgartirilgan, qaytadan kiring" } } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).toBeNull()
  })

  it("urinishlar limiti (429) — ogohlantirish banneri (`role=alert`), forma ochiq qoladi", async () => {
    mockProfile({ 'POST /admin/change-password': { status: 429, body: { error: "Juda ko'p muvaffaqiyatsiz urinish. 15 daqiqadan so'ng qayta urinib ko'ring." } } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    const banner = await screen.findByText(/Juda ko'p muvaffaqiyatsiz urinish/)
    expect(banner.closest('[role="alert"]')).toHaveAttribute('data-tone', 'warning')
    expect(next()).toHaveValue('yangi-parol-1')
  })

  it("urinishlar limiti (429): blok tugashigacha forma qulflanadi, tugma «Vaqtincha bloklangan», qolgan vaqt `Retry-After` dan (mm:ss)", async () => {
    mockProfile({ 'POST /admin/change-password': { status: 429, body: { error: "Juda ko'p muvaffaqiyatsiz urinish." }, headers: { 'Retry-After': '872', 'RateLimit-Reset': '872' } } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    const banner = (await screen.findByText(/Juda ko'p muvaffaqiyatsiz urinish/)).closest('[role="alert"]')
    expect(banner).toHaveAttribute('data-tone', 'warning')
    expect(within(banner).getByText(/^14:3\d$|^14:32$/)).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: 'Vaqtincha bloklangan' })
    expect(btn).toBeDisabled()
    expect(current()).toBeDisabled()
    expect(next()).toBeDisabled()
    expect(next()).toHaveValue('yangi-parol-1') // maydonlar saqlanadi
  })

  it("429: `Retry-After` bo'lmasa `RateLimit-Reset`, ikkalasi ham bo'lmasa 15 daqiqa", async () => {
    mockProfile({ 'POST /admin/change-password': { status: 429, body: { error: 'Limit' }, headers: { 'RateLimit-Reset': '90' } } })
    const user = userEvent.setup()
    const { unmount } = renderProfile()
    await fill(user)
    await submit(user)
    expect((await screen.findByText('Limit')).closest('[role="alert"]')).toHaveTextContent(/1:(30|29)/)
    unmount()

    mockProfile({ 'POST /admin/change-password': { status: 429, body: { error: 'Limit' } } })
    renderProfile()
    await fill(user)
    await submit(user)
    expect((await screen.findByText('Limit')).closest('[role="alert"]')).toHaveTextContent(/15:00|14:59/)
  })

  it("429: vaqt tugagach forma o'zi qayta ochiladi (banner yo'qoladi, maydonlar saqlangan); unmount bo'lsa interval tozalanadi", async () => {
    mockProfile({ 'POST /admin/change-password': { status: 429, body: { error: 'Limit' }, headers: { 'Retry-After': '2' } } })
    const user = userEvent.setup()
    const { unmount } = renderProfile()
    await fill(user)
    await submit(user)
    await screen.findByText('Limit')
    expect(screen.getByRole('button', { name: 'Vaqtincha bloklangan' })).toBeDisabled()
    const reopened = await screen.findByRole('button', { name: 'Parolni saqlash' }, { timeout: 4000 })
    expect(reopened).toBeEnabled()
    expect(screen.queryByText('Limit')).toBeNull()
    expect(next()).toHaveValue('yangi-parol-1')

    // yangi blok → unmount: interval qolmaydi
    const clear = vi.spyOn(globalThis, 'clearInterval')
    await submit(user)
    await screen.findByText('Limit')
    unmount()
    expect(clear).toHaveBeenCalled()
  }, 12000)

  it("noto'g'ri joriy parol + `RateLimit-Remaining` — maydon xatosida «Yana N ta urinish qoldi.»", async () => {
    mockProfile({ 'POST /admin/change-password': { status: 403, body: { error: "Joriy parol noto'g'ri" }, headers: { 'RateLimit-Remaining': '3' } } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    expect((await screen.findByText("Joriy parol noto'g'ri. Yana 3 ta urinish qoldi.")).closest('[role="alert"]')).toBeInTheDocument()
    expect(current()).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Parolni saqlash' })).toBeEnabled() // hali bloklanmagan
  })

  it("`RateLimit-Remaining: 0` — «Urinishlar tugadi»; sarlavha yo'q yoki noto'g'ri bo'lsa qo'shimcha matn chiqmaydi", async () => {
    for (const [headers, expected] of [
      [{ 'RateLimit-Remaining': '0' }, "Joriy parol noto'g'ri. Urinishlar tugadi — keyingi xato vaqtincha bloklaydi."],
      [undefined, "Joriy parol noto'g'ri."],
      [{ 'RateLimit-Remaining': 'abc' }, "Joriy parol noto'g'ri."],
      [{ 'RateLimit-Remaining': '-2' }, "Joriy parol noto'g'ri."],
    ]) {
      mockProfile({ 'POST /admin/change-password': { status: 403, body: { error: "Joriy parol noto'g'ri" }, headers } })
      const user = userEvent.setup()
      const { unmount } = renderProfile()
      await fill(user)
      await submit(user)
      expect(await screen.findByText(expected)).toBeInTheDocument()
      unmount()
    }
  })

  it("boshqa server xatosi — banner (server xabari), maydonlar saqlanadi, tugma qayta faol", async () => {
    mockProfile({ 'POST /admin/change-password': { status: 500, body: { error: 'Admin paroli sozlanmagan.' } } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    expect(await screen.findByText("Admin paroli sozlanmagan — maydonlar saqlanib turibdi, qayta urinib ko'ring.")).toBeInTheDocument()
    expect(next()).toHaveValue('yangi-parol-1')
    expect(localStorage.getItem('kiu_token')).not.toBeNull()
    expect(saveBtn()).toBeEnabled()
  })

  it("tarmoq xatosi — banner, maydonlar saqlanadi, tugma qayta faol (xato ikonkasi — axlat qutisi emas)", async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    expect(await screen.findByText("Parol o'zgartirilmadi. Server bilan bog'lanib bo'lmadi — maydonlar saqlanib turibdi, qayta urinib ko'ring.")).toBeInTheDocument()
    expect(current()).toHaveValue('eski-parol')
    expect(saveBtn()).toBeEnabled()
    // yozilganda banner tozalanadi
    await user.type(current(), 'x')
    expect(screen.queryByText(/Server bilan bog'lanib bo'lmadi/)).toBeNull()
  })

  it("saqlanmoqda: maydonlar o'chiq, tugma `aria-busy`; ikki marta bosish ikkinchi so'rov yubormaydi", async () => {
    let release
    const held = new Promise(r => { release = r })
    const fn = vi.fn(async url => {
      if (String(url).endsWith('/admin/me')) return { ok: true, status: 200, json: async () => ME }
      await held
      return { ok: true, status: 200, json: async () => ({ success: true }) }
    })
    vi.stubGlobal('fetch', fn)
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await submit(user)
    const btn = await screen.findByRole('button', { name: 'Saqlanmoqda...' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
    expect(current()).toBeDisabled()
    await user.click(btn)
    expect(fn.mock.calls.filter(([u]) => !String(u).endsWith('/admin/me'))).toHaveLength(1)
    release()
    await screen.findByText(/Parol o'zgartirildi/)
    expect(fn.mock.calls.filter(([u]) => !String(u).endsWith('/admin/me'))).toHaveLength(1)
  })

  it("inline stil yo'q", async () => {
    mockProfile()
    const user = userEvent.setup()
    const { container } = renderProfile()
    await submit(user)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })
})

describe('ProfileAdmin: «Sessiya xavfsizligi» (logout-all)', () => {
  const openBtn = () => screen.getByRole('button', { name: 'Barcha qurilmalardan chiqish' })
  const dialog = () => screen.getByRole('alertdialog', { name: 'Barcha qurilmalardan chiqasizmi?' })
  const confirmBtn = () => within(dialog()).getByRole('button', { name: 'Barchasidan chiqish' })

  it('karta: sarlavha, tushuntirish va tugma; bosilmaguncha so\'rov ketmaydi', () => {
    const api = mockProfile()
    renderProfile()
    const card = screen.getByRole('region', { name: 'Sessiya xavfsizligi' })
    expect(within(card).getByText(/Parolni o'zgartirmasdan barcha qurilmalardagi sessiyalarni tugatadi/)).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Barcha qurilmalardan chiqish' })).toHaveClass('btn-danger')
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(api.find('POST', '/admin/logout-all')).toHaveLength(0)
  })

  it('tugma tasdiq dialogini ochadi: matn, fokus «Bekor qilish»da; so\'rov hali ketmaydi', async () => {
    const api = mockProfile()
    const user = userEvent.setup()
    renderProfile()
    await user.click(openBtn())
    expect(dialog()).toHaveAccessibleDescription("Shu qurilmadagi sessiya ham tugaydi — qaytadan kirishingiz kerak. Parol o'zgarmaydi.")
    expect(within(dialog()).getByRole('button', { name: 'Bekor qilish' })).toHaveFocus()
    expect(document.querySelector('.adm-dialog-icon--warning')).not.toBeNull()
    expect(api.find('POST', '/admin/logout-all')).toHaveLength(0)
  })

  it('«Bekor qilish» va Esc — dialog yopiladi, so\'rov yo\'q, token saqlanadi', async () => {
    const api = mockProfile()
    const user = userEvent.setup()
    renderProfile()
    await user.click(openBtn())
    await user.click(within(dialog()).getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    await user.click(openBtn())
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(api.find('POST', '/admin/logout-all')).toHaveLength(0)
    expect(localStorage.getItem('kiu_token')).not.toBeNull()
  })

  it('tasdiqlash: POST /admin/logout-all (Authorization bilan, body yo\'q), token o\'chadi, kirish sahifasiga o\'tiladi', async () => {
    const api = mockProfile({ 'POST /admin/logout-all': { success: true } })
    const user = userEvent.setup()
    renderProfile()
    await user.click(openBtn())
    await user.click(confirmBtn())
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
    const calls = api.find('POST', '/admin/logout-all')
    expect(calls).toHaveLength(1)
    expect(calls[0].headers.Authorization).toMatch(/^Bearer /)
    expect(calls[0].body).toBeUndefined()
    expect(localStorage.getItem('kiu_token')).toBeNull()
  })

  it('401 (token allaqachon yaroqsiz) — natija bir xil: token o\'chadi, kirish sahifasi', async () => {
    mockProfile({ 'POST /admin/logout-all': { status: 401, body: { error: 'Sessiya tugatilgan' } } })
    const user = userEvent.setup()
    renderProfile()
    await user.click(openBtn())
    await user.click(confirmBtn())
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).toBeNull()
  })

  it('429 — xabar kartada, dialog yopiladi, token saqlanadi, qayta urinish mumkin', async () => {
    const api = mockProfile({ 'POST /admin/logout-all': { status: 429, body: { error: "Juda ko'p so'rov yuborildi." } } })
    const user = userEvent.setup()
    renderProfile()
    await user.click(openBtn())
    await user.click(confirmBtn())
    expect(await screen.findByText("Juda ko'p so'rov yuborildi.")).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(localStorage.getItem('kiu_token')).not.toBeNull()
    await user.click(openBtn())
    await user.click(confirmBtn())
    expect(api.find('POST', '/admin/logout-all')).toHaveLength(2)
  })

  it('server xatosi (500) — server xabari bilan banner, token saqlanadi', async () => {
    mockProfile({ 'POST /admin/logout-all': { status: 500, body: { error: 'Server xatosi' } } })
    const user = userEvent.setup()
    renderProfile()
    await user.click(openBtn())
    await user.click(confirmBtn())
    expect(await screen.findByText("Server xatosi — qayta urinib ko'ring.")).toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).not.toBeNull()
    expect(screen.queryByText('LOGIN')).toBeNull()
  })

  it("tarmoq xatosi — banner, dialog yopiladi, token saqlanadi", async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const user = userEvent.setup()
    renderProfile()
    await user.click(openBtn())
    await user.click(confirmBtn())
    expect(await screen.findByText("Sessiyalar tugatilmadi. Server bilan bog'lanib bo'lmadi — qayta urinib ko'ring.")).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(localStorage.getItem('kiu_token')).not.toBeNull()
  })

  it("so'rov ketayotganda: tasdiq `aria-busy`, tugmalar o'chiq, ikki marta bosish ikkinchi so'rov yubormaydi", async () => {
    let release
    const held = new Promise(r => { release = r })
    const fn = vi.fn(async url => {
      if (String(url).endsWith('/admin/me')) return { ok: true, status: 200, json: async () => ME }
      await held
      return { ok: true, status: 200, json: async () => ({ success: true }) }
    })
    vi.stubGlobal('fetch', fn)
    const user = userEvent.setup()
    renderProfile()
    await user.click(openBtn())
    await user.click(confirmBtn())
    expect(confirmBtn()).toHaveAttribute('aria-busy', 'true')
    expect(confirmBtn()).toBeDisabled()
    expect(within(dialog()).getByRole('button', { name: 'Bekor qilish' })).toBeDisabled()
    await user.click(confirmBtn())
    await user.keyboard('{Escape}')
    expect(dialog()).toBeInTheDocument()
    expect(fn.mock.calls.filter(([u]) => !String(u).endsWith('/admin/me'))).toHaveLength(1)
    release()
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
    expect(fn.mock.calls.filter(([u]) => !String(u).endsWith('/admin/me'))).toHaveLength(1)
  })
})
