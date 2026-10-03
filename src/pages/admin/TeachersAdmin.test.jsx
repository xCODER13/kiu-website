import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeachersAdmin from './TeachersAdmin'
import { mockApi, rowOf } from '../../test/helpers'

const T1 = { _id: 't1', name: 'Karimov Ali Vali', role: 'Dotsent', dept: 'Aniq fanlar kafedrasi', avatar: 'KA', image: 'https://s/t1.jpg' }

beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  URL.createObjectURL = vi.fn(() => 'blob:x'); URL.revokeObjectURL = vi.fn()
  localStorage.setItem('kiu_token', 'tok')
})

describe('TeachersAdmin', () => {
  it('ro\'yxat, bo\'sh holat', async () => {
    mockApi({ 'GET /teachers': [] })
    render(<TeachersAdmin />)
    expect(await screen.findByText("Hali o'qituvchi qo'shilmagan")).toBeInTheDocument()
  })

  it('kartada ism, lavozim, kafedra; email ko\'rsatilmaydi', async () => {
    mockApi({ 'GET /teachers': [{ ...T1, email: 'ali@kiu.uz' }] })
    render(<TeachersAdmin />)
    expect(await screen.findByText('Karimov Ali Vali')).toBeInTheDocument()
    expect(screen.getByText('Dotsent')).toBeInTheDocument()
    expect(screen.queryByText('ali@kiu.uz')).toBeNull()
  })

  it('rasm yo\'q — avatar harflari yoki ismning bosh 2 harfi (katta harfda)', async () => {
    mockApi({ 'GET /teachers': [{ _id: 'a', name: 'zokir aliyev', role: 'x', dept: 'd' }, { _id: 'b', name: 'Bek', role: 'y', dept: 'd', avatar: 'BK' }] })
    render(<TeachersAdmin />)
    expect(await screen.findByText('ZO')).toBeInTheDocument()
    expect(screen.getByText('BK')).toBeInTheDocument()
  })

  it('validatsiya: ism va lavozim majburiy', async () => {
    const api = mockApi({ 'GET /teachers': [] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    expect(alert).toHaveBeenCalledWith('Ism va lavozim kiritilishi shart!')
    expect(api.find('POST', '/teachers')).toHaveLength(0)
  })

  it('yaratish: FormData va ro\'yxatga qo\'shish', async () => {
    const created = { _id: 't2', name: 'Yangi Ustoz', role: 'Professor', dept: '' }
    const api = mockApi({ 'GET /teachers': [], 'POST /teachers': created })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('Familiya Ism Sharif'), 'Yangi Ustoz')
    await user.type(screen.getByPlaceholderText("O'qituvchi / Dotsent"), 'Professor')
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    expect(await screen.findByText('Yangi Ustoz', { selector: 'div' })).toBeInTheDocument()
    const [c] = api.find('POST', '/teachers')
    expect(c.body.get('name')).toBe('Yangi Ustoz')
    expect(c.body.get('role')).toBe('Professor')
    expect(c.body.get('existingImage')).toBe('')
    expect(c.headers).toEqual({ Authorization: 'Bearer tok' })
  })

  it('avatar maydoni 2 harf bilan cheklangan', async () => {
    mockApi({ 'GET /teachers': [] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    const av = screen.getByPlaceholderText('AB')
    await user.type(av, 'XYZ')
    expect(av).toHaveValue('XY')
  })

  it('tahrirlash: mavjud ma\'lumot to\'ldiriladi, PUT yuboriladi, ro\'yxat yangilanadi', async () => {
    const api = mockApi({ 'GET /teachers': [T1], 'PUT /teachers/t1': { ...T1, role: 'Professor' } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrir/ }))
    expect(screen.getByDisplayValue('Karimov Ali Vali')).toBeInTheDocument()
    const role = screen.getByDisplayValue('Dotsent')
    await user.clear(role); await user.type(role, 'Professor')
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    expect(await screen.findByText('Professor')).toBeInTheDocument()
    expect(api.find('PUT', '/teachers/t1')[0].body.get('existingImage')).toBe('https://s/t1.jpg')
  })

  it('server xatosi — alert', async () => {
    mockApi({ 'GET /teachers': [T1], 'PUT /teachers/t1': { status: 400, body: { error: 'Saqlashda xatolik' } } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrir/ }))
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Saqlashda xatolik'))
  })

  it('o\'chirish (tasdiq bilan)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const api = mockApi({ 'GET /teachers': [T1], 'DELETE /teachers/t1': { success: true } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    const row = rowOf(await screen.findByText('Karimov Ali Vali'))
    await user.click(within(row).getAllByRole('button').at(-1))
    await waitFor(() => expect(screen.queryByText('Karimov Ali Vali')).not.toBeInTheDocument())
    expect(api.find('DELETE', '/teachers/t1')).toHaveLength(1)
  })

  it('DELETE 403 — kartochka qoladi, xabar ko\'rsatiladi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockApi({ 'GET /teachers': [T1], 'DELETE /teachers/t1': { status: 403, body: { error: 'Ruxsat yo\'q' } } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    const row = rowOf(await screen.findByText('Karimov Ali Vali'))
    await user.click(within(row).getAllByRole('button').at(-1))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Ruxsat yo'q"))
    expect(screen.getByText('Karimov Ali Vali')).toBeInTheDocument()
  })

  it('GET /teachers xato obyekt qaytarsa — qulamaydi', async () => {
    mockApi({ 'GET /teachers': { status: 500, body: { error: 'x' } } })
    render(<TeachersAdmin />)
    expect(await screen.findByText("Hali o'qituvchi qo'shilmagan")).toBeInTheDocument()
  })

  it('saqlashda tarmoq xatosi — tugma qayta faollashadi', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'PUT' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve([T1]) }))))
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrir/ }))
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Server bilan bog'lanib bo'lmadi."))
    expect(screen.getByRole('button', { name: /Saqlash/ })).toBeEnabled()
  })

  it("inline faqat avatar foni (indeksdan, 6 ta rang aylanadi); rasm yuklanmasa `data-broken` (avatar harflari CSS bilan yashirinmaydi)", async () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ _id: 't' + i, name: 'Ustoz ' + i, role: 'Dotsent', dept: 'Kafedra', avatar: 'U' + i }))
    mockApi({ 'GET /teachers': [...many, T1] })
    const { container } = render(<TeachersAdmin />)
    await screen.findByText('Karimov Ali Vali')
    const avatars = [...container.querySelectorAll('.adm-avatar')]
    expect(avatars).toHaveLength(8)
    expect(container.querySelectorAll('[style]')).toHaveLength(8)
    expect(avatars.every(a => /^background:/.test(a.getAttribute('style')))).toBe(true)
    expect(avatars[0].style.background).toBe(avatars[6].style.background)
    expect(avatars[0].style.background).not.toBe(avatars[1].style.background)
    const img = container.querySelector('.adm-avatar img')
    fireEvent.error(img)
    expect(img.dataset.broken).toBe('true')
    expect(img.getAttribute('style')).toBeNull()
  })
})
