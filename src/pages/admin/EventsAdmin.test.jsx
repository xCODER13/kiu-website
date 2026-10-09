import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventsAdmin from './EventsAdmin'
import { mockApi } from '../../test/helpers'
import { todayKey } from './shared/helpers'

// Sanalar vaqtga bog'liq bo'lmasligi uchun: kelgusi — 2099, o'tgan — 2020 (bugun testda `todayKey()` dan olinadi)
const E1 = { _id: 'e1', title: 'Ochiq eshiklar kuni', desc: 'Tavsif', eventDate: '2099-10-15T00:00:00.000Z', type: 'open', image: 'https://s/e1.jpg', views: 1284 }
const E2 = { _id: 'e2', title: 'Rasmsiz konferensiya', desc: '', eventDate: '2099-03-02T00:00:00.000Z', type: 'science' }
const P1 = { _id: 'p1', title: 'Eski musobaqa', desc: 'Futbol', eventDate: '2020-09-20T00:00:00.000Z', type: 'sport', views: 310 }
const P2 = { _id: 'p2', title: 'Yarmarka', eventDate: '2021-03-05T00:00:00.000Z', type: 'general' }
const png = (name = 'e.png', size = 1000) => { const f = new File(['x'], name, { type: 'image/png' }); Object.defineProperty(f, 'size', { value: size }); return f }

beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  vi.spyOn(window, 'confirm').mockImplementation(() => { throw new Error('window.confirm ishlatilmasligi kerak') })
  let n = 0
  URL.createObjectURL = vi.fn(() => `blob:x${++n}`); URL.revokeObjectURL = vi.fn()
  localStorage.setItem('kiu_token', 'tok')
})

