import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsAdmin from './NewsAdmin'
import { mockApi, rowOf } from '../../test/helpers'

const N1 = { _id: 'n1', title: 'Birinchi yangilik', content: 'Matn', category: 'Sport', createdAt: '2026-01-02T00:00:00Z', image: JSON.stringify(['https://s/1.jpg', 'https://s/2.jpg']) }
const S1 = { _id: 's1', title: 'Shorts video', videoId: 'dQw4w9WgXcQ', createdAt: '2026-01-03T00:00:00Z' }
const png = (name = 'a.png') => new File(['x'], name, { type: 'image/png' })

beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  URL.createObjectURL = vi.fn(() => 'blob:x'); URL.revokeObjectURL = vi.fn()
  localStorage.setItem('kiu_token', 'tok')
})

describe('NewsAdmin', () => {
  it('ro\'yxatni yuklaydi; yangiliklar va shorts alohida', async () => {
    mockApi({ 'GET /news': [N1, S1] })
    render(<NewsAdmin />)
    expect(await screen.findByText('Birinchi yangilik')).toBeInTheDocument()
    expect(screen.getByText('Shorts video')).toBeInTheDocument()
    expect(screen.getByText('Yangiliklar (2)')).toBeInTheDocument()
  })

  it('validatsiya: sarlavhasiz saqlab bo\'lmaydi', async () => {
    const api = mockApi({ 'GET /news': [] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    expect(alert).toHaveBeenCalledWith('Sarlavha kiritilishi shart!')
    expect(api.find('POST', '/news')).toHaveLength(0)
  })

  it('validatsiya: yaroqsiz Shorts URL rad etiladi', async () => {
    const api = mockApi({ 'GET /news': [] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('Yangilik sarlavhasi'), 'Sarlavha')
    await user.type(screen.getByPlaceholderText(/youtube.com\/shorts/), 'https://evil.com/x')
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('YouTube Shorts URL'))
    expect(api.find('POST', '/news')).toHaveLength(0)
  })

  it('yaratish: multipart FormData, Content-Type qo\'lda qo\'yilmaydi, token yuboriladi, ro\'yxat boshiga qo\'shiladi', async () => {
    const created = { _id: 'n9', title: 'Yangi sarlavha', createdAt: '2026-02-01T00:00:00Z' }
    const api = mockApi({ 'GET /news': [N1], 'POST /news': created })
    const user = userEvent.setup()
    const { container } = render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('Yangilik sarlavhasi'), 'Yangi sarlavha')
    await user.upload(container.querySelector('input[type=file]'), [png('a.png'), png('b.png')])
    await user.type(screen.getByPlaceholderText(/youtube.com\/shorts/), 'https://youtube.com/shorts/dQw4w9WgXcQ')
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))

    await screen.findByText('Yangi sarlavha', { selector: 'div' })
    const [call] = api.find('POST', '/news')
    expect(call.body).toBeInstanceOf(FormData)
    expect(call.headers).toEqual({ Authorization: 'Bearer tok' })
    expect(call.headers['Content-Type']).toBeUndefined()
    expect(call.body.get('title')).toBe('Yangi sarlavha')
    expect(call.body.get('videoId')).toBe('dQw4w9WgXcQ')
    expect(call.body.get('existingImages')).toBe('[]')
    expect(call.body.getAll('imageFiles').map(f => f.name)).toEqual(['a.png', 'b.png'])
    // forma yopiladi
    expect(screen.queryByPlaceholderText('Yangilik sarlavhasi')).not.toBeInTheDocument()
  })

  it('tahrirlash: PUT /news/:id, mavjud URL lar existingImages da qoladi, ro\'yxat yangilanadi', async () => {
    const updated = { ...N1, title: 'Tahrirlangan' }
    const api = mockApi({ 'GET /news': [N1], 'PUT /news/n1': updated })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrir/ }))
    const title = screen.getByPlaceholderText('Yangilik sarlavhasi')
    expect(title).toHaveValue('Birinchi yangilik')
    await user.clear(title); await user.type(title, 'Tahrirlangan')
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    expect(await screen.findByText('Tahrirlangan', { selector: 'div' })).toBeInTheDocument()
    const [call] = api.find('PUT', '/news/n1')
    expect(JSON.parse(call.body.get('existingImages'))).toEqual(['https://s/1.jpg', 'https://s/2.jpg'])
    expect(screen.queryByText('Birinchi yangilik')).not.toBeInTheDocument()
  })

  it('tahrirlashda mavjud rasm olib tashlansa — existingImages dan chiqadi', async () => {
    const api = mockApi({ 'GET /news': [N1], 'PUT /news/n1': N1 })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrir/ }))
    await user.click(screen.getAllByRole('button', { name: 'Rasmni olib tashlash' })[0])
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    await waitFor(() => expect(api.find('PUT', '/news/n1')).toHaveLength(1))
    expect(JSON.parse(api.find('PUT', '/news/n1')[0].body.get('existingImages'))).toEqual(['https://s/2.jpg'])
  })

  it('server xatosi (ok:false) — alert, forma ochiq qoladi, ro\'yxat o\'zgarmaydi', async () => {
    mockApi({ 'GET /news': [N1], 'POST /news': { status: 400, body: { error: 'Rasm turi noto\'g\'ri' } } })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('Yangilik sarlavhasi'), 'X')
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Rasm turi noto'g'ri"))
    expect(screen.getByPlaceholderText('Yangilik sarlavhasi')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Qo'shish/ })).toBeEnabled()
  })

  it('o\'chirish: tasdiqlansa DELETE yuboriladi va ro\'yxatdan olinadi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const api = mockApi({ 'GET /news': [N1, S1], 'DELETE /news/n1': { success: true } })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    const row = rowOf(await screen.findByText('Birinchi yangilik'))
    await user.click(within(row).getAllByRole('button').at(-1))
    await waitFor(() => expect(screen.queryByText('Birinchi yangilik')).not.toBeInTheDocument())
    expect(api.find('DELETE', '/news/n1')[0].headers.Authorization).toBe('Bearer tok')
  })

  it('o\'chirish: bekor qilinsa hech narsa yuborilmaydi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const api = mockApi({ 'GET /news': [N1] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    const row = rowOf(await screen.findByText('Birinchi yangilik'))
    await user.click(within(row).getAllByRole('button').at(-1))
    expect(api.find('DELETE', '/news/n1')).toHaveLength(0)
    expect(screen.getByText('Birinchi yangilik')).toBeInTheDocument()
  })

  it('XSS: sarlavhadagi HTML matn sifatida ko\'rsatiladi', async () => {
    mockApi({ 'GET /news': [{ ...N1, title: '<img src=x onerror=alert(1)>' }] })
    render(<NewsAdmin />)
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })

  it('server DELETE ni rad etsa (500) — element qoladi va xabar ko\'rsatiladi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockApi({ 'GET /news': [N1], 'DELETE /news/n1': { status: 500, body: { error: 'Baza xatosi' } } })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    const row = rowOf(await screen.findByText('Birinchi yangilik'))
    await user.click(within(row).getAllByRole('button').at(-1))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Baza xatosi'))
    expect(screen.getByText('Birinchi yangilik')).toBeInTheDocument()
  })

  it('DELETE tarmoq xatosi — element qoladi, xabar ko\'rsatiladi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.stubGlobal('fetch', vi.fn(u => (String(u).endsWith('/news') ? Promise.resolve({ ok: true, json: () => Promise.resolve([N1]) }) : Promise.reject(new Error('net')))))
    const user = userEvent.setup()
    render(<NewsAdmin />)
    const row = rowOf(await screen.findByText('Birinchi yangilik'))
    await user.click(within(row).getAllByRole('button').at(-1))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Server bilan bog'lanib bo'lmadi."))
    expect(screen.getByText('Birinchi yangilik')).toBeInTheDocument()
  })

  it('GET /news xato obyekt ({error}) qaytarsa — qulamaydi, bo\'sh ro\'yxat', async () => {
    mockApi({ 'GET /news': { status: 500, body: { error: 'Server xatosi' } } })
    render(<NewsAdmin />)
    expect(await screen.findByText('Yangiliklar (0)')).toBeInTheDocument()
  })

  it('saqlashda tarmoq xatosi — xabar, tugma qayta faollashadi (uploading qotib qolmaydi), forma ochiq', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'POST' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))))
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('Yangilik sarlavhasi'), 'Sarlavha')
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Server bilan bog'lanib bo'lmadi."))
    expect(screen.getByRole('button', { name: /Qo'shish/ })).toBeEnabled()
    expect(screen.getByPlaceholderText('Yangilik sarlavhasi')).toHaveValue('Sarlavha')
  })

  it('saqlashda JSON bo\'lmagan xato javob (502) — standart xabar, tugma faol', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'POST'
      ? Promise.resolve({ ok: false, status: 502, json: () => Promise.reject(new SyntaxError('html')) })
      : Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))))
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.type(screen.getByPlaceholderText('Yangilik sarlavhasi'), 'Sarlavha')
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Yangilik saqlanmadi.'))
    expect(screen.getByRole('button', { name: /Qo'shish/ })).toBeEnabled()
  })

  it("inline stil yo'q; rasm preview `data-new`, yuklanmagan rasm `data-broken` (inline opacity emas)", async () => {
    mockApi({ 'GET /news': [N1, S1] })
    const user = userEvent.setup()
    const { container } = render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(container.querySelector('.adm-pill').textContent).toBe('Sport')
    expect(container.querySelector('.adm-pill--youtube').textContent).toBe('Shorts')
    await user.click(screen.getAllByRole('button', { name: /Tahrir/ })[0])
    const imgs = [...container.querySelectorAll('.adm-thumb-img')]
    expect(imgs.map(i => i.dataset.new)).toEqual(['false', 'false'])
    fireEvent.error(imgs[0])
    expect(imgs[0].dataset.broken).toBe('true')
    expect(imgs[0].getAttribute('style')).toBeNull()
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })
})
