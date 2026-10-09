import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SectionsAdmin from './SectionsAdmin'
import { mockApi } from '../../test/helpers'

const C1 = { _id: 'c1', section: 'club', title: 'Debat klubi', desc: 'Haftada bir', link: 'https://t.me/debat', image: 'https://s/c1.jpg', order: 2, createdAt: '2026-01-02T12:00:00Z' }
const C2 = { _id: 'c2', section: 'club', title: 'Shaxmat', desc: '', link: '', image: '', order: 1, createdAt: '2026-01-03T12:00:00Z' }
const S1 = { _id: 's1', section: 'sport', title: 'Futbol chempionligi', desc: '', link: '', image: '', order: 0, createdAt: '2026-01-04T12:00:00Z' }
const png = (name = 'a.png', size = 1000) => { const f = new File(['x'], name, { type: 'image/png' }); Object.defineProperty(f, 'size', { value: size }); return f }

beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  URL.createObjectURL = vi.fn(() => 'blob:x1'); URL.revokeObjectURL = vi.fn()
  localStorage.setItem('kiu_token', 'tok')
})

const openForm = async user => { await user.click(screen.getAllByRole('button', { name: 'Yangi element' })[0]); return screen.getByLabelText(/^Nomi/) }
const rowOf = title => screen.getByRole('heading', { name: title }).closest('li')

