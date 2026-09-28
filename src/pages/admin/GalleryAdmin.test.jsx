import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GalleryAdmin from './GalleryAdmin'
import { mockApi, rowOf } from '../../test/helpers'

const G1 = { _id: 'g1', title: '1-kampus', desc: 'Kampus binosi', images: ['https://s/1.jpg', 'https://s/2.jpg'], createdAt: '2026-01-02T00:00:00Z' }
const png = (name = 'a.png') => new File(['x'], name, { type: 'image/png' })

beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  URL.createObjectURL = vi.fn(() => 'blob:x'); URL.revokeObjectURL = vi.fn()
  localStorage.setItem('kiu_token', 'tok')
})

describe('GalleryAdmin', () => {
  it('ro\'yxatni yuklaydi, rasm sonini ko\'rsatadi', async () => {
    mockApi({ 'GET /gallery': [G1] })
    render(<GalleryAdmin />)
    expect(await screen.findByText('1-kampus')).toBeInTheDocument()
    expect(screen.getByText('Kampus binosi')).toBeInTheDocument()
    expect(screen.getByText('2 ta rasm')).toBeInTheDocument()
    expect(screen.getByText('Galereya (1)')).toBeInTheDocument()
  })

  it('bo\'sh ro\'yxat holati', async () => {
    mockApi({ 'GET /gallery': [] })
    render(<GalleryAdmin />)
    expect(await screen.findByText("Hali albom qo'shilmagan")).toBeInTheDocument()
  })

  it('validatsiya: nomsiz saqlab bo\'lmaydi', async () => {
    const api = mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    expect(alert).toHaveBeenCalledWith('Nom kiritilishi shart!')
    expect(api.find('POST', '/gallery')).toHaveLength(0)
  })

  it('validatsiya: rasmsiz saqlab bo\'lmaydi', async () => {
    const api = mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('1-kampus'), 'Yangi albom')
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    expect(alert).toHaveBeenCalledWith('Kamida bitta rasm tanlang!')
    expect(api.find('POST', '/gallery')).toHaveLength(0)
  })

  it('yaratish: multipart FormData, bir nechta rasm, token yuboriladi, ro\'yxat boshiga qo\'shiladi', async () => {
    const created = { _id: 'g9', title: 'Yangi albom', images: ['https://s/new1.jpg', 'https://s/new2.jpg'], createdAt: '2026-02-01T00:00:00Z' }
    const api = mockApi({ 'GET /gallery': [G1], 'POST /gallery': created })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('1-kampus'), 'Yangi albom')
    await user.type(screen.getByPlaceholderText('Kampus binosi'), 'Tavsif matni')
    await user.upload(container.querySelector('input[type=file]'), [png('a.png'), png('b.png')])
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))

    await screen.findByText('Yangi albom', { selector: 'div' })
    const [call] = api.find('POST', '/gallery')
    expect(call.body).toBeInstanceOf(FormData)
    expect(call.headers).toEqual({ Authorization: 'Bearer tok' })
    expect(call.headers['Content-Type']).toBeUndefined()
    expect(call.body.get('title')).toBe('Yangi albom')
    expect(call.body.get('desc')).toBe('Tavsif matni')
    expect(call.body.get('existingImages')).toBe('[]')
    expect(call.body.getAll('imageFiles').map(f => f.name)).toEqual(['a.png', 'b.png'])
    // forma yopiladi
    expect(screen.queryByPlaceholderText('1-kampus')).not.toBeInTheDocument()
  })

  it('tahrirlash: PUT /gallery/:id, mavjud rasm URL lar existingImages da qoladi', async () => {
    const updated = { ...G1, title: 'Tahrirlangan' }
    const api = mockApi({ 'GET /gallery': [G1], 'PUT /gallery/g1': updated })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrir/ }))
    const title = screen.getByPlaceholderText('1-kampus')
    expect(title).toHaveValue('1-kampus')
    await user.clear(title); await user.type(title, 'Tahrirlangan')
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    expect(await screen.findByText('Tahrirlangan', { selector: 'div' })).toBeInTheDocument()
    const [call] = api.find('PUT', '/gallery/g1')
    expect(JSON.parse(call.body.get('existingImages'))).toEqual(['https://s/1.jpg', 'https://s/2.jpg'])
    expect(screen.queryByText('1-kampus')).not.toBeInTheDocument()
  })

  it('tahrirlashda mavjud rasm olib tashlansa — existingImages dan chiqadi', async () => {
    const api = mockApi({ 'GET /gallery': [G1], 'PUT /gallery/g1': G1 })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrir/ }))
    await user.click(screen.getAllByRole('button', { name: 'Rasmni olib tashlash' })[0])
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    await waitFor(() => expect(api.find('PUT', '/gallery/g1')).toHaveLength(1))
    expect(JSON.parse(api.find('PUT', '/gallery/g1')[0].body.get('existingImages'))).toEqual(['https://s/2.jpg'])
  })

  it('server xatosi (ok:false) — alert, forma ochiq qoladi, ro\'yxat o\'zgarmaydi', async () => {
    mockApi({ 'GET /gallery': [G1], 'POST /gallery': { status: 400, body: { error: "Rasm hajmi juda katta" } } })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('1-kampus'), 'X')
    await user.upload(container.querySelector('input[type=file]'), png())
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Rasm hajmi juda katta'))
    expect(screen.getByPlaceholderText('1-kampus')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Qo'shish/ })).toBeEnabled()
  })

  it('o\'chirish: tasdiqlansa DELETE yuboriladi va ro\'yxatdan olinadi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const api = mockApi({ 'GET /gallery': [G1], 'DELETE /gallery/g1': { success: true } })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    const row = rowOf(await screen.findByText('1-kampus'))
    await user.click(within(row).getAllByRole('button').at(-1))
    await waitFor(() => expect(screen.queryByText('1-kampus')).not.toBeInTheDocument())
    expect(api.find('DELETE', '/gallery/g1')[0].headers.Authorization).toBe('Bearer tok')
  })

  it('o\'chirish: bekor qilinsa hech narsa yuborilmaydi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const api = mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    const row = rowOf(await screen.findByText('1-kampus'))
    await user.click(within(row).getAllByRole('button').at(-1))
    expect(api.find('DELETE', '/gallery/g1')).toHaveLength(0)
    expect(screen.getByText('1-kampus')).toBeInTheDocument()
  })

  it('server DELETE ni rad etsa (500) — element qoladi va xabar ko\'rsatiladi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockApi({ 'GET /gallery': [G1], 'DELETE /gallery/g1': { status: 500, body: { error: 'Baza xatosi' } } })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    const row = rowOf(await screen.findByText('1-kampus'))
    await user.click(within(row).getAllByRole('button').at(-1))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Baza xatosi'))
    expect(screen.getByText('1-kampus')).toBeInTheDocument()
  })

  it('XSS: nomdagi HTML matn sifatida ko\'rsatiladi', async () => {
    mockApi({ 'GET /gallery': [{ ...G1, title: '<img src=x onerror=alert(1)>' }] })
    render(<GalleryAdmin />)
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })

  it('GET /gallery xato obyekt ({error}) qaytarsa — qulamaydi, bo\'sh ro\'yxat', async () => {
    mockApi({ 'GET /gallery': { status: 500, body: { error: 'Server xatosi' } } })
    render(<GalleryAdmin />)
    expect(await screen.findByText('Galereya (0)')).toBeInTheDocument()
  })

  it('saqlashda tarmoq xatosi — xabar, tugma qayta faollashadi, forma ochiq', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'POST' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))))
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('1-kampus'), 'Sarlavha')
    await user.upload(container.querySelector('input[type=file]'), png())
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Server bilan bog'lanib bo'lmadi."))
    expect(screen.getByRole('button', { name: /Qo'shish/ })).toBeEnabled()
    expect(screen.getByPlaceholderText('1-kampus')).toHaveValue('Sarlavha')
  })
})