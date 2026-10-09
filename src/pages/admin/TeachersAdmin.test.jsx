import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeachersAdmin from './TeachersAdmin'
import { mockApi } from '../../test/helpers'

const T1 = { _id: 't1', name: 'Karimov Ali Vali', role: 'Dotsent', dept: 'Aniq fanlar kafedrasi', avatar: 'KA', image: 'https://s/t1.jpg' }
const T2 = { _id: 't2', name: 'Zokirova Odina', role: 'Kattaoʻqituvchi', dept: 'Ijtimoiy fanlar kafedrasi', avatar: '' }
const LEGACY = "Maktabgacha va boshlang'ich ta'lim kafedrasi"
const T3 = { _id: 't3', name: 'Normatova Gulnora', role: 'Dotsent', dept: LEGACY, avatar: '' }
const png = (name = 'a.png', size = 1000) => { const f = new File(['x'], name, { type: 'image/png' }); Object.defineProperty(f, 'size', { value: size }); return f }

let blobN
beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  blobN = 0
  URL.createObjectURL = vi.fn(() => `blob:x${++blobN}`); URL.revokeObjectURL = vi.fn()
  localStorage.setItem('kiu_token', 'tok')
})

const nameInput = () => screen.getByLabelText(/^To'liq ism/)
const roleInput = () => screen.getByLabelText(/^Lavozim/)
const deptSelect = () => screen.getByRole('combobox', { name: 'Kafedra' })
const filterSelect = () => screen.getByRole('combobox', { name: "Kafedra bo'yicha filtr" })
const fileInput = container => container.querySelector('input[type=file]')
// bo'sh ro'yxatda «Yangi o'qituvchi» ikki joyda (sahifa boshi va bo'sh holat) — birinchisi (sahifa boshi)
const openForm = async user => { await user.click(screen.getAllByRole('button', { name: "Yangi o'qituvchi" })[0]); return nameInput() }
const submit = (user, name = /Qo'shish|Saqlash/) => user.click(screen.getByRole('button', { name }))
const cardOf = name => screen.getByRole('heading', { name }).closest('li')

describe("TeachersAdmin: ro'yxat", () => {
  it("sarlavha, soni nishoni; kartada ism, lavozim, kafedra; email ko'rsatilmaydi", async () => {
    mockApi({ 'GET /teachers': [{ ...T1, email: 'ali@kiu.uz' }, T2] })
    render(<TeachersAdmin />)
    expect(await screen.findByRole('heading', { name: 'Karimov Ali Vali' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: "O'qituvchilar" })).toBeInTheDocument()
    expect(screen.getByText("O'qituvchilar soni:").parentElement).toHaveTextContent('2')
    const card = within(cardOf('Karimov Ali Vali'))
    expect(card.getByText('Dotsent')).toBeInTheDocument()
    expect(card.getByText('Aniq fanlar kafedrasi')).toBeInTheDocument()
    expect(screen.queryByText('ali@kiu.uz')).toBeNull()
  })

  it("bo'sh ro'yxat — «Hali o'qituvchi yo'q» holati va tugma; qidiruv qatori yo'q", async () => {
    mockApi({ 'GET /teachers': [] })
    render(<TeachersAdmin />)
    expect(await screen.findByText("Hali o'qituvchi yo'q")).toBeInTheDocument()
    expect(screen.getByText(/Professor-o'qituvchilar/)).toBeInTheDocument()
    expect(screen.queryByRole('search')).toBeNull()
    expect(screen.getAllByRole('button', { name: "Yangi o'qituvchi" })).toHaveLength(2)
  })

  it('yuklanmoqda — skelet (`aria-busy`), hisoblagich «–»', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { container } = render(<TeachersAdmin />)
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.getByText("O'qituvchilar soni:").parentElement).toHaveTextContent('–')
  })

  // 6.27: avval `.catch(() => {})` xatoni yutardi va «Hali o'qituvchi qo'shilmagan» chiqardi; endi xato paneli + «Qayta urinish»
  it("GET xatosi — xato paneli (jim bo'sh ro'yxat emas); «Qayta urinish» qayta yuklaydi", async () => {
    let fail = true
    mockApi({ 'GET /teachers': () => (fail ? { status: 500, body: { error: 'x' } } : [T1]) })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    expect(await screen.findByText("O'qituvchilarni yuklab bo'lmadi.")).toBeInTheDocument()
    expect(screen.queryByText("Hali o'qituvchi yo'q")).toBeNull()
    fail = false
    await user.click(screen.getByRole('button', { name: 'Qayta urinish' }))
    expect(await screen.findByRole('heading', { name: 'Karimov Ali Vali' })).toBeInTheDocument()
  })

  it("avatar: maydondagi harflar yoki ismning bosh 2 harfi (katta harfda); inline stil yo'q", async () => {
    mockApi({ 'GET /teachers': [{ _id: 'a', name: 'zokir aliyev', role: 'x', dept: 'd' }, { _id: 'b', name: 'Bek', role: 'y', dept: 'd', avatar: 'BK' }] })
    const { container } = render(<TeachersAdmin />)
    expect(await screen.findByText('ZO')).toBeInTheDocument()
    expect(screen.getByText('BK')).toBeInTheDocument()
    // 6.27: avval har kartada `colors[]` dagi hardcoded rang inline `style` bilan berilardi — endi hammasi CSS (bitta brend gradienti)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it("foto bor — rasm; yuklanmasa — bosh harflarga qaytadi (doira bo'sh qolmaydi)", async () => {
    mockApi({ 'GET /teachers': [T1] })
    const { container } = render(<TeachersAdmin />)
    await screen.findByRole('heading', { name: 'Karimov Ali Vali' })
    const img = container.querySelector('.adm-avatar img')
    expect(img).toHaveAttribute('src', 'https://s/t1.jpg')
    expect(screen.queryByText('KA')).toBeNull()
    fireEvent.error(img)
    expect(container.querySelector('.adm-avatar img')).toBeNull()
    expect(screen.getByText('KA')).toBeInTheDocument()
  })
})

describe('TeachersAdmin: qidiruv va kafedra filtri', () => {
  it("ism bo'yicha qidiruv (harf katta-kichikligi farq qilmaydi) va «N nafardan M tasi»", async () => {
    mockApi({ 'GET /teachers': [T1, T2] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await screen.findByRole('heading', { name: 'Karimov Ali Vali' })
    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByText('2 nafardan 2 tasi')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: "Ism bo'yicha qidirish" }), '  KARIM ')
    expect(screen.getByRole('heading', { name: 'Karimov Ali Vali' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Zokirova Odina' })).toBeNull()
    expect(screen.getByText('2 nafardan 1 tasi')).toBeInTheDocument()
  })

  it("kafedra filtri: «Barcha kafedralar» + 5 ta kafedra; tanlanganda faqat o'sha kafedra", async () => {
    mockApi({ 'GET /teachers': [T1, T2] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await screen.findByRole('heading', { name: 'Karimov Ali Vali' })
    expect(within(filterSelect()).getAllByRole('option')).toHaveLength(6)
    await user.selectOptions(filterSelect(), 'Ijtimoiy fanlar kafedrasi')
    expect(screen.queryByRole('heading', { name: 'Karimov Ali Vali' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Zokirova Odina' })).toBeInTheDocument()
  })

  it("ro'yxatda yo'q (eski) kafedra ham filtrda ko'rinadi — o'qituvchi filtrdan yo'qolib qolmaydi", async () => {
    mockApi({ 'GET /teachers': [T1, T3] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await screen.findByRole('heading', { name: 'Karimov Ali Vali' })
    expect(within(filterSelect()).getAllByRole('option')).toHaveLength(7)
    await user.selectOptions(filterSelect(), LEGACY)
    expect(screen.getByRole('heading', { name: 'Normatova Gulnora' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Karimov Ali Vali' })).toBeNull()
  })

  it("natija bo'sh — «Hech narsa topilmadi»; «Filtrni tozalash» hammasini qaytaradi", async () => {
    mockApi({ 'GET /teachers': [T1, T2] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await screen.findByRole('heading', { name: 'Karimov Ali Vali' })
    await user.type(screen.getByRole('textbox', { name: "Ism bo'yicha qidirish" }), 'Alisher')
    await user.selectOptions(filterSelect(), 'Aniq fanlar kafedrasi')
    expect(screen.getByText('Hech narsa topilmadi')).toBeInTheDocument()
    expect(screen.getByText(/«Alisher» ismi va «Aniq fanlar kafedrasi»/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Filtrni tozalash' }))
    expect(screen.queryByText('Hech narsa topilmadi')).toBeNull()
    expect(screen.getByRole('textbox', { name: "Ism bo'yicha qidirish" })).toHaveValue('')
    expect(filterSelect()).toHaveValue('')
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(2)
  })
})

describe("TeachersAdmin: kafedralar ro'yxati (GET /teachers/departments)", () => {
  const NEW_DEPT = 'Yangi texnologiyalar kafedrasi'

  it("forma va filtr serverdan kelgan ro'yxatni ishlatadi (yangi kafedra kod o'zgarishisiz paydo bo'ladi)", async () => {
    mockApi({ 'GET /teachers': [T1], 'GET /teachers/departments': [NEW_DEPT, 'Aniq fanlar kafedrasi'] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await screen.findByRole('heading', { name: 'Karimov Ali Vali' })
    await waitFor(() => expect(within(filterSelect()).getByRole('option', { name: NEW_DEPT })).toBeInTheDocument())
    // eski qattiq ro'yxatdagi, serverda yo'q kafedra tanlovda yo'q
    expect(within(filterSelect()).queryByRole('option', { name: 'Ijtimoiy fanlar kafedrasi' })).toBeNull()
    await openForm(user)
    expect(within(deptSelect()).getByRole('option', { name: NEW_DEPT })).toBeInTheDocument()
  })

  it("server ro'yxati bo'lmasa (xato / bo'sh / massiv emas) — o'rnatilgan nusxa ishlatiladi, forma bo'sh qolmaydi", async () => {
    for (const bad of [{ status: 500, body: { error: 'x' } }, [], { not: 'array' }, [1, 2]]) {
      mockApi({ 'GET /teachers': [T1], 'GET /teachers/departments': bad })
      const user = userEvent.setup()
      const { unmount } = render(<TeachersAdmin />)
      await screen.findByRole('heading', { name: 'Karimov Ali Vali' })
      await openForm(user)
      expect(within(deptSelect()).getByRole('option', { name: 'Aniq fanlar kafedrasi' })).toBeInTheDocument()
      expect(within(deptSelect()).getAllByRole('option')).toHaveLength(6) // 5 kafedra + «— Kafedrani tanlang —»
      unmount()
    }
  })

  it("saqlashda kafedra serverdagi ro'yxatga qarab tekshiriladi", async () => {
    const api = mockApi({
      'GET /teachers': [],
      'GET /teachers/departments': [NEW_DEPT],
      'POST /teachers': { _id: 't9', name: 'Yangi Ustoz', role: 'Professor', dept: NEW_DEPT },
    })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await waitFor(() => expect(api.find('GET', '/teachers/departments')).toHaveLength(1))
    await openForm(user)
    await user.type(nameInput(), 'Yangi Ustoz')
    await user.type(roleInput(), 'Professor')
    await user.selectOptions(deptSelect(), NEW_DEPT)
    await submit(user)
    await waitFor(() => expect(api.find('POST', '/teachers')).toHaveLength(1))
    expect(api.find('POST', '/teachers')[0].body.get('dept')).toBe(NEW_DEPT)
  })
})

describe('TeachersAdmin: forma', () => {
  it("validatsiya: ism, lavozim va kafedra — maydon ostida xabar (alert() emas); POST ketmaydi", async () => {
    const api = mockApi({ 'GET /teachers': [] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await openForm(user)
    await submit(user)
    expect(screen.getByText("To'liq ismni kiriting.")).toBeInTheDocument()
    expect(screen.getByText('Lavozimni kiriting.')).toBeInTheDocument()
    expect(screen.getByText('Kafedrani tanlang.')).toBeInTheDocument()
    expect(nameInput()).toHaveAttribute('aria-invalid', 'true')
    expect(nameInput()).toHaveFocus()
    expect(alert).not.toHaveBeenCalled()
    expect(api.find('POST', '/teachers')).toHaveLength(0)
    await userEvent.setup().type(nameInput(), 'A')
    expect(screen.queryByText("To'liq ismni kiriting.")).toBeNull()
  })

  it("yaratish: FormData (kafedra bilan), ro'yxatga qo'shiladi, forma yopiladi", async () => {
    const created = { _id: 't9', name: 'Yangi Ustoz', role: 'Professor', dept: 'Aniq fanlar kafedrasi' }
    const api = mockApi({ 'GET /teachers': [], 'POST /teachers': created })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.type(await openForm(user), '  Yangi Ustoz ')
    await user.type(roleInput(), 'Professor')
    await user.selectOptions(deptSelect(), 'Aniq fanlar kafedrasi')
    await submit(user)
    expect(await screen.findByRole('heading', { name: 'Yangi Ustoz' })).toBeInTheDocument()
    const [c] = api.find('POST', '/teachers')
    expect(c.body.get('name')).toBe('Yangi Ustoz')
    expect(c.body.get('role')).toBe('Professor')
    expect(c.body.get('dept')).toBe('Aniq fanlar kafedrasi')
    expect(c.body.get('avatar')).toBe('')
    expect(c.body.get('existingImage')).toBe('')
    expect(c.body.has('email')).toBe(false)
    expect(c.headers).toEqual({ Authorization: 'Bearer tok' })
    expect(screen.queryByRole('form')).toBeNull()
  })

  it("«Bosh harflar»: 2 belgi bilan cheklangan, hisoblagich «N / 2»; hisoblagichlar «N / 200»", async () => {
    mockApi({ 'GET /teachers': [] })
    const user = userEvent.setup()
    const { container } = render(<TeachersAdmin />)
    await openForm(user)
    const av = screen.getByLabelText(/^Bosh harflar/)
    await user.type(av, 'XYZ')
    expect(av).toHaveValue('XY')
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    expect(screen.getByText("Foto bo'lmasa saytda shu 2 harf ko'rinadi. Bo'sh qolsa — ismning birinchi 2 harfi.")).toBeInTheDocument()
    expect(screen.getAllByText('0 / 200')).toHaveLength(2)
    // foto maydonidagi jonli ko'rinish: kiritilgan harflar
    expect(container.querySelector('.adm-avfield .adm-avatar')).toHaveTextContent('XY')
  })

  it("tahrirlash: mavjud ma'lumot to'ldiriladi, PUT yuboriladi (existingImage), ro'yxat yangilanadi", async () => {
    const api = mockApi({ 'GET /teachers': [T1], 'PUT /teachers/t1': { ...T1, role: 'Professor' } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: Karimov Ali Vali' }))
    expect(nameInput()).toHaveValue('Karimov Ali Vali')
    expect(deptSelect()).toHaveValue('Aniq fanlar kafedrasi')
    await user.clear(roleInput()); await user.type(roleInput(), 'Professor')
    await submit(user, /Saqlash/)
    expect(await screen.findByText('Professor')).toBeInTheDocument()
    expect(api.find('PUT', '/teachers/t1')[0].body.get('existingImage')).toBe('https://s/t1.jpg')
    expect(screen.queryByLabelText(/^To'liq ism/)).toBeNull()
  })

  it("ro'yxatda yo'q kafedra: qiymat ko'rinadi, ogohlantirish chiqadi, saqlashdan oldin ro'yxatdan tanlash kerak", async () => {
    const api = mockApi({ 'GET /teachers': [T3], 'PUT /teachers/t3': { ...T3, dept: 'Aniq fanlar kafedrasi' } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: Normatova Gulnora' }))
    // avval `<select>` mos `option` topmasa bo'sh ko'rinardi va `dept` bo'sh ketardi
    expect(deptSelect()).toHaveValue(LEGACY)
    expect(screen.getByText("Bu kafedra ro'yxatda yo'q. Saqlashdan oldin ro'yxatdan tanlang.").closest('[role="status"]')).toBeInTheDocument()
    await submit(user, /Saqlash/)
    expect(await screen.findByText("Kafedrani ro'yxatdan tanlang.")).toBeInTheDocument()
    expect(api.find('PUT', '/teachers/t3')).toHaveLength(0)
    await user.selectOptions(deptSelect(), 'Aniq fanlar kafedrasi')
    expect(screen.queryByText(/ro'yxatda yo'q/)).toBeNull()
    await submit(user, /Saqlash/)
    await waitFor(() => expect(api.find('PUT', '/teachers/t3')).toHaveLength(1))
    expect(api.find('PUT', '/teachers/t3')[0].body.get('dept')).toBe('Aniq fanlar kafedrasi')
  })

  it("saqlanmoqda: maydonlar o'chiq, tugma `aria-busy`, qator «O'qituvchi saqlanmoqda...»", async () => {
    let release
    const held = new Promise(r => { release = r })
    vi.stubGlobal('fetch', vi.fn(async (u, init) => {
      if (init?.method === 'PUT') { await held; return { ok: true, status: 200, json: async () => T1 } }
      return { ok: true, status: 200, json: async () => [T1] }
    }))
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: Karimov Ali Vali' }))
    await submit(user, /Saqlash/)
    const btn = await screen.findByRole('button', { name: 'Saqlanmoqda...' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(nameInput()).toBeDisabled()
    expect(screen.getByText("O'qituvchi saqlanmoqda...")).toBeInTheDocument()
    release()
    await waitFor(() => expect(screen.queryByLabelText(/^To'liq ism/)).toBeNull())
  })

  it("server xatosi — forma tepasida banner, forma to'ldirilgan holda qoladi", async () => {
    mockApi({ 'GET /teachers': [T1], 'PUT /teachers/t1': { status: 400, body: { error: 'Saqlashda xatolik' } } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: Karimov Ali Vali' }))
    await user.clear(roleInput()); await user.type(roleInput(), 'Professor')
    await submit(user, /Saqlash/)
    expect(await screen.findByText(/Saqlashda xatolik — kiritilgan ma'lumotlar saqlanib turibdi/)).toBeInTheDocument()
    expect(roleInput()).toHaveValue('Professor')
    expect(screen.getByRole('button', { name: /Saqlash/ })).toBeEnabled()
    expect(alert).not.toHaveBeenCalled()
  })

  it("saqlashda tarmoq xatosi — banner, tugma qayta faollashadi", async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'PUT' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve([T1]) }))))
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: Karimov Ali Vali' }))
    await submit(user, /Saqlash/)
    expect(await screen.findByText(/Server bilan bog'lanib bo'lmadi — kiritilgan ma'lumotlar saqlanib turibdi/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Saqlash/ })).toBeEnabled()
  })
})

describe('TeachersAdmin: foto', () => {
  it("yangi foto: «Yangi» belgisi, `imageFile` yuboriladi, `existingImage` bo'sh", async () => {
    const api = mockApi({ 'GET /teachers': [T1], 'PUT /teachers/t1': T1 })
    const user = userEvent.setup()
    const { container } = render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: Karimov Ali Vali' }))
    expect(screen.getByText('Fotoni almashtirish')).toBeInTheDocument()
    await user.upload(fileInput(container), png('yangi.png'))
    expect(screen.getByText('Yangi')).toBeInTheDocument()
    await submit(user, /Saqlash/)
    await waitFor(() => expect(api.find('PUT', '/teachers/t1')).toHaveLength(1))
    const body = api.find('PUT', '/teachers/t1')[0].body
    expect(body.get('imageFile').name).toBe('yangi.png')
    expect(body.get('existingImage')).toBe('')
  })

  it("fotoni olib tashlash: `existingImage` bo'sh; xuddi shu faylni qayta tanlash mumkin; blob URL tozalanadi", async () => {
    const api = mockApi({ 'GET /teachers': [T1], 'PUT /teachers/t1': { ...T1, image: '' } })
    const user = userEvent.setup()
    const { container } = render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: Karimov Ali Vali' }))
    await user.click(screen.getByRole('button', { name: 'Fotoni olib tashlash' }))
    expect(screen.getByText("Foto qo'shish")).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Fotoni olib tashlash' })).toBeNull()
    await submit(user, /Saqlash/)
    await waitFor(() => expect(api.find('PUT', '/teachers/t1')).toHaveLength(1))
    expect(api.find('PUT', '/teachers/t1')[0].body.get('existingImage')).toBe('')
    expect(fileInput(container)).toBeNull()   // forma yopildi
  })

  it("fayl xatosi (tur / hajm) — foto ostida `role=alert`, alert() emas", async () => {
    mockApi({ 'GET /teachers': [] })
    const user = userEvent.setup({ applyAccept: false })
    const { container } = render(<TeachersAdmin />)
    await openForm(user)
    await user.upload(fileInput(container), new File(['x'], 'foto.pdf', { type: 'application/pdf' }))
    expect(screen.getByText(/foto\.pdf — faqat JPEG, PNG, WebP yoki GIF qabul qilinadi\./)).toBeInTheDocument()
    await user.upload(fileInput(container), png('katta.png', 5 * 1024 * 1024 + 1))
    expect(screen.getByText('katta.png — 5 MB dan katta. Boshqa foto tanlang.')).toBeInTheDocument()
    await user.upload(fileInput(container), png('ok.png'))
    expect(screen.queryByText(/5 MB dan katta/)).toBeNull()
    expect(alert).not.toHaveBeenCalled()
  })
})

describe("TeachersAdmin: o'chirish va saqlanmagan o'zgarishlar", () => {
  it("o'chirish: dialog (ism bilan), tasdiqlansa DELETE va karta yo'qoladi", async () => {
    const api = mockApi({ 'GET /teachers': [T1, T2], 'DELETE /teachers/t1': { success: true } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: "O'chirish: Karimov Ali Vali" }))
    const dlg = screen.getByRole('alertdialog')
    expect(within(dlg).getByText("O'qituvchini o'chirishni tasdiqlaysizmi?")).toBeInTheDocument()
    expect(within(dlg).getByText('«Karimov Ali Vali»')).toBeInTheDocument()
    expect(api.find('DELETE', '/teachers/t1')).toHaveLength(0)
    await user.click(within(dlg).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(screen.queryByRole('heading', { name: 'Karimov Ali Vali' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Zokirova Odina' })).toBeInTheDocument()
    expect(api.find('DELETE', '/teachers/t1')).toHaveLength(1)
  })

  it("dialogda «Bekor qilish» — hech narsa o'chmaydi", async () => {
    const api = mockApi({ 'GET /teachers': [T1] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: "O'chirish: Karimov Ali Vali" }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(api.find('DELETE', '/teachers/t1')).toHaveLength(0)
    expect(screen.getByRole('heading', { name: 'Karimov Ali Vali' })).toBeInTheDocument()
  })

  it("DELETE 404 (boshqa admin allaqachon o'chirgan) — karta ro'yxatdan ketadi, xato banneri yo'q", async () => {
    mockApi({ 'GET /teachers': [T1], 'DELETE /teachers/t1': { status: 404, body: { error: 'Topilmadi' } } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: "O'chirish: Karimov Ali Vali" }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Karimov Ali Vali' })).not.toBeInTheDocument())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it("DELETE 403 — karta qoladi, banner ko'rsatiladi (alert() emas)", async () => {
    mockApi({ 'GET /teachers': [T1], 'DELETE /teachers/t1': { status: 403, body: { error: "Ruxsat yo'q" } } })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: "O'chirish: Karimov Ali Vali" }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    expect(await screen.findByText("Ruxsat yo'q")).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Karimov Ali Vali' })).toBeInTheDocument()
    expect(alert).not.toHaveBeenCalled()
  })

  it("o'zgarmagan forma jimgina yopiladi; o'zgargan bo'lsa — «Saqlanmagan o'zgarishlar bor» dialogi", async () => {
    mockApi({ 'GET /teachers': [T1] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: Karimov Ali Vali' }))
    await user.click(screen.getByRole('button', { name: 'Formani yopish' }))
    expect(screen.queryByLabelText(/^To'liq ism/)).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Tahrirlash: Karimov Ali Vali' }))
    await user.type(roleInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Formani yopish' }))
    const dlg = screen.getByRole('alertdialog')
    expect(within(dlg).getByText("Saqlanmagan o'zgarishlar bor")).toBeInTheDocument()
    await user.click(within(dlg).getByRole('button', { name: 'Tahrirlashda qolish' }))
    expect(roleInput()).toHaveValue('Dotsent!')
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Chiqish' }))
    expect(screen.queryByLabelText(/^To'liq ism/)).toBeNull()
  })

  it("o'zgargan formada boshqa o'qituvchini tahrirlash yoki «Yangi o'qituvchi» jimgina tozalamaydi", async () => {
    mockApi({ 'GET /teachers': [T1, T2] })
    const user = userEvent.setup()
    render(<TeachersAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: Karimov Ali Vali' }))
    await user.type(roleInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Tahrirlash: Zokirova Odina' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Chiqish' }))
    expect(nameInput()).toHaveValue('Zokirova Odina')
    await user.type(roleInput(), '?')
    await user.click(screen.getAllByRole('button', { name: "Yangi o'qituvchi" })[0])
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