const titleInput = () => screen.getByLabelText(/^Sarlavha/)
const dateInput = () => screen.getByLabelText(/^Sana/)
const openForm = async user => { await user.click(screen.getByRole('button', { name: 'Yangi tadbir' })); return titleInput() }
const submit = (user, name = /Qo'shish|Saqlash/) => user.click(screen.getByRole('button', { name }))
const rowOfTitle = title => screen.getByRole('heading', { name: title }).closest('li')
const edit = (user, title) => user.click(screen.getByRole('button', { name: `Tahrirlash: ${title}` }))
const del = (user, title) => user.click(screen.getByRole('button', { name: `O'chirish: ${title}` }))
const fileInput = container => container.querySelector('input[type=file]')

async function setupEdit(routes = {}) {
  const api = mockApi({ 'GET /events': [E1, P1], ...routes })
  const user = userEvent.setup()
  const utils = render(<EventsAdmin />)
  await screen.findByText('Ochiq eshiklar kuni')
  await edit(user, 'Ochiq eshiklar kuni')
  return { api, user, ...utils }
}

describe('EventsAdmin: ro\'yxat', () => {
  // 6.25: avval bitta ro'yxat, `eventDate` o'sish tartibida — yangi tadbir oxirda «yo'qolardi»
  it('«Kelgusi» o\'sish, «O\'tgan» kamayish tartibida; har bo\'lim va sahifa hisoblagichi bor', async () => {
    mockApi({ 'GET /events': [P1, E1, P2, E2] })
    render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    expect(screen.getByRole('heading', { level: 2, name: 'Tadbirlar' })).toBeInTheDocument()
    expect(screen.getByText('4', { selector: '.adm-count-pill' })).toBeInTheDocument()
    const up = screen.getByRole('region', { name: 'Kelgusi tadbirlar' })
    const past = screen.getByRole('region', { name: "O'tgan tadbirlar" })
    expect(within(up).getAllByRole('heading', { level: 4 }).map(h => h.textContent)).toEqual(['Rasmsiz konferensiya', 'Ochiq eshiklar kuni'])
    expect(within(past).getAllByRole('heading', { level: 4 }).map(h => h.textContent)).toEqual(['Yarmarka', 'Eski musobaqa'])
    expect(within(up).getByText('2', { selector: '.adm-count-pill' })).toBeInTheDocument()
    expect(within(past).getByText('2', { selector: '.adm-count-pill' })).toBeInTheDocument()
  })

  it('bitta bo\'limda tadbir bo\'lmasa — shu bo\'lim yashiriladi', async () => {
    mockApi({ 'GET /events': [E1] })
    render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    expect(screen.getByRole('region', { name: 'Kelgusi tadbirlar' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: "O'tgan tadbirlar" })).not.toBeInTheDocument()
  })

  it('tadbir kuni (bugun) hali «kelgusi»; kecha — «o\'tgan»; sanasi noto\'g\'ri tadbir yo\'qolmaydi (o\'tgan oxirida)', async () => {
    const d = new Date(); d.setDate(d.getDate() - 1)
    const yesterday = todayKey(d)
    mockApi({ 'GET /events': [
      { _id: 't', title: 'Bugungi', eventDate: `${todayKey()}T00:00:00.000Z` },
      { _id: 'y', title: 'Kechagi', eventDate: yesterday },
      { _id: 'x', title: 'Sanasiz', eventDate: 'noma\'lum' },
    ] })
    render(<EventsAdmin />)
    await screen.findByText('Bugungi')
    const up = screen.getByRole('region', { name: 'Kelgusi tadbirlar' })
    const past = screen.getByRole('region', { name: "O'tgan tadbirlar" })
    expect(within(up).getByText('Bugungi')).toBeInTheDocument()
    expect(within(past).getAllByRole('heading', { level: 4 }).map(h => h.textContent)).toEqual(['Kechagi', 'Sanasiz'])
  })

  it('qator: sana plitkasi har doim (rasm bo\'lsa ham), poster, tur chipi, sana yil bilan, ko\'rishlar, tavsif', async () => {
    mockApi({ 'GET /events': [E1, E2] })
    const { container } = render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    const row = rowOfTitle('Ochiq eshiklar kuni')
    const tile = row.querySelector('.adm-date-tile')
    expect(tile).toHaveTextContent('15OKT')
    expect(tile).toHaveAttribute('data-past', 'false')
    expect(row.querySelector('.adm-item-poster-img')).toHaveAttribute('src', 'https://s/e1.jpg')
    expect(within(row).getByText('Ochiq kun').closest('.adm-cat')).toHaveAttribute('data-cat', '5')
    expect(within(row).getByText('15 oktyabr 2099')).toBeInTheDocument()
    expect(within(row).getByText(/^1\s284$/).closest('.adm-meta')).toHaveAttribute('title', "Ko'rishlar soni")
    expect(within(row).getByText('Tavsif')).toBeInTheDocument()
    // rasmsiz tadbir: plitka bor, poster joyi ajratilmaydi; ko'rishlar yo'q — 0
    const bare = rowOfTitle('Rasmsiz konferensiya')
    expect(bare.querySelector('.adm-date-tile')).toHaveTextContent('2MAR')
    expect(bare.querySelector('.adm-item-poster')).toBeNull()
    expect(within(bare).getByText('0')).toBeInTheDocument()
    expect(within(bare).getByText('Ilmiy').closest('.adm-cat')).toHaveAttribute('data-cat', '6')
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it('o\'tgan tadbir: kulrang plitka va «O\'tgan» belgisi (rang bilan birga matn)', async () => {
    mockApi({ 'GET /events': [P1] })
    render(<EventsAdmin />)
    await screen.findByText('Eski musobaqa')
    const row = rowOfTitle('Eski musobaqa')
    expect(row.querySelector('.adm-date-tile')).toHaveAttribute('data-past', 'true')
    expect(within(row).getByText("O'tgan")).toBeInTheDocument()
    expect(within(row).getByText('20 sentyabr 2020')).toBeInTheDocument()
  })

  it('tur chipi: har tur o\'z rangida; noma\'lum tur — neytral (0) va o\'z nomi bilan; turi yo\'q — Umumiy', async () => {
    const mk = (type, i) => ({ _id: `t${i}`, title: `T-${type ?? 'yoq'}`, eventDate: '2099-01-01', type })
    mockApi({ 'GET /events': ['general', 'graduation', 'sport', 'culture', 'open', 'admission', 'science', 'ajib', undefined].map(mk) })
    render(<EventsAdmin />)
    await screen.findByText('T-general')
    const tone = t => rowOfTitle(t).querySelector('.adm-cat').dataset.cat
    expect(['general', 'graduation', 'sport', 'culture', 'open', 'admission', 'science', 'ajib', 'yoq'].map(t => tone(`T-${t}`)))
      .toEqual(['1', '2', '3', '4', '5', '5', '6', '0', '1'])
    expect(within(rowOfTitle('T-ajib')).getByText('ajib')).toBeInTheDocument()
    expect(within(rowOfTitle('T-yoq')).getByText('Umumiy')).toBeInTheDocument()
  })

  it('poster rasmi yuklanmasa `data-broken`, inline stilsiz', async () => {
    mockApi({ 'GET /events': [E1] })
    const { container } = render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    const img = container.querySelector('.adm-item-poster-img')
    fireEvent.error(img)
    expect(img.dataset.broken).toBe('true')
    expect(img.getAttribute('style')).toBeNull()
  })

  it('yuklanayotganda — skelet (`aria-busy`), hisoblagich «–»', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<EventsAdmin />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('–', { selector: '.adm-count-pill' })).toBeInTheDocument()
  })

  // 6.25: avval `.catch(() => {})` xatoni yutardi va «Hali tadbir yo'q» chiqardi; endi xato paneli + «Qayta urinish»
  it('GET xatosi — xato paneli (jim bo\'sh ro\'yxat emas); «Qayta urinish» qayta yuklaydi', async () => {
    let ok = false
    mockApi({ 'GET /events': () => (ok ? [E1] : { status: 500, body: { error: 'x' } }) })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<EventsAdmin />)
    expect(await screen.findByRole('alert')).toHaveTextContent("Tadbirlarni yuklab bo'lmadi.")
    expect(screen.queryByText("Hali tadbir yo'q")).not.toBeInTheDocument()
    ok = true
    await user.click(screen.getByRole('button', { name: 'Qayta urinish' }))
    expect(await screen.findByText('Ochiq eshiklar kuni')).toBeInTheDocument()
  })

  it('tarmoq xatosida ham xato paneli (qulamaydi)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<EventsAdmin />)
    expect(await screen.findByText("Tadbirlarni yuklab bo'lmadi.")).toBeInTheDocument()
  })

  it('bo\'sh ro\'yxat — «Hali tadbir yo\'q» va tugma formani ochadi', async () => {
    mockApi({ 'GET /events': [] })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    expect(await screen.findByText("Hali tadbir yo'q")).toBeInTheDocument()
    expect(screen.getByText('0', { selector: '.adm-count-pill' })).toBeInTheDocument()
    const buttons = screen.getAllByRole('button', { name: 'Yangi tadbir' })
    expect(buttons).toHaveLength(2)
    await user.click(buttons[1])
    expect(titleInput()).toBeInTheDocument()
    expect(screen.queryByText("Hali tadbir yo'q")).not.toBeInTheDocument()
  })

  it('XSS: sarlavhadagi HTML matn sifatida ko\'rsatiladi', async () => {
    mockApi({ 'GET /events': [{ ...E1, title: '<img src=x onerror=alert(1)>' }] })
    render(<EventsAdmin />)
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })
})