describe("SectionsAdmin: ro'yxat", () => {
  it("bo'limlar bo'yicha guruhlanadi, ichida tartib raqami bo'yicha; hisoblagichlar", async () => {
    mockApi({ 'GET /student-life': [S1, C1, C2] })
    render(<SectionsAdmin />)
    await screen.findByRole('heading', { name: 'Debat klubi' })
    const groups = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)
    expect(groups).toEqual(["Klublar va to'garaklar", 'Sport va yutuqlar'])
    // klub ichida: order 1 (Shaxmat) → order 2 (Debat klubi)
    const titles = screen.getAllByRole('heading', { level: 4 }).map(h => h.textContent)
    expect(titles).toEqual(['Shaxmat', 'Debat klubi', 'Futbol chempionligi'])
    expect(screen.getByRole('button', { name: /Hammasi/ })).toHaveTextContent('3')
    expect(screen.getByRole('button', { name: /Klublar/ })).toHaveTextContent('2')
  })

  it("filtr faqat tanlangan bo'limni qoldiradi", async () => {
    const user = userEvent.setup()
    mockApi({ 'GET /student-life': [S1, C1, C2] })
    render(<SectionsAdmin />)
    await screen.findByRole('heading', { name: 'Debat klubi' })
    await user.click(screen.getByRole('button', { name: /Sport va yutuqlar/ }))
    expect(screen.queryByRole('heading', { name: 'Debat klubi' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Futbol chempionligi' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Kampus va yotoqxona/ }))
    expect(screen.getByText("Bu bo'limda element yo'q")).toBeInTheDocument()
  })

  it("bo'sh ro'yxat: bo'sh holat va «Yangi element»", async () => {
    mockApi({ 'GET /student-life': [] })
    render(<SectionsAdmin />)
    expect(await screen.findByText("Hali element yo'q")).toBeInTheDocument()
  })

  it("yuklash xatosi: panel va «Qayta urinish»", async () => {
    mockApi({ 'GET /student-life': { status: 500, body: { error: 'x' } } })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<SectionsAdmin />)
    expect(await screen.findByText("Bo'limlarni yuklab bo'lmadi.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Qayta urinish' })).toBeInTheDocument()
  })
})

describe('SectionsAdmin: forma', () => {
  it("nom bo'sh bo'lsa so'rov ketmaydi", async () => {
    const user = userEvent.setup()
    const api = mockApi({ 'GET /student-life': [C1] })
    render(<SectionsAdmin />)
    await screen.findByText('Debat klubi')
    await openForm(user)
    await user.click(screen.getByRole('button', { name: "Qo'shish" }))
    expect(screen.getByText('Nomini kiriting.')).toBeInTheDocument()
    expect(api.find('POST', '/student-life')).toHaveLength(0)
  })

  it.each([
    ['javascript:alert(1)'], ['http://t.me/x'], ['data:text/html,<b>'], ['https://a b.uz'], ['//evil.uz'],
  ])("havola %s rad etiladi (so'rov ketmaydi)", async link => {
    const user = userEvent.setup()
    const api = mockApi({ 'GET /student-life': [C1] })
    render(<SectionsAdmin />)
    await screen.findByText('Debat klubi')
    const title = await openForm(user)
    await user.type(title, 'Klub')
    await user.type(screen.getByLabelText(/^Havola/), link)
    await user.click(screen.getByRole('button', { name: "Qo'shish" }))
    expect(await screen.findByText(/https:\/\/ bilan boshlanishi kerak/)).toBeInTheDocument()
    expect(api.find('POST', '/student-life')).toHaveLength(0)
  })

  it.each([['-1'], ['1.5'], ['10000'], ['']])("tartib raqami %s rad etiladi", async order => {
    const user = userEvent.setup()
    const api = mockApi({ 'GET /student-life': [C1] })
    render(<SectionsAdmin />)
    await screen.findByText('Debat klubi')
    const title = await openForm(user)
    await user.type(title, 'Klub')
    const o = screen.getByLabelText(/^Tartib raqami/)
    await user.clear(o)
    if (order) await user.type(o, order)
    await user.click(screen.getByRole('button', { name: "Qo'shish" }))
    expect(await screen.findByText(/butun son bo'lsin/)).toBeInTheDocument()
    expect(api.find('POST', '/student-life')).toHaveLength(0)
  })

  it("yangi element: FormData (section, title, order, imageFile) POST qilinadi va ro'yxatga tushadi", async () => {
    const user = userEvent.setup()
    const created = { _id: 'n1', section: 'sport', title: 'Yangi', desc: '', link: 'https://t.me/x', image: 'https://s/n1.jpg', order: 3, createdAt: '2026-02-01T12:00:00Z' }
    const api = mockApi({ 'GET /student-life': [C1], 'POST /student-life': created })
    const { container } = render(<SectionsAdmin />)
    await screen.findByText('Debat klubi')
    const title = await openForm(user)
    await user.selectOptions(screen.getByLabelText(/^Bo'lim/, { selector: 'select' }), 'sport')
    await user.type(title, '  Yangi ')
    await user.type(screen.getByLabelText(/^Havola/), 'https://t.me/x')
    const o = screen.getByLabelText(/^Tartib raqami/)
    await user.clear(o); await user.type(o, '3')
    await user.upload(container.querySelector('input[type=file]'), png())
    await user.click(screen.getByRole('button', { name: "Qo'shish" }))
    expect(await screen.findByRole('heading', { name: 'Yangi' })).toBeInTheDocument()
    const fd = api.find('POST', '/student-life')[0].body
    expect(fd.get('section')).toBe('sport')
    expect(fd.get('title')).toBe('Yangi')
    expect(fd.get('link')).toBe('https://t.me/x')
    expect(fd.get('order')).toBe('3')
    expect(fd.get('imageFile')).toBeInstanceOf(File)
    expect(fd.get('existingImage')).toBe('')
    expect(api.find('POST', '/student-life')[0].headers.Authorization).toBe('Bearer tok')
  })

  it("tahrirlash: mavjud rasm `existingImage` bilan ketadi; rasmni olib tashlash — bo'sh satr", async () => {
    const user = userEvent.setup()
    const api = mockApi({ 'GET /student-life': [C1], 'PUT /student-life/c1': { ...C1, title: 'Debat 2' } })
    render(<SectionsAdmin />)
    await screen.findByText('Debat klubi')
    await user.click(within(rowOf('Debat klubi')).getByRole('button', { name: /Tahrirlash/ }))
    const title = screen.getByLabelText(/^Nomi/)
    expect(title).toHaveValue('Debat klubi')
    await user.clear(title); await user.type(title, 'Debat 2')
    await user.click(screen.getByRole('button', { name: 'Saqlash' }))
    await screen.findByRole('heading', { name: 'Debat 2' })
    expect(api.find('PUT', '/student-life/c1')[0].body.get('existingImage')).toBe('https://s/c1.jpg')

    await user.click(within(rowOf('Debat 2')).getByRole('button', { name: /Tahrirlash/ }))
    await user.click(screen.getByRole('button', { name: 'Rasmni olib tashlash' }))
    await user.click(screen.getByRole('button', { name: 'Saqlash' }))
    await waitFor(() => expect(api.find('PUT', '/student-life/c1')).toHaveLength(2))
    expect(api.find('PUT', '/student-life/c1')[1].body.get('existingImage')).toBe('')
  })

  it("server xatosi: banner, forma va kiritilgan ma'lumot saqlanadi", async () => {
    const user = userEvent.setup()
    mockApi({ 'GET /student-life': [C1], 'POST /student-life': { status: 400, body: { error: 'Havola noto\'g\'ri' } } })
    render(<SectionsAdmin />)
    await screen.findByText('Debat klubi')
    const title = await openForm(user)
    await user.type(title, 'Klub')
    await user.click(screen.getByRole('button', { name: "Qo'shish" }))
    expect(await screen.findByText(/Havola noto'g'ri — kiritilgan ma'lumotlar saqlanib turibdi/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Nomi/)).toHaveValue('Klub')
  })

  it("o'zgargan forma «Bekor qilish»da tasdiq so'raydi", async () => {
    const user = userEvent.setup()
    mockApi({ 'GET /student-life': [C1] })
    render(<SectionsAdmin />)
    await screen.findByText('Debat klubi')
    const title = await openForm(user)
    await user.type(title, 'x')
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.getByText("Saqlanmagan o'zgarishlar bor")).toBeInTheDocument()
  })
})

describe("SectionsAdmin: o'chirish", () => {
  it("tasdiqdan keyin DELETE ketadi va qator yo'qoladi", async () => {
    const user = userEvent.setup()
    const api = mockApi({ 'GET /student-life': [C1, C2], 'DELETE /student-life/c2': { success: true } })
    render(<SectionsAdmin />)
    await screen.findByText('Shaxmat')
    await user.click(within(rowOf('Shaxmat')).getByRole('button', { name: /O'chirish/ }))
    expect(api.find('DELETE', '/student-life/c2')).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Shaxmat' })).not.toBeInTheDocument())
    expect(api.find('DELETE', '/student-life/c2')).toHaveLength(1)
  })

  it("404 (boshqa admin o'chirgan) — qator baribir yo'qoladi", async () => {
    const user = userEvent.setup()
    mockApi({ 'GET /student-life': [C2], 'DELETE /student-life/c2': { status: 404, body: { error: 'Topilmadi' } } })
    render(<SectionsAdmin />)
    await screen.findByText('Shaxmat')
    await user.click(within(rowOf('Shaxmat')).getByRole('button', { name: /O'chirish/ }))
    await user.click(screen.getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Shaxmat' })).not.toBeInTheDocument())
  })
})
