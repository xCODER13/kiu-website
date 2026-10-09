import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplicationsAdmin from './ApplicationsAdmin'
import { mockApi as baseMockApi, rowWith } from '../../test/helpers'

const A = [
  { _id: 'a1', name: 'Ali Valiyev', phone: '+998901111111', faculty: 'Iqtisodiyot', status: 'new', type: 'admission' },
  { _id: 'a2', name: 'Vali Aliyev', phone: '+998902222222', status: 'accepted' },              // eski yozuv: type yo'q → admission
  { _id: 'a3', name: 'Nodira Karimova', phone: '+998903333333', status: 'reviewed', type: 'vacancy', position: 'Dotsent', faculty: 'IT' },
]
// Yangi backend (4.4) ni taqlid qiladi: serverda `type`/`status` filtri, sahifalash va holatlar sanog'i.
// `type` yo'q (eski) yozuvlar qabul arizasi hisoblanadi (backend: `$in: ['admission', null]`).
function listResponse(all, path) {
  const q = new URL(path, 'http://x').searchParams
  const type = q.get('type')
  const limit = Math.min(Math.max(parseInt(q.get('limit')) || 20, 1), 50)
  const page = Math.max(parseInt(q.get('page')) || 1, 1)
  const ofType = all.filter(a => (type === 'vacancy' ? a.type === 'vacancy' : type === 'admission' ? (!a.type || a.type === 'admission') : true))
  const counts = { all: ofType.length, new: 0, reviewed: 0, accepted: 0, rejected: 0 }
  for (const a of ofType) if (a.status in counts) counts[a.status] += 1
  const filtered = q.get('status') ? ofType.filter(a => a.status === q.get('status')) : ofType
  return { items: filtered.slice((page - 1) * limit, page * limit), total: filtered.length, page, limit, counts }
}
// Qulaylik: `'GET /applications': [..]` massiv sifatida beriladi, mockApi uni server javobiga aylantiradi
const mockApi = routes => baseMockApi({
  ...routes,
  ...(Array.isArray(routes['GET /applications']) ? { 'GET /applications': req => listResponse(routes['GET /applications'], req.path) } : {}),
})

beforeEach(() => localStorage.setItem('kiu_token', 'tok'))

// Karta ichidagi `select` bo'yicha qatorni topish (kartadagi tugmalar uchun)
const card = name => rowWith(screen.getByText(name), 'select')