describe('EventsAdmin: forma', () => {
  it('«Yangi tadbir» formani ochadi, fokus sarlavhada; yorliqlar inputlarga bog\'langan; hisoblagichlar; poster izohi', async () => {
    mockApi({ 'GET /events': [] })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await screen.findByText("Hali tadbir yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi tadbir' })[0])
    expect(screen.getByRole('form', { name: 'Yangi tadbir' })).toBeInTheDocument()
    expect(titleInput()).toHaveFocus()
    expect(titleInput()).toHaveAttribute('aria-required', 'true')
    expect(titleInput()).toHaveAttribute('maxlength', '300')
    expect(dateInput()).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('Turi')).toHaveValue('general')
    expect(screen.getByLabelText('Tavsif')).toHaveAttribute('maxlength', '3000')
    expect(screen.getByText('0 / 300')).toBeInTheDocument()
    expect(screen.getByText(/^0 \/ 3\s000$/)).toBeInTheDocument()
    expect(screen.getByText("Poster qo'shish")).toBeInTheDocument()
    await user.type(titleInput(), 'Salom')
    expect(screen.getByText('5 / 300')).toBeInTheDocument()
  })

  // 6.25: avval bitta `alert('Sarlavha va sana kiritilishi shart!')` — qaysi maydon bo'shligi aytilmasdi
  it('validatsiya: sarlavha va sana uchun ALOHIDA xabar maydon ostida, fokus birinchi xatoda, alert() yo\'q, so\'rov ketmaydi', async () => {
    const api = mockApi({ 'GET /events': [] })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await screen.findByText("Hali tadbir yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi tadbir' })[0])
    await submit(user)
    expect(alert).not.toHaveBeenCalled()
    expect(api.find('POST', '/events')).toHaveLength(0)
    expect(titleInput()).toHaveAttribute('aria-invalid', 'true')
    expect(titleInput()).toHaveAccessibleDescription('Sarlavha kiritilishi shart.')
    expect(dateInput()).toHaveAttribute('aria-invalid', 'true')
    expect(dateInput()).toHaveAccessibleDescription('Sanani tanlang.')
    expect(titleInput()).toHaveFocus()
    // sarlavha to'ldirilsa — faqat sana xatosi qoladi va fokus sanaga o'tadi
    await user.type(titleInput(), 'Tadbir')
    expect(screen.queryByText('Sarlavha kiritilishi shart.')).not.toBeInTheDocument()
    await submit(user)
    expect(dateInput()).toHaveFocus()
    expect(screen.getByRole('alert')).toHaveTextContent('Sanani tanlang.')
    fireEvent.change(dateInput(), { target: { value: '2099-01-02' } })
    expect(screen.queryByText('Sanani tanlang.')).not.toBeInTheDocument()
  })

  it('faqat bo\'sh joydan iborat sarlavha ham rad etiladi', async () => {
    const api = mockApi({ 'GET /events': [] })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await screen.findByText("Hali tadbir yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi tadbir' })[0])
    await user.type(titleInput(), '   ')
    fireEvent.change(dateInput(), { target: { value: '2099-01-02' } })
    await submit(user)
    expect(screen.getByRole('alert')).toHaveTextContent('Sarlavha kiritilishi shart.')
    expect(api.find('POST', '/events')).toHaveLength(0)
  })

  it('yaratish: FormData maydonlari va poster fayli, token; yangi tadbir o\'z bo\'limida; forma yopiladi', async () => {
    const created = { _id: 'e9', title: 'Yangi tadbir 2', eventDate: '2099-06-05', type: 'sport', desc: 'Matn' }
    const api = mockApi({ 'GET /events': [E1], 'POST /events': created })
    const user = userEvent.setup()
    const { container } = render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    await openForm(user)
    await user.type(titleInput(), '  Yangi tadbir 2  ')
    fireEvent.change(dateInput(), { target: { value: '2099-06-05' } })
    await user.selectOptions(screen.getByLabelText('Turi'), 'sport')
    await user.type(screen.getByLabelText('Tavsif'), 'Matn')
    await user.upload(fileInput(container), png())
    await submit(user)
    await screen.findByRole('heading', { name: 'Yangi tadbir 2' })
    const [c] = api.find('POST', '/events')
    expect(c.body.get('title')).toBe('Yangi tadbir 2')   // trim
    expect(c.body.get('eventDate')).toBe('2099-06-05')
    expect(c.body.get('type')).toBe('sport')
    expect(c.body.get('desc')).toBe('Matn')
    expect(c.body.get('existingImage')).toBe('')
    expect(c.body.get('imageFile').name).toBe('e.png')
    expect(c.headers).toEqual({ Authorization: 'Bearer tok' })   // Content-Type qo'lda qo'yilmaydi (multipart chegarasi)
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    // kelgusi bo'limda sana tartibida: E1 (15.10) dan oldin (05.06)
    const up = screen.getByRole('region', { name: 'Kelgusi tadbirlar' })
    expect(within(up).getAllByRole('heading', { level: 4 }).map(h => h.textContent)).toEqual(['Yangi tadbir 2', 'Ochiq eshiklar kuni'])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x1')   // saqlangach blob URL tozalanadi (avval oqardi)
  })

  it('tahrirlash: forma to\'ldiriladi (sana YYYY-MM-DD), PUT /events/:id va existingImage yuboriladi', async () => {
    const { api, user } = await setupEdit({ 'PUT /events/e1': { ...E1, title: 'Yangilandi' } })
    expect(screen.getByRole('form', { name: 'Tahrirlash' })).toBeInTheDocument()
    expect(titleInput()).toHaveValue('Ochiq eshiklar kuni')
    expect(dateInput()).toHaveValue('2099-10-15')   // yil AYNAN saqlangan, taxmin emas
    expect(screen.getByLabelText('Turi')).toHaveValue('open')
    expect(screen.getByLabelText('Tavsif')).toHaveValue('Tavsif')
    await user.clear(titleInput()); await user.type(titleInput(), 'Yangilandi')
    await submit(user)
    expect(await screen.findByRole('heading', { name: 'Yangilandi' })).toBeInTheDocument()
    const [c] = api.find('PUT', '/events/e1')
    expect(c.body.get('existingImage')).toBe('https://s/e1.jpg')
    expect(c.body.get('imageFile')).toBeNull()
  })

  it('sana tanlagich: o\'zgartirilsa xuddi shu «YYYY-MM-DD» qiymat yuboriladi', async () => {
    const { api, user } = await setupEdit({ 'PUT /events/e1': { ...E1, eventDate: '2099-11-03' } })
    fireEvent.change(dateInput(), { target: { value: '2099-11-03' } })
    await submit(user)
    await waitFor(() => expect(api.find('PUT', '/events/e1')).toHaveLength(1))
    expect(api.find('PUT', '/events/e1')[0].body.get('eventDate')).toBe('2099-11-03')
  })

  it('tahrirlangan tadbir sanasi o\'tgan bo\'lsa — «O\'tgan» bo\'limiga ko\'chadi', async () => {
    const { user } = await setupEdit({ 'PUT /events/e1': { ...E1, eventDate: '2020-01-01T00:00:00.000Z' } })
    fireEvent.change(dateInput(), { target: { value: '2020-01-01' } })
    await submit(user)
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Kelgusi tadbirlar' })).not.toBeInTheDocument())
    expect(within(screen.getByRole('region', { name: "O'tgan tadbirlar" })).getByText('Ochiq eshiklar kuni')).toBeInTheDocument()
  })

  it('posterni olib tashlab saqlash — existingImage bo\'sh yuboriladi', async () => {
    const { api, user } = await setupEdit({ 'PUT /events/e1': { ...E1, image: '' } })
    await user.click(screen.getByRole('button', { name: 'Rasmni olib tashlash' }))
    expect(screen.getByText("Poster qo'shish")).toBeInTheDocument()
    await submit(user)
    await waitFor(() => expect(api.find('PUT', '/events/e1')).toHaveLength(1))
    expect(api.find('PUT', '/events/e1')[0].body.get('existingImage')).toBe('')
  })

  it('poster almashtirish: «Yangi» belgisi, yangi fayl yuboriladi (existingImage bo\'sh), xuddi shu faylni qayta tanlash mumkin', async () => {
    const { api, user, container } = await setupEdit({ 'PUT /events/e1': E1 })
    expect(screen.getByAltText('poster')).toHaveAttribute('src', 'https://s/e1.jpg')
    expect(screen.queryByText('Yangi', { selector: '.adm-ithumb-badge' })).not.toBeInTheDocument()
    await user.upload(fileInput(container), png('a.png'))
    expect(screen.getByAltText('poster')).toHaveAttribute('src', 'blob:x1')
    expect(screen.getByText('Yangi', { selector: '.adm-ithumb-badge' })).toBeInTheDocument()
    expect(fileInput(container).value).toBe('')   // `onChange` yana ishlashi uchun tozalangan
    await submit(user)
    await waitFor(() => expect(api.find('PUT', '/events/e1')).toHaveLength(1))
    const [c] = api.find('PUT', '/events/e1')
    expect(c.body.get('imageFile').name).toBe('a.png')
    expect(c.body.get('existingImage')).toBe('')
  })

  it('poster xatolari maydon ostida (alert() emas): fayl turi va 5 MB; keyingi muvaffaqiyatli tanlov xabarni tozalaydi', async () => {
    mockApi({ 'GET /events': [] })
    const user = userEvent.setup()
    const { container } = render(<EventsAdmin />)
    await screen.findByText("Hali tadbir yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi tadbir' })[0])
    fireEvent.change(fileInput(container), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } })
    expect(screen.getByRole('alert')).toHaveTextContent('Faqat rasm fayllari qabul qilinadi')
    expect(fileInput(container)).toHaveAccessibleDescription(/Faqat rasm fayllari/)
    fireEvent.change(fileInput(container), { target: { files: [png('katta.png', 5 * 1024 * 1024 + 1)] } })
    expect(screen.getByRole('alert')).toHaveTextContent('katta.png — 5 MB dan katta. Boshqa rasm tanlang.')
    expect(screen.getByText("Poster qo'shish")).toBeInTheDocument()   // hech narsa qo'shilmadi
    fireEvent.change(fileInput(container), { target: { files: [png('ok.png')] } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByAltText('poster')).toBeInTheDocument()
    expect(alert).not.toHaveBeenCalled()
  })

  it('drag-and-drop: maydon ustida «Posterni bu yerga tashlang», tashlanganda fayl qo\'shiladi; fayl bo\'lmagan narsa maydonni yoqmaydi', async () => {
    mockApi({ 'GET /events': [] })
    const user = userEvent.setup()
    const { container } = render(<EventsAdmin />)
    await screen.findByText("Hali tadbir yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi tadbir' })[0])
    const zone = container.querySelector('.adm-dz')
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['text/plain'], files: [] } })
    expect(zone).toHaveAttribute('data-drag', 'false')
    const dataTransfer = { types: ['Files'], files: [png('d1.png')] }
    fireEvent.dragEnter(zone, { dataTransfer })
    expect(zone).toHaveAttribute('data-drag', 'true')
    expect(screen.getByText('Posterni bu yerga tashlang')).toBeInTheDocument()
    fireEvent.dragLeave(zone, { dataTransfer, relatedTarget: document.body })
    expect(zone).toHaveAttribute('data-drag', 'false')
    fireEvent.drop(zone, { dataTransfer })
    expect(screen.getByAltText('poster')).toHaveAttribute('src', 'blob:x1')
  })

  it('fayl kiritish klaviaturadan fokuslanadi (`hidden`/`display:none` emas)', async () => {
    mockApi({ 'GET /events': [] })
    const user = userEvent.setup()
    const { container } = render(<EventsAdmin />)
    await screen.findByText("Hali tadbir yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi tadbir' })[0])
    const input = fileInput(container)
    expect(input).not.toHaveAttribute('hidden')
    expect(input).toHaveClass('adm-sr-only')
    input.focus()
    expect(input).toHaveFocus()
  })

  // 6.25: avval `alert(msg)` — endi forma tepasida banner; forma to'la qoladi, tugma faol, ro'yxat o'zgarmaydi
  it('server xatosi — banner, forma ochiq va to\'ldirilgan, tugma faol, ro\'yxat o\'zgarmaydi, alert() yo\'q', async () => {
    const { user } = await setupEdit({ 'PUT /events/e1': { status: 400, body: { error: "Noto'g'ri sana" } } })
    await user.type(titleInput(), '!')
    await submit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent("Noto'g'ri sana — kiritilgan ma'lumotlar saqlanib turibdi")
    expect(alert).not.toHaveBeenCalled()
    expect(titleInput()).toHaveValue('Ochiq eshiklar kuni!')
    expect(screen.getByRole('button', { name: 'Saqlash' })).toBeEnabled()
    expect(screen.getByRole('heading', { level: 4, name: 'Ochiq eshiklar kuni' })).toBeInTheDocument()
  })

  it('tarmoq xatosi — banner, tugma qayta faollashadi (qotib qolmaydi), forma ochiq', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'PUT' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve([E1]) }))))
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    await edit(user, 'Ochiq eshiklar kuni')
    await submit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent("Server bilan bog'lanib bo'lmadi — kiritilgan")
    expect(screen.getByRole('button', { name: 'Saqlash' })).toBeEnabled()
    expect(titleInput()).toBeInTheDocument()
  })

  it('JSON bo\'lmagan xato javob (502) — standart xabar, tugma faol', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'POST'
      ? Promise.resolve({ ok: false, status: 502, json: () => Promise.reject(new SyntaxError('html')) })
      : Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))))
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await screen.findByText("Hali tadbir yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi tadbir' })[0])
    await user.type(titleInput(), 'Tadbir')
    fireEvent.change(dateInput(), { target: { value: '2099-01-02' } })
    await submit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent('Tadbir saqlanmadi — kiritilgan')
    expect(screen.getByRole('button', { name: "Qo'shish" })).toBeEnabled()
  })

  it('saqlanayotganda: maydonlar `disabled`, tugma `aria-busy` («Saqlanmoqda...»), holat xabari, yopish bloklangan', async () => {
    let resolve
    mockApi({ 'GET /events': [E1] })
    const base = globalThis.fetch
    vi.stubGlobal('fetch', vi.fn((url, init = {}) => (init.method === 'PUT'
      ? new Promise(r => { resolve = () => r({ ok: true, status: 200, json: () => Promise.resolve({ ...E1, title: 'Z' }) }) })
      : base(url, init))))
    const user = userEvent.setup()
    const { container } = render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    await edit(user, 'Ochiq eshiklar kuni')
    await submit(user)
    const btn = await screen.findByRole('button', { name: 'Saqlanmoqda...' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
    expect(titleInput()).toBeDisabled()
    expect(dateInput()).toBeDisabled()
    expect(fileInput(container)).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Rasmni olib tashlash' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Formani yopish' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Poster yuklanmoqda va tadbir saqlanmoqda...')
    resolve()
    expect(await screen.findByRole('heading', { level: 4, name: 'Z' })).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })
})

