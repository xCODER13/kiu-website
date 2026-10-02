import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventsAdmin from './EventsAdmin'
import { mockApi, rowOf } from '../../test/helpers'

const E1 = { _id: 'e1', title: 'Ochiq eshiklar kuni', desc: 'Tavsif', eventDate: '2026-05-12T00:00:00.000Z', type: 'open', image: 'https://s/e1.jpg' }
const png = () => new File(['x'], 'e.png', { type: 'image/png' })

beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  URL.createObjectURL = vi.fn(() => 'blob:x'); URL.revokeObjectURL = vi.fn()
  localStorage.setItem('kiu_token', 'tok')
})

describe('EventsAdmin', () => {
  it('ro\'yxat yuklanadi; bo\'sh bo\'lsa "Hali tadbir yo\'q"', async () => {
    mockApi({ 'GET /events': [] })
    render(<EventsAdmin />)
    expect(await screen.findByText("Hali tadbir yo'q")).toBeInTheDocument()
    expect(screen.getByText('Tadbirlar (0)')).toBeInTheDocument()
  })

  it('validatsiya: sarlavha va sana majburiy', async () => {
    const api = mockApi({ 'GET /events': [] })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    expect(alert).toHaveBeenCalledWith('Sarlavha va sana kiritilishi shart!')
    expect(api.find('POST', '/events')).toHaveLength(0)
  })

  it('yaratish: FormData maydonlari va rasm fayli, ro\'yxat boshiga qo\'shiladi', async () => {
    const created = { _id: 'e2', title: 'Yangi tadbir', eventDate: '2026-06-05', type: 'general' }
    const api = mockApi({ 'GET /events': [E1], 'POST /events': created })
    const user = userEvent.setup()
    const { container } = render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    await user.click(screen.getByRole('button', { name: /Yangi/ }))
    const inputs = container.querySelectorAll('input:not([type=file])')
    await user.type(inputs[0], 'Yangi tadbir')
    fireEvent.change(inputs[1], { target: { value: '2026-06-05' } })
    await user.upload(container.querySelector('input[type=file]'), png())
    await user.click(screen.getByRole('button', { name: /Qo'shish/ }))
    await screen.findByText('Yangi tadbir', { selector: 'div' })
    const [c] = api.find('POST', '/events')
    expect(c.body.get('title')).toBe('Yangi tadbir')
    expect(c.body.get('eventDate')).toBe('2026-06-05')
    expect(c.body.get('type')).toBe('general')
    expect(c.body.get('imageFile').name).toBe('e.png')
    expect(c.headers).toEqual({ Authorization: 'Bearer tok' })
  })

  it('sana tanlagich: tahrirlashda mavjud sana to\'g\'ridan-to\'g\'ri ko\'rsatiladi, o\'zgartirilsa xuddi shu ISO qiymat yuboriladi', async () => {
    const api = mockApi({ 'GET /events': [E1], 'PUT /events/e1': { ...E1, eventDate: '2026-10-03' } })
    const user = userEvent.setup()
    const { container } = render(<EventsAdmin />)
    const row = rowOf(await screen.findByText('Ochiq eshiklar kuni'))
    await user.click(within(row).getAllByRole('button')[0])
    const dateInput = container.querySelector('input[type=date]')
    expect(dateInput.value).toBe('2026-05-12') // E1.eventDate — yil AYNAN saqlangan, taxmin emas
    fireEvent.change(dateInput, { target: { value: '2026-10-03' } })
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    await waitFor(() => expect(api.find('PUT', '/events/e1')).toHaveLength(1))
    const [c] = api.find('PUT', '/events/e1')
    expect(c.body.get('eventDate')).toBe('2026-10-03')
  })

  it('tahrirlash: forma to\'ldiriladi, PUT /events/:id va existingImage yuboriladi', async () => {
    const api = mockApi({ 'GET /events': [E1], 'PUT /events/e1': { ...E1, title: 'Yangilandi' } })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    const row = rowOf(await screen.findByText('Ochiq eshiklar kuni'))
    await user.click(within(row).getAllByRole('button')[0])
    const title = screen.getByDisplayValue('Ochiq eshiklar kuni')
    await user.clear(title); await user.type(title, 'Yangilandi')
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    expect(await screen.findByText('Yangilandi', { selector: 'div' })).toBeInTheDocument()
    const [c] = api.find('PUT', '/events/e1')
    expect(c.body.get('existingImage')).toBe('https://s/e1.jpg')
    expect(c.body.get('imageFile')).toBeNull()
  })

  it('rasmni olib tashlab saqlash — existingImage bo\'sh yuboriladi', async () => {
    const api = mockApi({ 'GET /events': [E1], 'PUT /events/e1': E1 })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    const row = rowOf(await screen.findByText('Ochiq eshiklar kuni'))
    await user.click(within(row).getAllByRole('button')[0])
    await user.click(screen.getByRole('button', { name: 'Rasmni olib tashlash' }))
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    await waitFor(() => expect(api.find('PUT', '/events/e1')).toHaveLength(1))
    expect(api.find('PUT', '/events/e1')[0].body.get('existingImage')).toBe('')
  })

  it('server xatosi — alert, ro\'yxat o\'zgarmaydi', async () => {
    mockApi({ 'GET /events': [E1], 'PUT /events/e1': { status: 400, body: { error: 'Noto\'g\'ri sana' } } })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    const row = rowOf(await screen.findByText('Ochiq eshiklar kuni'))
    await user.click(within(row).getAllByRole('button')[0])
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Noto'g'ri sana"))
    expect(screen.getAllByText('Ochiq eshiklar kuni').length).toBeGreaterThan(0)
  })

  it('o\'chirish: tasdiq → DELETE; bekor → yuborilmaydi', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    const api = mockApi({ 'GET /events': [E1], 'DELETE /events/e1': { success: true } })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    const row = rowOf(await screen.findByText('Ochiq eshiklar kuni'))
    await user.click(within(row).getAllByRole('button').at(-1))
    expect(api.find('DELETE', '/events/e1')).toHaveLength(0)
    await user.click(within(row).getAllByRole('button').at(-1))
    await waitFor(() => expect(screen.queryByText('Ochiq eshiklar kuni')).not.toBeInTheDocument())
    expect(confirm).toHaveBeenCalledTimes(2)
    expect(api.find('DELETE', '/events/e1')[0].headers.Authorization).toBe('Bearer tok')
  })

  it('DELETE 500 — element qoladi, xabar ko\'rsatiladi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockApi({ 'GET /events': [E1], 'DELETE /events/e1': { status: 500, body: { error: 'x xato' } } })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    const row = rowOf(await screen.findByText('Ochiq eshiklar kuni'))
    await user.click(within(row).getAllByRole('button').at(-1))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('x xato'))
    expect(screen.getByText('Ochiq eshiklar kuni')).toBeInTheDocument()
  })

  it('GET /events xato obyekt qaytarsa — qulamaydi', async () => {
    mockApi({ 'GET /events': { status: 500, body: { error: 'x' } } })
    render(<EventsAdmin />)
    expect(await screen.findByText('Tadbirlar (0)')).toBeInTheDocument()
  })

  it('saqlashda tarmoq xatosi — tugma qayta faollashadi', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'PUT' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve([E1]) }))))
    const user = userEvent.setup()
    render(<EventsAdmin />)
    const row = rowOf(await screen.findByText('Ochiq eshiklar kuni'))
    await user.click(within(row).getAllByRole('button')[0])
    await user.click(screen.getByRole('button', { name: /Saqlash/ }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Server bilan bog'lanib bo'lmadi."))
    expect(screen.getByRole('button', { name: /Saqlash/ })).toBeEnabled()
  })

  it("inline stil yo'q; poster rasmi yuklanmasa `data-broken`; rasmsiz tadbirda kun/oy nishoni", async () => {
    mockApi({ 'GET /events': [E1, { _id: 'e2', title: 'Rasmsiz', desc: '', eventDate: '2026-06-03T00:00:00.000Z', type: 'general' }] })
    const { container } = render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    const img = container.querySelector('.adm-row-thumb')
    fireEvent.error(img)
    expect(img.dataset.broken).toBe('true')
    expect(img.getAttribute('style')).toBeNull()
    expect(container.querySelector('.adm-event-day').textContent).toBe('3')
    expect(container.querySelector('.adm-event-month').textContent).toBe('iyun')
  })
})