describe('ApplicationsAdmin', () => {
  it('so\'rov tokenli headers bilan ketadi', async () => {
    const api = mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    expect(api.find('GET', '/applications')[0].headers.Authorization).toBe('Bearer tok')
  })

  // 6.23: sarlavhadagi "(2)" matni taxtada alohida hisoblagich pill'iga o'tdi (sarlavha matni toza)
  it('admission: type yo\'q (eski) yozuvlar ham ko\'rinadi, vacancy yashiriladi', async () => {
    mockApi({ 'GET /applications': A })
    const { container } = render(<ApplicationsAdmin />)
    expect(await screen.findByText('Ali Valiyev')).toBeInTheDocument()
    expect(screen.getByText('Vali Aliyev')).toBeInTheDocument()
    expect(screen.queryByText('Nodira Karimova')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Qabul arizalari' })).toBeInTheDocument()
    expect(container.querySelector('.adm-count-pill')).toHaveTextContent('Jami: 2')
  })

  it('vacancy: faqat vakansiya arizalari, lavozim ko\'rsatiladi', async () => {
    mockApi({ 'GET /applications': A })
    const { container } = render(<ApplicationsAdmin type="vacancy" />)
    expect(await screen.findByText('Nodira Karimova')).toBeInTheDocument()
    expect(screen.getByText('Dotsent')).toBeInTheDocument()
    expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Vakansiya arizalari' })).toBeInTheDocument()
    expect(container.querySelector('.adm-count-pill')).toHaveTextContent('Jami: 1')
  })

  // 6.23: «Ariza yo'q» ikkiga bo'lindi — hali ariza kelmagan va tanlangan holatda ariza yo'q
  it('bo\'sh ro\'yxat — "Hali ariza kelmagan"', async () => {
    mockApi({ 'GET /applications': [] })
    render(<ApplicationsAdmin />)
    expect(await screen.findByText('Hali ariza kelmagan')).toBeInTheDocument()
    expect(screen.getByText(/Abituriyentlar sayt orqali ariza yuborganda/)).toBeInTheDocument()
  })

  it('vacancy bo\'sh ro\'yxat — nomzodlar haqida matn', async () => {
    mockApi({ 'GET /applications': [] })
    render(<ApplicationsAdmin type="vacancy" />)
    expect(await screen.findByText('Hali ariza kelmagan')).toBeInTheDocument()
    expect(screen.getByText(/Nomzodlar sayt orqali ariza yuborganda/)).toBeInTheDocument()
  })

  // 6.23: avval xato jim «Ariza yo'q» ko'rsatardi (admin 401 ni "ariza yo'q" deb o'ylardi) — endi xato holati
  it('server xatosi (401) — jim bo\'sh ro\'yxat emas, xato va «Qayta urinish»; hisoblagichlar «–»', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockApi({ 'GET /applications': { status: 401, body: { error: 'Ruxsat yo\'q' } } })
    const { container } = render(<ApplicationsAdmin />)
    expect(await screen.findByRole('alert')).toHaveTextContent("Arizalarni yuklab bo'lmadi.")
    expect(screen.getByRole('button', { name: 'Qayta urinish' })).toBeInTheDocument()
    expect(screen.queryByText('Hali ariza kelmagan')).not.toBeInTheDocument()
    expect(container.querySelector('.adm-count-pill')).toBeNull()
    expect([...container.querySelectorAll('.adm-chip-count')].map(c => c.textContent)).toEqual(['–', '–', '–', '–', '–'])
    spy.mockRestore()
  })

  it('massiv bo\'lmagan 200 javob ham xato holati (bo\'sh ro\'yxat deb ko\'rsatilmaydi)', async () => {
    mockApi({ 'GET /applications': { message: 'proxy sahifasi' } })
    render(<ApplicationsAdmin />)
    expect(await screen.findByRole('alert')).toHaveTextContent("Arizalarni yuklab bo'lmadi.")
  })

  it('tarmoq xatosi — xato holati, yuklanmoqda yo\'qoladi', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    render(<ApplicationsAdmin />)
    expect(await screen.findByRole('alert')).toHaveTextContent("Arizalarni yuklab bo'lmadi.")
    expect(screen.queryByText('Yuklanmoqda...')).not.toBeInTheDocument()
    spy.mockRestore()
  })

  it('«Qayta urinish» so\'rovni qaytadan yuboradi: xato → skelet → ro\'yxat', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let calls = 0
    vi.stubGlobal('fetch', vi.fn(() => {
      calls += 1
      return calls === 1
        ? Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({ error: 'Baza xatosi' }) })
        : Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(listResponse(A, '/applications?type=admission&page=1&limit=20')) })
    }))
    const user = userEvent.setup()
    const { container } = render(<ApplicationsAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Qayta urinish' }))
    expect(await screen.findByText('Ali Valiyev')).toBeInTheDocument()
    expect(calls).toBe(2)
    expect(screen.queryByRole('button', { name: 'Qayta urinish' })).not.toBeInTheDocument()
    expect(container.querySelector('.adm-count-pill')).toHaveTextContent('Jami: 2')
    spy.mockRestore()
  })

  it('yuklanayotganda skelet (`aria-busy`), kartalar yo\'q', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { container } = render(<ApplicationsAdmin />)
    const skel = container.querySelector('[aria-busy="true"]')
    expect(skel).not.toBeNull()
    expect(skel).toHaveTextContent('Yuklanmoqda...')
    expect(container.querySelectorAll('.adm-skel').length).toBeGreaterThan(0)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  // 6.23: hisoblagich chip ichidagi alohida pill'ga o'tdi → accessible name "Barchasi 2" (avval "Barchasi (2)")
  it('status filtri, hisoblagichlar va `aria-pressed`', async () => {
    mockApi({ 'GET /applications': A })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    expect(screen.getByRole('button', { name: 'Barchasi 2' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Qabul qilindi 1' })).toHaveAttribute('aria-pressed', 'false')
    await user.click(screen.getByRole('button', { name: 'Qabul qilindi 1' }))
    expect(screen.getByRole('button', { name: 'Qabul qilindi 1' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Barchasi 2' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument()
    expect(screen.getByText('Vali Aliyev')).toBeInTheDocument()
  })

  it('tanlangan holatda ariza yo\'q — «Barchasi» tugmasi filtrni tozalaydi', async () => {
    mockApi({ 'GET /applications': A })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    await user.click(screen.getByRole('button', { name: "Rad etildi 0" }))
    expect(screen.getByText("Bu holatda ariza yo'q")).toBeInTheDocument()
    expect(screen.getByText('Boshqa holatni tanlang yoki filtrni tozalang.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Barchasi', exact: true }))
    expect(screen.getByText('Ali Valiyev')).toBeInTheDocument()
    expect(screen.queryByText("Bu holatda ariza yo'q")).not.toBeInTheDocument()
  })

  it('status o\'zgartirish: PUT {status} va ro\'yxat yangilanadi', async () => {
    const api = mockApi({ 'GET /applications': A, 'PUT /applications/a1': { ...A[0], status: 'rejected' } })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    const row = rowWith(await screen.findByText('Ali Valiyev'), 'select')
    await user.selectOptions(within(row).getByRole('combobox'), 'rejected')
    await waitFor(() => expect(within(card('Ali Valiyev')).getByRole('combobox')).toHaveValue('rejected'))
    const [c] = api.find('PUT', '/applications/a1')
    expect(JSON.parse(c.body)).toEqual({ status: 'rejected' })
    expect(c.headers.Authorization).toBe('Bearer tok')
    // hisoblagichlar yangilangan ma'lumotdan qayta hisoblanadi
    expect(screen.getByRole('button', { name: 'Rad etildi 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yangi 0' })).toBeInTheDocument()
  })

  it('status so\'rovi ketayotganda tanlagich o\'chiq (`aria-busy`) va tugagach qaytadi', async () => {
    let finish
    vi.stubGlobal('fetch', vi.fn((url, init = {}) => {
      if (init.method === 'PUT') return new Promise(resolve => { finish = () => resolve({ ok: true, status: 200, json: () => Promise.resolve({ ...A[0], status: 'reviewed' }) }) })
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(listResponse(A, '/applications?type=admission&page=1&limit=20')) })
    }))
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    const select = within(card('Ali Valiyev')).getByRole('combobox')
    await user.selectOptions(select, 'reviewed')
    expect(select).toBeDisabled()
    expect(select).toHaveAttribute('aria-busy', 'true')
    finish()
    await waitFor(() => expect(select).toBeEnabled())
    expect(select).not.toHaveAttribute('aria-busy')
    expect(select).toHaveValue('reviewed')
  })

  // 6.23: window.confirm o'rniga ilovaning o'z dialogi (`role="alertdialog"`)
  it('o\'chirish: dialog orqali tasdiq', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    const api = mockApi({ 'GET /applications': A, 'DELETE /applications/a1': { success: true } })
    const user = userEvent.setup()
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    await user.click(within(card('Ali Valiyev')).getByRole('button', { name: /O'chir/ }))
    const dialog = screen.getByRole('alertdialog', { name: "Arizani o'chirishni tasdiqlaysizmi?" })
    expect(dialog).toHaveTextContent("Ali Valiyev arizasi butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.")
    expect(api.find('DELETE', '/applications/a1')).toHaveLength(0)   // tasdiqlamaguncha so'rov yo'q
    await user.click(within(dialog).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(container.textContent).not.toContain('Ali Valiyev')
    expect(api.find('DELETE', '/applications/a1')).toHaveLength(1)
    expect(api.find('DELETE', '/applications/a1')[0].headers.Authorization).toBe('Bearer tok')
    expect(confirmSpy).not.toHaveBeenCalled()
    // o'chirilgach fokus sahifa sarlavhasiga o'tadi (uni ochgan tugma yo'qoldi)
    expect(screen.getByRole('heading', { name: 'Qabul arizalari' })).toHaveFocus()
  })

  it('o\'chirish: «Bekor qilish» so\'rov yubormaydi, ariza qoladi, fokus tugmaga qaytadi', async () => {
    const api = mockApi({ 'GET /applications': A })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    const del = within(card('Ali Valiyev')).getByRole('button', { name: /O'chir/ })
    await user.click(del)
    expect(screen.getByRole('button', { name: 'Bekor qilish' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('Ali Valiyev')).toBeInTheDocument()
    expect(api.find('DELETE', '/applications/a1')).toHaveLength(0)
    expect(del).toHaveFocus()
  })

  it('o\'chirish dialogi Esc bilan yopiladi', async () => {
    const api = mockApi({ 'GET /applications': A })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    await user.click(within(card('Ali Valiyev')).getByRole('button', { name: /O'chir/ }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(api.find('DELETE', '/applications/a1')).toHaveLength(0)
  })

  // 6.23: avval alert() — endi kartalar tepasida `role="alert"` banner, yopish tugmasi bilan
  it('status PUT xato (403) — ariza o\'z joyida qoladi, banner ko\'rsatiladi va yopiladi', async () => {
    mockApi({ 'GET /applications': A, 'PUT /applications/a1': { status: 403, body: { error: 'Ruxsat yo\'q' } } })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    const row = rowWith(await screen.findByText('Ali Valiyev'), 'select')
    await user.selectOptions(within(row).getByRole('combobox'), 'rejected')
    expect(await screen.findByRole('alert')).toHaveTextContent("Ruxsat yo'q")
    expect(within(card('Ali Valiyev')).getByRole('combobox')).toHaveValue('new')
    await user.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('status PUT tarmoq xatosi — qulamaydi, banner', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'PUT' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve(listResponse(A, '/applications?type=admission&page=1&limit=20')) }))))
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    const row = rowWith(await screen.findByText('Ali Valiyev'), 'select')
    await user.selectOptions(within(row).getByRole('combobox'), 'rejected')
    expect(await screen.findByRole('alert')).toHaveTextContent("Server bilan bog'lanib bo'lmadi.")
    expect(screen.getByText('Ali Valiyev')).toBeInTheDocument()
  })

  it("DELETE 404 (boshqa admin allaqachon o'chirgan) — ariza ro'yxatdan ketadi, xato banneri yo'q", async () => {
    mockApi({ 'GET /applications': A, 'DELETE /applications/a1': { status: 404, body: { error: 'Topilmadi' } } })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    await user.click(within(card('Ali Valiyev')).getByRole('button', { name: /O'chir/ }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('DELETE xato (500) — ariza ro\'yxatda qoladi, dialog yopiladi va banner ko\'rsatiladi', async () => {
    mockApi({ 'GET /applications': A, 'DELETE /applications/a1': { status: 500, body: { error: 'Baza xatosi' } } })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    await user.click(within(card('Ali Valiyev')).getByRole('button', { name: /O'chir/ }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Baza xatosi')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('Ali Valiyev')).toBeInTheDocument()
  })

  it("holat badge'i status token klassida (new → info, reviewed → warning, accepted → success), tanlagich `data-status` bilan", async () => {
    mockApi({ 'GET /applications': [...A, { _id: 'a4', name: 'Rad Etilgan', phone: '+998904444444', status: 'rejected' }].filter(a => a.type !== 'vacancy') })
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    const badges = [...container.querySelectorAll('.adm-app-head .badge')].map(b => [b.textContent, [...b.classList].find(c => c.startsWith('badge-'))])
    expect(badges).toEqual([['Yangi', 'badge-info'], ['Qabul qilindi', 'badge-success'], ['Rad etildi', 'badge-danger']])
    expect([...container.querySelectorAll('select')].map(s => s.dataset.status)).toEqual(['new', 'accepted', 'rejected'])
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it("holat badge'ida ikonka bor (rang yolg'iz emas): har holat o'z ikonkasi bilan", async () => {
    mockApi({ 'GET /applications': [
      { _id: 'n', name: 'Nigora', phone: '1', status: 'new' }, { _id: 'r', name: 'Rustam', phone: '2', status: 'reviewed' },
      { _id: 'a', name: 'Aziza', phone: '3', status: 'accepted' }, { _id: 'x', name: 'Xurshid', phone: '4', status: 'rejected' },
    ] })
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Nigora')
    const icons = [...container.querySelectorAll('.adm-app-head .badge')].map(b => b.querySelector('svg'))
    expect(icons.every(Boolean)).toBe(true)
    // to'rt xil ikonka (bir xil emas)
    expect(new Set(icons.map(i => i.innerHTML)).size).toBe(4)
  })

  it("noma'lum holat badge'i qulamaydi (klass qo'shilmaydi)", async () => {
    mockApi({ 'GET /applications': [{ _id: 'x', name: 'Noma\'lum', phone: '1', status: 'archived' }] })
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText("Noma'lum")
    expect(container.querySelector('.adm-app-head .badge').className.trim()).toBe('badge')
  })

  it("filtr chip'i faol holati `data-active` orqali (inline stil emas)", async () => {
    mockApi({ 'GET /applications': A })
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    const chips = () => [...container.querySelectorAll('.adm-chip')].map(c => c.dataset.active)
    expect(chips()).toEqual(['true', 'false', 'false', 'false', 'false'])
    await userEvent.click(screen.getByRole('button', { name: /^Yangi/ }))
    expect(chips()).toEqual(['false', 'true', 'false', 'false', 'false'])
  })

  it("holat chip'ida nuqta `data-status` bilan (Barchasi'da nuqta yo'q)", async () => {
    mockApi({ 'GET /applications': A })
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    const chips = [...container.querySelectorAll('.adm-chip')]
    expect(chips.map(c => c.dataset.status)).toEqual([undefined, 'new', 'reviewed', 'accepted', 'rejected'])
    expect(chips.map(c => !!c.querySelector('.adm-chip-dot'))).toEqual([false, true, true, true, true])
  })

  it("holat tanlagichi ariza egasi nomi bilan nomlangan (axe select-name)", async () => {
    mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    expect(screen.getByRole('combobox', { name: 'Ali Valiyev: ariza holati' })).toBeInTheDocument()
    for (const sel of screen.getAllByRole('combobox')) expect(sel).toHaveAccessibleName(/: ariza holati$/)
  })

  it("tanlagich variantlari to'liq nomlar bilan (Qabul qilindi, Rad etildi)", async () => {
    mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    const select = screen.getAllByRole('combobox')[0]
    expect([...select.options].map(o => [o.value, o.textContent])).toEqual([
      ['new', 'Yangi'], ['reviewed', "Ko'rildi"], ['accepted', 'Qabul qilindi'], ['rejected', 'Rad etildi'],
    ])
  })

  it("o'chirish tugmasi ariza egasi nomi bilan nomlangan (ko'rinadigan matn nomning boshida)", async () => {
    mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    expect(screen.getByRole('button', { name: "O'chirish: Ali Valiyev" })).toHaveTextContent("O'chirish")
  })

  it('email faqat vakansiya kartasida (qabul formasida email maydoni yo\'q)', async () => {
    const data = [
      { _id: 'q', name: 'Qabul Kishi', phone: '1', status: 'new', type: 'admission', email: 'qabul@x.uz' },
      { _id: 'v', name: 'Vakansiya Kishi', phone: '2', status: 'new', type: 'vacancy', email: 'vak@x.uz' },
    ]
    mockApi({ 'GET /applications': data })
    const { unmount } = render(<ApplicationsAdmin />)
    await screen.findByText('Qabul Kishi')
    expect(screen.queryByText('qabul@x.uz')).not.toBeInTheDocument()
    unmount()
    render(<ApplicationsAdmin type="vacancy" />)
    expect(await screen.findByText('vak@x.uz')).toBeInTheDocument()
  })

  it('vakansiya: lavozim, fakultet, ma\'lumot va tajriba teglari (neytral, ikonkali)', async () => {
    mockApi({ 'GET /applications': [{ _id: 'v', name: 'Dilshod', phone: '1', status: 'new', type: 'vacancy',
      position: 'Dotsent', faculty: 'Iqtisodiyot fakulteti', education: 'Magistr', experience: '5 yil' }] })
    const { container } = render(<ApplicationsAdmin type="vacancy" />)
    await screen.findByText('Dilshod')
    const tags = [...container.querySelectorAll('.adm-tag')]
    expect(tags.map(t => t.textContent)).toEqual(['Dotsent', 'Iqtisodiyot fakulteti', 'Magistr', '5 yil'])
    expect(tags.every(t => t.querySelector('svg'))).toBe(true)
    expect(tags.map(t => t.classList.contains('adm-tag--brand'))).toEqual([true, false, false, false])
  })

  it('qabul: «Yo\'nalish» qatori', async () => {
    mockApi({ 'GET /applications': A })
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    expect(container.querySelector('.adm-app-line')).toHaveTextContent("Yo'nalish: Iqtisodiyot")
  })

  it('avatar: ismning bosh harflari (bir so\'zli, bo\'sh va ortiqcha bo\'shliqli ismlar ham)', async () => {
    mockApi({ 'GET /applications': [
      { _id: '1', name: 'Aziz Karimov', phone: '1', status: 'new' },
      { _id: '2', name: 'madina', phone: '2', status: 'new' },
      { _id: '3', name: '  Jasur   Anvar  Ogli ', phone: '3', status: 'new' },
      { _id: '4', name: '', phone: '4', status: 'new' },
    ] })
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Aziz Karimov')
    expect([...container.querySelectorAll('.adm-app-avatar')].map(a => a.textContent)).toEqual(['AK', 'M', 'JA', '?'])
    expect(container.querySelector('.adm-app-avatar')).toHaveAttribute('aria-hidden', 'true')
  })

  it('ariza sanasi «DD.MM.YYYY, HH:MM» (locale\'ga bog\'liq emas); noto\'g\'ri sana jim tashlab yuboriladi', async () => {
    mockApi({ 'GET /applications': [
      { _id: '1', name: 'Sanali', phone: '1', status: 'new', createdAt: new Date(2026, 8, 30, 14, 32).toISOString() },
      { _id: '2', name: 'Sanasiz', phone: '2', status: 'new' },
    ] })
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Sanali')
    const dates = [...container.querySelectorAll('.adm-app-date')].map(d => d.textContent)
    expect(dates).toEqual(['30.09.2026, 14:32'])
  })

  it('uzun xabar kesiladi va «To\'liq o\'qish» (`aria-expanded`) bilan to\'liq ochiladi; qisqa xabarda tugma yo\'q', async () => {
    const long = 'Salom! ' + 'x'.repeat(200)
    mockApi({ 'GET /applications': [
      { _id: '1', name: 'Uzun', phone: '1', status: 'new', message: long },
      { _id: '2', name: 'Qisqa', phone: '2', status: 'new', message: 'Rahmat' },
    ] })
    const user = userEvent.setup()
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Uzun')
    expect(container.querySelectorAll('.adm-app-more')).toHaveLength(1)
    const msg = container.querySelector('.adm-app-msg-text')
    expect(msg.textContent).toBe(`${long.slice(0, 120)}...`)
    const more = screen.getByRole('button', { name: "To'liq o'qish" })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    await user.click(more)
    expect(msg.textContent).toBe(long)
    const less = screen.getByRole('button', { name: "Yig'ish" })
    expect(less).toHaveAttribute('aria-expanded', 'true')
    await user.click(less)
    expect(msg.textContent).toBe(`${long.slice(0, 120)}...`)
  })

  it("xabardagi HTML matn sifatida chiqadi (ommaviy forma yuboradi) — element yaratilmaydi", async () => {
    mockApi({ 'GET /applications': [{ _id: '1', name: 'Xurshid', phone: '1', status: 'new', message: '<img src=x onerror=alert(1)><b>qalin</b>' }] })
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Xurshid')
    expect(container.querySelector('.adm-app-msg img, .adm-app-msg b')).toBeNull()
    expect(container.querySelector('.adm-app-msg-text').textContent).toBe('<img src=x onerror=alert(1)><b>qalin</b>')
  })
})

// ── 4.4: filtr, sahifalash va sanoqlar SERVERDA ──
describe('ApplicationsAdmin — server tomonida filtr va sahifalash (4.4)', () => {
  const many = n => Array.from({ length: n }, (_, i) => ({
    _id: `p${i}`, name: `Abituriyent ${i}`, phone: '+998901111111', status: i % 3 === 0 ? 'accepted' : 'new', type: 'admission',
  }))
  const paths = api => api.find('GET', '/applications').map(c => c.path)

  it('birinchi so\'rov: type, page=1, limit=20; status yo\'q (hamma ariza bir so\'rovda kelmaydi)', async () => {
    const api = mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    expect(paths(api)).toEqual(['/applications?type=admission&page=1&limit=20'])
  })

  it('vakansiya sahifasi type=vacancy so\'raydi', async () => {
    const api = mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin type="vacancy" />)
    await screen.findByText('Nodira Karimova')
    expect(paths(api)).toEqual(['/applications?type=vacancy&page=1&limit=20'])
  })

  it('status chip\'i serverdan filtrlaydi (klientda emas): status=accepted so\'rovi ketadi, sanoqlar o\'zgarmaydi', async () => {
    const api = mockApi({ 'GET /applications': A })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    await user.click(screen.getByRole('button', { name: 'Qabul qilindi 1' }))
    await screen.findByText('Vali Aliyev')
    expect(paths(api)).toEqual([
      '/applications?type=admission&page=1&limit=20',
      '/applications?type=admission&page=1&limit=20&status=accepted',
    ])
    expect(screen.getByRole('button', { name: 'Barchasi 2' })).toBeInTheDocument()
  })

  it('filtr almashganda yangi javob kelguncha sanoqlar «–» bo\'lib qolmaydi (skelet faqat ro\'yxat o\'rnida)', async () => {
    const held = new Promise(() => {})
    mockApi({ 'GET /applications': req => (req.path.includes('status=') ? held : listResponse(A, req.path)) })
    const user = userEvent.setup()
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    await user.click(screen.getByRole('button', { name: 'Qabul qilindi 1' }))
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect([...container.querySelectorAll('.adm-chip-count')].map(c => c.textContent)).toEqual(['2', '1', '0', '1', '0'])
    expect(container.querySelector('.adm-count-pill')).toHaveTextContent('Jami: 2')
  })

  it('bir sahifaga sig\'sa sahifalash paneli yo\'q', async () => {
    mockApi({ 'GET /applications': many(20) })
    render(<ApplicationsAdmin />)
    await screen.findByText('Abituriyent 0')
    expect(screen.queryByRole('navigation', { name: 'Sahifalar' })).not.toBeInTheDocument()
  })

  it('sahifalash: «Keyingi» page=2 so\'raydi, «Oldingi» birinchi sahifada o\'chiq, oxirgisida «Keyingi» o\'chiq', async () => {
    const api = mockApi({ 'GET /applications': many(45) })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Abituriyent 0')
    expect(screen.getByText('Sahifa 1 / 3')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(20)
    expect(screen.getByRole('button', { name: 'Oldingi' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Keyingi' }))
    await screen.findByText('Abituriyent 20')
    expect(screen.queryByText('Abituriyent 0')).not.toBeInTheDocument()
    expect(screen.getByText('Sahifa 2 / 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Keyingi' }))
    await screen.findByText('Abituriyent 40')
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'Keyingi' })).toBeDisabled()
    expect(paths(api).at(-1)).toBe('/applications?type=admission&page=3&limit=20')

    await user.click(screen.getByRole('button', { name: 'Oldingi' }))
    await screen.findByText('Abituriyent 20')
  })

  it('filtr almashganda 1-sahifaga qaytadi', async () => {
    const api = mockApi({ 'GET /applications': many(45) })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Abituriyent 0')
    await user.click(screen.getByRole('button', { name: 'Keyingi' }))
    await screen.findByText('Abituriyent 20')
    await user.click(screen.getByRole('button', { name: /^Yangi/ }))
    await waitFor(() => expect(paths(api).at(-1)).toBe('/applications?type=admission&page=1&limit=20&status=new'))
  })

  it('sahifa almashganda fokus sarlavhaga o\'tadi (klaviatura foydalanuvchisi yo\'qolmaydi)', async () => {
    mockApi({ 'GET /applications': many(45) })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Abituriyent 0')
    await user.click(screen.getByRole('button', { name: 'Keyingi' }))
    expect(screen.getByRole('heading', { name: 'Qabul arizalari' })).toHaveFocus()
  })

  it('o\'chirish sanoqlarni kamaytiradi', async () => {
    mockApi({ 'GET /applications': A, 'DELETE /applications/a1': { success: true } })
    const user = userEvent.setup()
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    await user.click(within(card('Ali Valiyev')).getByRole('button', { name: /O'chir/ }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument())
    expect([...container.querySelectorAll('.adm-chip-count')].map(c => c.textContent)).toEqual(['1', '0', '0', '1', '0'])
    expect(container.querySelector('.adm-count-pill')).toHaveTextContent('Jami: 1')
  })

  it('2-sahifadagi yagona arizani o\'chirgach 1-sahifaga qaytadi (bo\'sh sahifada qolmaydi)', async () => {
    const api = mockApi({ 'GET /applications': many(21), 'DELETE /applications/p20': { success: true } })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Abituriyent 0')
    await user.click(screen.getByRole('button', { name: 'Keyingi' }))
    await screen.findByText('Abituriyent 20')
    await user.click(within(card('Abituriyent 20')).getByRole('button', { name: /O'chir/ }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(paths(api).at(-1)).toBe('/applications?type=admission&page=1&limit=20'))
  })

  it('holat o\'zgargach sanoqlar yangilanadi; tanlangan filtrga endi mos kelmasa ariza sahifadan ketadi', async () => {
    mockApi({ 'GET /applications': A, 'PUT /applications/a2': { ...A[1], status: 'rejected' } })
    const user = userEvent.setup()
    const { container } = render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    await user.click(screen.getByRole('button', { name: 'Qabul qilindi 1' }))
    await screen.findByText('Vali Aliyev')
    await user.selectOptions(within(card('Vali Aliyev')).getByRole('combobox'), 'rejected')
    await waitFor(() => expect(screen.queryByText('Vali Aliyev')).not.toBeInTheDocument())
    expect([...container.querySelectorAll('.adm-chip-count')].map(c => c.textContent)).toEqual(['2', '1', '0', '0', '1'])
    expect(screen.getByText("Bu holatda ariza yo'q")).toBeInTheDocument()
  })

  it('tur almashganda (Qabul ↔ Vakansiya) filtr va sahifa tozalanadi', async () => {
    const api = mockApi({ 'GET /applications': A })
    const user = userEvent.setup()
    const { rerender } = render(<ApplicationsAdmin type="admission" />)
    await screen.findByText('Ali Valiyev')
    await user.click(screen.getByRole('button', { name: 'Qabul qilindi 1' }))
    await screen.findByText('Vali Aliyev')
    rerender(<ApplicationsAdmin type="vacancy" />)
    await screen.findByText('Nodira Karimova')
    expect(paths(api).at(-1)).toBe('/applications?type=vacancy&page=1&limit=20')
    expect(screen.getByRole('button', { name: /^Barchasi/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('eski massiv formati (backend hali yangilanmagan) jim bo\'sh ro\'yxat emas, xato holati', async () => {
    baseMockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin />)
    expect(await screen.findByRole('alert')).toHaveTextContent("Arizalarni yuklab bo'lmadi.")
  })
})