describe('EventsAdmin: o\'chirish', () => {
  // 6.25: avval `window.confirm`; endi ilovaning o'z `alertdialog`i (fokus «Bekor qilish»da)
  it('tasdiq dialogi: «Bekor qilish» so\'rov yubormaydi; «O\'chirish» → DELETE (token bilan), tadbir ro\'yxatdan ketadi', async () => {
    const api = mockApi({ 'GET /events': [E1, P1], 'DELETE /events/e1': { success: true } })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    await del(user, 'Ochiq eshiklar kuni')
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAccessibleName("Tadbirni o'chirishni tasdiqlaysizmi?")
    expect(dialog).toHaveTextContent('«Ochiq eshiklar kuni» tadbiri va afishasi butunlay o\'chiriladi. Bu amalni qaytarib bo\'lmaydi.')
    expect(within(dialog).getByRole('button', { name: 'Bekor qilish' })).toHaveFocus()
    await user.click(within(dialog).getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(api.find('DELETE', '/events/e1')).toHaveLength(0)
    await del(user, 'Ochiq eshiklar kuni')
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByText('Ochiq eshiklar kuni')).not.toBeInTheDocument())
    expect(api.find('DELETE', '/events/e1')[0].headers.Authorization).toBe('Bearer tok')
    expect(screen.queryByRole('region', { name: 'Kelgusi tadbirlar' })).not.toBeInTheDocument()
    expect(window.confirm).not.toHaveBeenCalled()
  })

  it("DELETE 404 (boshqa admin allaqachon o'chirgan) — tadbir ro'yxatdan ketadi, xato banneri yo'q", async () => {
    mockApi({ 'GET /events': [E1], 'DELETE /events/e1': { status: 404, body: { error: 'Topilmadi' } } })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    await del(user, 'Ochiq eshiklar kuni')
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByText('Ochiq eshiklar kuni')).not.toBeInTheDocument())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('DELETE 500 — tadbir qoladi, xabar yopiladigan bannerda (alert() emas)', async () => {
    mockApi({ 'GET /events': [E1], 'DELETE /events/e1': { status: 500, body: { error: 'x xato' } } })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    await del(user, 'Ochiq eshiklar kuni')
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    expect(await screen.findByRole('alert')).toHaveTextContent('x xato')
    expect(alert).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { level: 4, name: 'Ochiq eshiklar kuni' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('tahrirlanayotgan tadbir o\'chirilsa forma ham yopiladi', async () => {
    const { user } = await setupEdit({ 'DELETE /events/e1': { success: true } })
    await del(user, 'Ochiq eshiklar kuni')
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByRole('form')).not.toBeInTheDocument())
  })
})

