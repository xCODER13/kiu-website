import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplicationsAdmin from './ApplicationsAdmin'
import { mockApi, rowWith } from '../../test/helpers'

const A = [
  { _id: 'a1', name: 'Ali Valiyev', phone: '+998901111111', faculty: 'Iqtisodiyot', status: 'new', type: 'admission' },
  { _id: 'a2', name: 'Vali Aliyev', phone: '+998902222222', status: 'accepted' },              // eski yozuv: type yo'q → admission
  { _id: 'a3', name: 'Nodira Karimova', phone: '+998903333333', status: 'reviewed', type: 'vacancy', position: 'Dotsent', faculty: 'IT' },
]
beforeEach(() => localStorage.setItem('kiu_token', 'tok'))

describe('ApplicationsAdmin', () => {
  it('so\'rov tokenli headers bilan ketadi', async () => {
    const api = mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    expect(api.find('GET', '/applications')[0].headers.Authorization).toBe('Bearer tok')
  })

  it('admission: type yo\'q (eski) yozuvlar ham ko\'rinadi, vacancy yashiriladi', async () => {
    mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin />)
    expect(await screen.findByText('Ali Valiyev'), 'select').toBeInTheDocument()
    expect(screen.getByText('Vali Aliyev')).toBeInTheDocument()
    expect(screen.queryByText('Nodira Karimova')).not.toBeInTheDocument()
    expect(screen.getByText(/Qabul arizalari \(2\)/)).toBeInTheDocument()
  })

  it('vacancy: faqat vakansiya arizalari, lavozim ko\'rsatiladi', async () => {
    mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin type="vacancy" />)
    expect(await screen.findByText('Nodira Karimova')).toBeInTheDocument()
    expect(screen.getByText('Dotsent')).toBeInTheDocument()
    expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument()
    expect(screen.getByText(/Vakansiya arizalari \(1\)/)).toBeInTheDocument()
  })

  it('bo\'sh ro\'yxat — "Ariza yo\'q"', async () => {
    mockApi({ 'GET /applications': [] })
    render(<ApplicationsAdmin />)
    expect(await screen.findByText("Ariza yo'q")).toBeInTheDocument()
  })

  it('massiv bo\'lmagan javob (xato obyekti) — bo\'sh ro\'yxat, qulamaydi', async () => {
    mockApi({ 'GET /applications': { status: 401, body: { error: 'Ruxsat yo\'q' } } })
    render(<ApplicationsAdmin />)
    expect(await screen.findByText("Ariza yo'q")).toBeInTheDocument()
  })

  it('tarmoq xatosi — bo\'sh ro\'yxat, yuklanmoqda yo\'qoladi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    render(<ApplicationsAdmin />)
    expect(await screen.findByText("Ariza yo'q")).toBeInTheDocument()
    expect(screen.queryByText('Yuklanmoqda...')).not.toBeInTheDocument()
  })

  it('status filtri va hisoblagichlar', async () => {
    mockApi({ 'GET /applications': A })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    expect(screen.getByRole('button', { name: 'Barchasi (2)' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Qabul (1)' }))
    expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument()
    expect(screen.getByText('Vali Aliyev')).toBeInTheDocument()
  })

  it('status o\'zgartirish: PUT {status} va ro\'yxat yangilanadi', async () => {
    const api = mockApi({ 'GET /applications': A, 'PUT /applications/a1': { ...A[0], status: 'rejected' } })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    const row = rowWith(await screen.findByText('Ali Valiyev'), 'select')
    await user.selectOptions(within(row).getByRole('combobox'), 'rejected')
    await waitFor(() => expect(within(rowWith(screen.getByText('Ali Valiyev'), 'select')).getByRole('combobox')).toHaveValue('rejected'))
    const [c] = api.find('PUT', '/applications/a1')
    expect(JSON.parse(c.body)).toEqual({ status: 'rejected' })
    expect(c.headers.Authorization).toBe('Bearer tok')
  })

  it('o\'chirish: tasdiq bilan', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const api = mockApi({ 'GET /applications': A, 'DELETE /applications/a1': { success: true } })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    const row = rowWith(await screen.findByText('Ali Valiyev'), 'select')
    await user.click(within(row).getByRole('button', { name: /O'chir/ }))
    await waitFor(() => expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument())
    expect(api.find('DELETE', '/applications/a1')).toHaveLength(1)
  })

  it('status PUT xato (403) — ariza o\'z joyida qoladi va xabar ko\'rsatiladi', async () => {
    vi.stubGlobal('alert', vi.fn())
    mockApi({ 'GET /applications': A, 'PUT /applications/a1': { status: 403, body: { error: 'Ruxsat yo\'q' } } })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    const row = rowWith(await screen.findByText('Ali Valiyev'), 'select')
    await user.selectOptions(within(row).getByRole('combobox'), 'rejected')
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Ruxsat yo'q"))
    const after = rowWith(screen.getByText('Ali Valiyev'), 'select')
    expect(within(after).getByRole('combobox')).toHaveValue('new')
  })

  it('status PUT tarmoq xatosi — qulamaydi, xabar', async () => {
    vi.stubGlobal('alert', vi.fn())
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'PUT' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve(A) }))))
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    const row = rowWith(await screen.findByText('Ali Valiyev'), 'select')
    await user.selectOptions(within(row).getByRole('combobox'), 'rejected')
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Server bilan bog'lanib bo'lmadi."))
    expect(screen.getByText('Ali Valiyev')).toBeInTheDocument()
  })

  it('DELETE xato (500) — ariza ro\'yxatda qoladi', async () => {
    vi.stubGlobal('alert', vi.fn())
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockApi({ 'GET /applications': A, 'DELETE /applications/a1': { status: 500, body: { error: 'Baza xatosi' } } })
    const user = userEvent.setup()
    render(<ApplicationsAdmin />)
    const row = rowWith(await screen.findByText('Ali Valiyev'), 'select')
    await user.click(within(row).getByRole('button', { name: /O'chir/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Baza xatosi'))
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
    await userEvent.click(screen.getByRole('button', { name: /^Yangi \(/ }))
    expect(chips()).toEqual(['false', 'true', 'false', 'false', 'false'])
  })

  it("holat tanlagichi ariza egasi nomi bilan nomlangan (axe select-name)", async () => {
    mockApi({ 'GET /applications': A })
    render(<ApplicationsAdmin />)
    await screen.findByText('Ali Valiyev')
    expect(screen.getByRole('combobox', { name: 'Ali Valiyev: ariza holati' })).toBeInTheDocument()
    for (const sel of screen.getAllByRole('combobox')) expect(sel).toHaveAccessibleName(/: ariza holati$/)
  })
})