describe('EventsAdmin: saqlanmagan o\'zgarishlar', () => {
  it('o\'zgarmagan forma — «Bekor qilish» dialogsiz yopadi', async () => {
    const { user } = await setupEdit()
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('o\'zgargan forma — «Bekor qilish» ogohlantirish dialogini ochadi; fokus «Tahrirlashda qolish»da; qolsa forma saqlanadi; Esc ham qoldiradi', async () => {
    const { user } = await setupEdit()
    await user.type(titleInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAccessibleName("Saqlanmagan o'zgarishlar bor")
    expect(within(dialog).getByRole('button', { name: 'Tahrirlashda qolish' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(titleInput()).toHaveValue('Ochiq eshiklar kuni!')
    await user.click(screen.getByRole('button', { name: 'Formani yopish' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Tahrirlashda qolish' }))
    expect(titleInput()).toHaveValue('Ochiq eshiklar kuni!')
  })

  it('«Chiqish» formani yopadi va kiritilganni tashlaydi; qayta ochilganda forma toza', async () => {
    const { user } = await setupEdit()
    await user.type(titleInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Formani yopish' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Chiqish' }))
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    await openForm(user)
    expect(titleInput()).toHaveValue('')
  })

  it('yangi poster tanlash ham o\'zgarish; mavjud posterni olib tashlash ham; asl holatiga qaytarilgan matn — yo\'q', async () => {
    const { user, container } = await setupEdit()
    await user.upload(fileInput(container), png())
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Chiqish' }))
    await edit(user, 'Ochiq eshiklar kuni')
    await user.click(screen.getByRole('button', { name: 'Rasmni olib tashlash' }))
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Chiqish' }))
    await edit(user, 'Ochiq eshiklar kuni')
    await user.type(titleInput(), 'x'); await user.type(titleInput(), '{Backspace}')
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('o\'zgargan forma ochiq paytda boshqa tadbirni tahrirlash — dialog; «Chiqish» boshqasini ochadi; o\'zgarmagan forma dialogsiz almashadi', async () => {
    mockApi({ 'GET /events': [E1, E2, P1] })
    const user = userEvent.setup()
    render(<EventsAdmin />)
    await screen.findByText('Ochiq eshiklar kuni')
    await edit(user, 'Ochiq eshiklar kuni')
    await edit(user, 'Rasmsiz konferensiya')   // o'zgarmagan — dialogsiz
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(titleInput()).toHaveValue('Rasmsiz konferensiya')
    await user.type(titleInput(), '!')
    await edit(user, 'Eski musobaqa')
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Chiqish' }))
    expect(titleInput()).toHaveValue('Eski musobaqa')
  })

  it('«Yangi tadbir»: tahrirlash o\'zgargan bo\'lsa dialog, «Chiqish» — toza yangi forma; yangi forma ochiq bo\'lsa ma\'lumotni tozalamaydi', async () => {
    const { user } = await setupEdit()
    await user.type(titleInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Yangi tadbir' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Chiqish' }))
    expect(screen.getByRole('form', { name: 'Yangi tadbir' })).toBeInTheDocument()
    expect(titleInput()).toHaveValue('')
    await user.type(titleInput(), 'Qoralama')
    await user.click(screen.getByRole('button', { name: 'Yangi tadbir' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(titleInput()).toHaveValue('Qoralama')
    expect(titleInput()).toHaveFocus()
  })

  it('muvaffaqiyatli saqlangandan keyin dialog chiqmaydi (forma toza yopiladi)', async () => {
    const { user } = await setupEdit({ 'PUT /events/e1': E1 })
    await user.type(titleInput(), '!')
    await submit(user)
    await waitFor(() => expect(screen.queryByRole('form')).not.toBeInTheDocument())
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
