import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsAdmin from './NewsAdmin'
import { mockApi } from '../../test/helpers'

const N1 = { _id: 'n1', title: 'Birinchi yangilik', content: 'Matn', category: 'Sport', createdAt: '2026-01-02T12:00:00Z', views: 1284, image: JSON.stringify(['https://s/1.jpg', 'https://s/2.jpg']) }
const S1 = { _id: 's1', title: 'Shorts video', videoId: 'dQw4w9WgXcQ', createdAt: '2026-01-03T12:00:00Z', views: 3940 }
const png = (name = 'a.png', size = 1000) => { const f = new File(['x'], name, { type: 'image/png' }); Object.defineProperty(f, 'size', { value: size }); return f }

let blobN
beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  blobN = 0
  URL.createObjectURL = vi.fn(() => `blob:x${++blobN}`); URL.revokeObjectURL = vi.fn()
  localStorage.setItem('kiu_token', 'tok')
})

const titleInput = () => screen.getByLabelText(/^Sarlavha/)
const openForm = async user => { await user.click(screen.getByRole('button', { name: 'Yangi yangilik' })); return titleInput() }
const submit = (user, name = /Qo'shish|Saqlash/) => user.click(screen.getByRole('button', { name }))
const rowOfTitle = title => screen.getByRole('heading', { name: title }).closest('li')

describe('NewsAdmin: ro\'yxat', () => {
  it('yangiliklar va Shorts alohida bo\'limlarda; har bo\'lim va sahifa hisoblagichi bor', async () => {
    mockApi({ 'GET /news': [N1, S1] })
    const { container } = render(<NewsAdmin />)
    expect(await screen.findByRole('heading', { name: 'Birinchi yangilik' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Shorts video' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Yangiliklar' })).toBeInTheDocument()
    expect(container.querySelector('.adm-page-head .adm-count-pill')).toHaveTextContent('Jami: 2')
    const regular = screen.getByRole('region', { name: 'Yangiliklar' })
    const shorts = screen.getByRole('region', { name: 'YouTube Shorts' })
    expect(within(regular).getByText('Birinchi yangilik')).toBeInTheDocument()
    expect(within(shorts).getByText('Shorts video')).toBeInTheDocument()
    expect(within(regular).queryByText('Shorts video')).not.toBeInTheDocument()
  })

  it('qator: kategoriya (rang kodi), sana, ko\'rishlar (mingliklar bilan), matn boshi', async () => {
    mockApi({ 'GET /news': [N1, S1] })
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    const row = rowOfTitle('Birinchi yangilik')
    const cat = within(row).getByText('Sport')
    expect(cat.closest('.adm-cat')).toHaveAttribute('data-cat', '3')
    expect(within(row).getByText(/^\d\d\.\d\d\.2026$/)).toBeInTheDocument()
    expect(within(row).getByText(/^1\s284$/)).toBeInTheDocument()
    expect(within(row).getByText('Matn')).toBeInTheDocument()
    expect(within(rowOfTitle('Shorts video')).getByText(/^3\s940$/)).toBeInTheDocument()
    expect(within(rowOfTitle('Shorts video')).getByText('Shorts').closest('.adm-cat')).toHaveClass('adm-cat--shorts')
  })

  it('kategoriya rangi apostrof turiga qaramaydi; noma\'lum kategoriya — neytral (0)', async () => {
    mockApi({ 'GET /news': [
      { ...N1, _id: 'a', title: 'A', category: "Ta'lim" },
      { ...N1, _id: 'b', title: 'B', category: 'Taʼlim' },
      { ...N1, _id: 'c', title: 'C', category: 'Boshqa' },
      { ...N1, _id: 'd', title: 'D', category: undefined },
    ] })
    render(<NewsAdmin />)
    await screen.findByText('A')
    const tone = t => rowOfTitle(t).querySelector('.adm-cat').dataset.cat
    expect([tone('A'), tone('B'), tone('C'), tone('D')]).toEqual(['2', '2', '0', '1'])
    expect(within(rowOfTitle('D')).getByText('Umumiy')).toBeInTheDocument()
  })

  it('miniatyura: birinchi rasm; rasm yo\'q — punktir joy; Shorts — alohida plitka; ko\'rishlar yo\'q — 0', async () => {
    mockApi({ 'GET /news': [N1, { ...N1, _id: 'n2', title: 'Rasmsiz', image: '', views: undefined }, S1] })
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    expect(rowOfTitle('Birinchi yangilik').querySelector('img')).toHaveAttribute('src', 'https://s/1.jpg')
    const empty = rowOfTitle('Rasmsiz')
    expect(empty.querySelector('img')).toBeNull()
    expect(empty.querySelector('.adm-item-thumb')).toHaveClass('adm-item-thumb--empty')
    expect(within(empty).getByText('0')).toBeInTheDocument()
    expect(rowOfTitle('Shorts video').querySelector('.adm-item-thumb')).toHaveClass('adm-item-thumb--shorts')
  })

  it('yuklanmagan miniatyura `data-broken` oladi (inline stil yo\'q)', async () => {
    mockApi({ 'GET /news': [N1] })
    const { container } = render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    const img = container.querySelector('.adm-item-thumb-img')
    fireEvent.error(img)
    expect(img.dataset.broken).toBe('true')
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it('so\'rov yuklanayotganda skelet (`aria-busy`), sarlavha hisoblagichi "–"', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { container } = render(<NewsAdmin />)
    expect(container.querySelector('.adm-skel-list')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()
    expect(container.querySelector('.adm-page-head .adm-count-pill')).toHaveTextContent('–')
  })

  // 6.24: avval `.catch(() => {})` xatoni yutardi va «Hali yangilik yo'q» chiqardi; endi xato paneli + «Qayta urinish»
  it('GET xatosi — xato paneli (jim bo\'sh ro\'yxat emas); «Qayta urinish» qayta yuklaydi', async () => {
    let ok = false
    mockApi({ 'GET /news': () => (ok ? [N1] : { status: 500, body: { error: 'Server xatosi' } }) })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    expect(await screen.findByRole('alert')).toHaveTextContent("Yangiliklarni yuklab bo'lmadi.")
    expect(screen.queryByText("Hali yangilik yo'q")).not.toBeInTheDocument()
    ok = true
    await user.click(screen.getByRole('button', { name: 'Qayta urinish' }))
    expect(await screen.findByText('Birinchi yangilik')).toBeInTheDocument()
    expect(screen.queryByText("Yangiliklarni yuklab bo'lmadi.")).not.toBeInTheDocument()
  })

  it('tarmoq xatosida ham xato paneli', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<NewsAdmin />)
    expect(await screen.findByText("Yangiliklarni yuklab bo'lmadi.")).toBeInTheDocument()
  })

  it('bo\'sh ro\'yxat — «Hali yangilik yo\'q» va tugma formani ochadi', async () => {
    mockApi({ 'GET /news': [] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    expect(await screen.findByText("Hali yangilik yo'q")).toBeInTheDocument()
    const buttons = screen.getAllByRole('button', { name: 'Yangi yangilik' })
    expect(buttons).toHaveLength(2)
    await user.click(buttons[1])
    expect(titleInput()).toBeInTheDocument()
    expect(screen.queryByText("Hali yangilik yo'q")).not.toBeInTheDocument()
  })

  it('XSS: sarlavhadagi HTML matn sifatida ko\'rsatiladi', async () => {
    mockApi({ 'GET /news': [{ ...N1, title: '<img src=x onerror=alert(1)>' }] })
    render(<NewsAdmin />)
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })
})

describe('NewsAdmin: forma', () => {
  it('«Yangi yangilik» formani ochadi, fokus sarlavhada; yorliqlar inputlarga bog\'langan; hisoblagichlar', async () => {
    mockApi({ 'GET /news': [N1] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    const title = await openForm(user)
    expect(screen.getByRole('form', { name: 'Yangi yangilik' })).toBeInTheDocument()
    expect(title).toHaveFocus()
    expect(title).toHaveAttribute('maxlength', '300')
    expect(title).toHaveAttribute('aria-required', 'true')
    expect(screen.getByLabelText('Kategoriya')).toHaveValue('Umumiy')
    expect(screen.getByLabelText('YouTube Shorts havolasi')).toBeInTheDocument()
    expect(screen.getByLabelText('Matn')).toHaveAttribute('maxlength', '50000')
    expect(screen.getByText('0 / 300')).toBeInTheDocument()
    expect(screen.getByText(/^0\s\/\s50\s000$/)).toBeInTheDocument()
    await user.type(title, 'Salom')
    expect(screen.getByText('5 / 300')).toBeInTheDocument()
  })

  it('Shorts maydoni izohga `aria-describedby` bilan bog\'langan', async () => {
    mockApi({ 'GET /news': [] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText("Hali yangilik yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi yangilik' })[0])
    expect(screen.getByLabelText('YouTube Shorts havolasi')).toHaveAccessibleDescription(/Faqat Shorts bo'lsa to'ldiring/)
  })

  // 6.24: avval `alert('Sarlavha kiritilishi shart!')` — endi maydon ostida `role="alert"`, `aria-invalid`, `aria-describedby`
  it('sarlavhasiz saqlab bo\'lmaydi: maydon ostida xabar, fokus shu maydonda, alert() yo\'q, so\'rov ketmaydi', async () => {
    const api = mockApi({ 'GET /news': [] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText("Hali yangilik yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi yangilik' })[0])
    await submit(user)
    const title = titleInput()
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Sarlavha kiritilishi shart.')
    expect(screen.getByRole('alert')).toHaveTextContent('Sarlavha kiritilishi shart.')
    expect(title).toHaveFocus()
    expect(alert).not.toHaveBeenCalled()
    expect(api.find('POST', '/news')).toHaveLength(0)
    // yozishni boshlasa xato yo'qoladi
    await user.type(title, 'X')
    expect(title).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('Sarlavha kiritilishi shart.')).not.toBeInTheDocument()
  })

  it('faqat bo\'sh joydan iborat sarlavha ham rad etiladi', async () => {
    const api = mockApi({ 'GET /news': [] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText("Hali yangilik yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi yangilik' })[0])
    await user.type(titleInput(), '   ')
    await submit(user)
    expect(screen.getByRole('alert')).toHaveTextContent('Sarlavha kiritilishi shart.')
    expect(api.find('POST', '/news')).toHaveLength(0)
  })

  it('yaroqsiz Shorts URL rad etiladi: maydon ostida xabar, fokus Shorts maydonida', async () => {
    const api = mockApi({ 'GET /news': [] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText("Hali yangilik yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi yangilik' })[0])
    await user.type(titleInput(), 'Sarlavha')
    await user.type(screen.getByLabelText('YouTube Shorts havolasi'), 'https://evil.com/x')
    await submit(user)
    const shorts = screen.getByLabelText('YouTube Shorts havolasi')
    expect(shorts).toHaveAttribute('aria-invalid', 'true')
    expect(shorts).toHaveAccessibleDescription(/To'g'ri YouTube Shorts havolasini kiriting/)
    expect(shorts).toHaveFocus()
    expect(alert).not.toHaveBeenCalled()
    expect(api.find('POST', '/news')).toHaveLength(0)
  })

  it('yaratish: multipart FormData, Content-Type qo\'lda qo\'yilmaydi, token yuboriladi, ro\'yxat boshiga qo\'shiladi, forma yopiladi', async () => {
    const created = { _id: 'n9', title: 'Yangi sarlavha', createdAt: '2026-02-01T00:00:00Z' }
    const api = mockApi({ 'GET /news': [N1], 'POST /news': created })
    const user = userEvent.setup()
    const { container } = render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await openForm(user)
    await user.type(titleInput(), '  Yangi sarlavha  ')
    await user.upload(container.querySelector('input[type=file]'), [png('a.png'), png('b.png')])
    await user.type(screen.getByLabelText('YouTube Shorts havolasi'), 'https://youtube.com/shorts/dQw4w9WgXcQ')
    await submit(user)

    expect(await screen.findByRole('heading', { name: 'Yangi sarlavha' })).toBeInTheDocument()
    const [call] = api.find('POST', '/news')
    expect(call.body).toBeInstanceOf(FormData)
    expect(call.headers).toEqual({ Authorization: 'Bearer tok' })
    expect(call.headers['Content-Type']).toBeUndefined()
    expect(call.body.get('title')).toBe('Yangi sarlavha')
    expect(call.body.get('videoId')).toBe('dQw4w9WgXcQ')
    expect(call.body.get('existingImages')).toBe('[]')
    expect(call.body.getAll('imageFiles').map(f => f.name)).toEqual(['a.png', 'b.png'])
    expect(screen.queryByLabelText(/^Sarlavha/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Yangiliklar' })).toHaveFocus()
  })

  it('tahrirlash: forma to\'ldiriladi, PUT /news/:id, mavjud URL lar existingImages da qoladi, ro\'yxat yangilanadi', async () => {
    const updated = { ...N1, title: 'Tahrirlangan' }
    const api = mockApi({ 'GET /news': [N1], 'PUT /news/n1': updated })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrirlash: Birinchi yangilik/ }))
    expect(screen.getByRole('form', { name: 'Tahrirlash' })).toBeInTheDocument()
    const title = titleInput()
    expect(title).toHaveValue('Birinchi yangilik')
    expect(screen.getByLabelText('Kategoriya')).toHaveValue('Sport')
    expect(title).toHaveFocus()
    await user.clear(title); await user.type(title, 'Tahrirlangan')
    await submit(user, 'Saqlash')
    expect(await screen.findByRole('heading', { name: 'Tahrirlangan' })).toBeInTheDocument()
    const [call] = api.find('PUT', '/news/n1')
    expect(JSON.parse(call.body.get('existingImages'))).toEqual(['https://s/1.jpg', 'https://s/2.jpg'])
    expect(screen.queryByText('Birinchi yangilik')).not.toBeInTheDocument()
  })

  it('Shorts yangilikni tahrirlashda havola videoId dan tiklanadi', async () => {
    mockApi({ 'GET /news': [S1] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrirlash: Shorts video/ }))
    expect(screen.getByLabelText('YouTube Shorts havolasi')).toHaveValue('https://youtube.com/shorts/dQw4w9WgXcQ')
  })

  it('ro\'yxatda yo\'q kategoriya jimgina boshqasiga almashmaydi (select ga qo\'shiladi)', async () => {
    const api = mockApi({ 'GET /news': [{ ...N1, category: 'Eski kategoriya' }], 'PUT /news/n1': N1 })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrirlash/ }))
    expect(screen.getByLabelText('Kategoriya')).toHaveValue('Eski kategoriya')
    await submit(user, 'Saqlash')
    await waitFor(() => expect(api.find('PUT', '/news/n1')).toHaveLength(1))
    expect(api.find('PUT', '/news/n1')[0].body.get('category')).toBe('Eski kategoriya')
  })

  it('tahrirlashda mavjud rasm olib tashlansa — existingImages dan chiqadi', async () => {
    const api = mockApi({ 'GET /news': [N1], 'PUT /news/n1': N1 })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrirlash/ }))
    await user.click(screen.getAllByRole('button', { name: 'Rasmni olib tashlash' })[0])
    await submit(user, 'Saqlash')
    await waitFor(() => expect(api.find('PUT', '/news/n1')).toHaveLength(1))
    expect(JSON.parse(api.find('PUT', '/news/n1')[0].body.get('existingImages'))).toEqual(['https://s/2.jpg'])
  })

  it('miniatyuralar: birinchisida «Muqova», yangi tanlanganda «Yangi» + `data-new`', async () => {
    mockApi({ 'GET /news': [N1] })
    const user = userEvent.setup()
    const { container } = render(<NewsAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrirlash/ }))
    expect(screen.getByText('Muqova')).toBeInTheDocument()
    expect(screen.queryByText('Yangi')).not.toBeInTheDocument()
    await user.upload(container.querySelector('input[type=file]'), png('n.png'))
    const thumbs = [...container.querySelectorAll('.adm-ithumb')]
    expect(thumbs.map(t => t.dataset.new)).toEqual(['false', 'false', 'true'])
    expect(within(thumbs[2]).getByText('Yangi')).toBeInTheDocument()
    expect(screen.getByText('3 ta')).toBeInTheDocument()
    fireEvent.error(thumbs[0].querySelector('img'))
    expect(thumbs[0].querySelector('img').dataset.broken).toBe('true')
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it('izoh: birinchi rasm muqova bo\'lishi aytilgan', async () => {
    mockApi({ 'GET /news': [N1] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await openForm(user)
    expect(screen.getByText(/Birinchi rasm muqova bo'ladi/)).toBeInTheDocument()
  })
})

describe('NewsAdmin: rasm yuklash', () => {
  const setup = async () => {
    mockApi({ 'GET /news': [N1] })
    const user = userEvent.setup()
    const view = render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await openForm(user)
    return { user, input: view.container.querySelector('input[type=file]'), ...view }
  }

  it('yaroqsiz fayl turi — yuklash maydoni ostida xabar (alert() emas), hech narsa qo\'shilmaydi', async () => {
    const { container } = await setup()
    fireEvent.change(container.querySelector('input[type=file]'), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } })
    expect(screen.getByRole('alert')).toHaveTextContent('Faqat rasm fayllari qabul qilinadi')
    expect(container.querySelector('input[type=file]')).toHaveAccessibleDescription(/Faqat rasm fayllari qabul qilinadi/)
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(0)
    expect(alert).not.toHaveBeenCalled()
  })

  it('5 MB dan katta fayl — nomi bilan xabar; keyingi muvaffaqiyatli tanlov xabarni tozalaydi', async () => {
    const { user, input, container } = await setup()
    await user.upload(input, png('yangi-yil-banneri.png', 5 * 1024 * 1024 + 1))
    expect(screen.getByRole('alert')).toHaveTextContent('yangi-yil-banneri.png — 5 MB dan katta. Boshqa rasm tanlang.')
    await user.upload(input, png('ok.png'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(1)
  })

  it('jami 10 tadan ko\'p rasm qo\'shib bo\'lmaydi', async () => {
    const { user, input, container } = await setup()
    await user.upload(input, Array.from({ length: 10 }, (_, i) => png(`${i}.png`)))
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(10)
    await user.upload(input, png('11.png'))
    expect(screen.getByRole('alert')).toHaveTextContent("Ko'pi bilan 10 ta rasm qo'shish mumkin.")
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(10)
  })

  it('drag-and-drop: maydon ustida «Rasmlarni bu yerga tashlang», tashlanganda fayllar qo\'shiladi', async () => {
    const { container } = await setup()
    const zone = container.querySelector('.adm-dz')
    const dataTransfer = { types: ['Files'], files: [png('d1.png'), png('d2.png')] }
    fireEvent.dragEnter(zone, { dataTransfer })
    expect(zone).toHaveAttribute('data-drag', 'true')
    expect(screen.getByText('Rasmlarni bu yerga tashlang')).toBeInTheDocument()
    fireEvent.drop(zone, { dataTransfer })
    expect(zone).toHaveAttribute('data-drag', 'false')
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(2)
    expect(screen.getByText("Rasm qo'shish")).toBeInTheDocument()
  })

  it('drag: fayl bo\'lmagan narsa (matn/havola) sudralganda maydon yoqilmaydi; ketganda o\'chadi', async () => {
    const { container } = await setup()
    const zone = container.querySelector('.adm-dz')
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['text/plain'], files: [] } })
    expect(zone).toHaveAttribute('data-drag', 'false')
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'], files: [] } })
    expect(zone).toHaveAttribute('data-drag', 'true')
    fireEvent.dragLeave(zone, { dataTransfer: { types: ['Files'], files: [] }, relatedTarget: document.body })
    expect(zone).toHaveAttribute('data-drag', 'false')
  })

  it('fayl kiritish klaviaturadan fokuslanadi (`hidden`/`display:none` emas)', async () => {
    const { container } = await setup()
    const input = container.querySelector('input[type=file]')
    expect(input).not.toHaveAttribute('hidden')
    expect(input).toHaveClass('adm-sr-only')
  })
})

describe('NewsAdmin: saqlash holatlari', () => {
  // 6.24: avval `alert(msg)`; endi forma tepasida banner, forma ochiq va to'ldirilgan holda qoladi
  it('server xatosi (ok:false) — banner, forma ochiq va to\'ldirilgan, tugma faol, ro\'yxat o\'zgarmaydi, alert() yo\'q', async () => {
    mockApi({ 'GET /news': [N1], 'POST /news': { status: 400, body: { error: "Rasm turi noto'g'ri" } } })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await openForm(user)
    await user.type(titleInput(), 'X')
    await submit(user)
    const banner = await screen.findByRole('alert')
    expect(banner).toHaveTextContent("Rasm turi noto'g'ri — kiritilgan ma'lumotlar saqlanib turibdi, qayta urinib ko'ring.")
    expect(titleInput()).toHaveValue('X')
    expect(screen.getByRole('button', { name: "Qo'shish" })).toBeEnabled()
    expect(alert).not.toHaveBeenCalled()
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(1)
  })

  it('tarmoq xatosi — banner, tugma qayta faollashadi (qotib qolmaydi), forma ochiq', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'POST' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))))
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText("Hali yangilik yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi yangilik' })[0])
    await user.type(titleInput(), 'Sarlavha')
    await submit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent("Yangilik saqlanmadi. Server bilan bog'lanib bo'lmadi — kiritilgan ma'lumotlar saqlanib turibdi, qayta urinib ko'ring.")
    expect(screen.getByRole('button', { name: "Qo'shish" })).toBeEnabled()
    expect(titleInput()).toHaveValue('Sarlavha')
  })

  it('JSON bo\'lmagan xato javob (502) — standart xabar, tugma faol', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'POST'
      ? Promise.resolve({ ok: false, status: 502, json: () => Promise.reject(new SyntaxError('html')) })
      : Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))))
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText("Hali yangilik yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi yangilik' })[0])
    await user.type(titleInput(), 'Sarlavha')
    await submit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent('Yangilik saqlanmadi — kiritilgan')
    expect(screen.getByRole('button', { name: "Qo'shish" })).toBeEnabled()
  })

  it('saqlanayotganda: maydonlar `disabled`, tugma `aria-busy` («Saqlanmoqda...»), holat xabari, qayta bosib bo\'lmaydi', async () => {
    let resolve
    const api = mockApi({ 'GET /news': [N1], 'POST /news': () => new Promise(r => { resolve = r }) })
    // mockApi funksiya natijasini sinxron kutadi — qo'lda kechiktiriladigan POST
    const base = globalThis.fetch
    vi.stubGlobal('fetch', vi.fn((url, init = {}) => (init.method === 'POST'
      ? new Promise(r => { resolve = () => r({ ok: true, status: 200, json: () => Promise.resolve({ _id: 'n9', title: 'Z', createdAt: '2026-02-01T00:00:00Z' }) }) })
      : base(url, init))))
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await openForm(user)
    await user.type(titleInput(), 'Z')
    await submit(user)
    const btn = await screen.findByRole('button', { name: 'Saqlanmoqda...' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
    expect(titleInput()).toBeDisabled()
    expect(screen.getByLabelText('Matn')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Bekor qilish' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Formani yopish' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Rasmlar yuklanmoqda va yangilik saqlanmoqda...')
    resolve()
    expect(await screen.findByRole('heading', { name: 'Z' })).toBeInTheDocument()
    expect(api.find('POST', '/news')).toHaveLength(0) // mockApi POST ga yetmadi — stub orqali o'tdi
  })
})

describe('NewsAdmin: o\'chirish', () => {
  const del = (user, title = 'Birinchi yangilik') => user.click(screen.getByRole('button', { name: `O'chirish: ${title}` }))

  // 6.24: `window.confirm` o'rniga `alertdialog` (Arizalar bilan bir xil qoida)
  it('dialog sarlavha bilan so\'raydi; tasdiqlansa DELETE yuboriladi va ro\'yxatdan olinadi', async () => {
    const api = mockApi({ 'GET /news': [N1, S1], 'DELETE /news/n1': { success: true } })
    const confirmSpy = vi.spyOn(window, 'confirm')
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await del(user)
    const dialog = screen.getByRole('alertdialog', { name: "Yangilikni o'chirishni tasdiqlaysizmi?" })
    expect(dialog).toHaveTextContent('«Birinchi yangilik» yangiligi butunlay o\'chiriladi. Bu amalni qaytarib bo\'lmaydi.')
    expect(api.find('DELETE', '/news/n1')).toHaveLength(0)
    await user.click(within(dialog).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByText('Birinchi yangilik')).not.toBeInTheDocument())
    expect(api.find('DELETE', '/news/n1')[0].headers.Authorization).toBe('Bearer tok')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(confirmSpy).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { level: 2, name: 'Yangiliklar' })).toHaveFocus()
  })

  it('bekor qilinsa hech narsa yuborilmaydi, fokus o\'chirish tugmasiga qaytadi', async () => {
    const api = mockApi({ 'GET /news': [N1] })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await del(user)
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(api.find('DELETE', '/news/n1')).toHaveLength(0)
    expect(screen.getByText('Birinchi yangilik')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "O'chirish: Birinchi yangilik" })).toHaveFocus()
  })

  it('server DELETE ni rad etsa (500) — element qoladi, banner server xabari bilan, dialog yopiladi', async () => {
    mockApi({ 'GET /news': [N1], 'DELETE /news/n1': { status: 500, body: { error: 'Baza xatosi' } } })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await del(user)
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Baza xatosi')
    expect(screen.getByText('Birinchi yangilik')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(alert).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(screen.queryByText('Baza xatosi')).not.toBeInTheDocument()
  })

  it('DELETE tarmoq xatosi — element qoladi, xabar ko\'rsatiladi', async () => {
    vi.stubGlobal('fetch', vi.fn(u => (String(u).endsWith('/news') ? Promise.resolve({ ok: true, json: () => Promise.resolve([N1]) }) : Promise.reject(new Error('net')))))
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await del(user)
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    expect(await screen.findByRole('alert')).toHaveTextContent("Server bilan bog'lanib bo'lmadi.")
    expect(screen.getByText('Birinchi yangilik')).toBeInTheDocument()
  })

  it('tahrirlanayotgan yangilik o\'chirilsa forma ham yopiladi', async () => {
    mockApi({ 'GET /news': [N1], 'DELETE /news/n1': { success: true } })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await user.click(await screen.findByRole('button', { name: /Tahrirlash: Birinchi yangilik/ }))
    expect(titleInput()).toBeInTheDocument()
    await del(user)
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" }))
    await waitFor(() => expect(screen.queryByLabelText(/^Sarlavha/)).not.toBeInTheDocument())
  })
})

describe('NewsAdmin: saqlanmagan o\'zgarishlar', () => {
  const setup = async () => {
    mockApi({ 'GET /news': [N1, { ...N1, _id: 'n2', title: 'Ikkinchi yangilik' }] })
    const user = userEvent.setup()
    const view = render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    return { user, ...view }
  }
  const dialogName = "Saqlanmagan o'zgarishlar bor"

  // 6.24: avval «Bekor» forma ma'lumotini jimgina tozalardi
  it('o\'zgarmagan forma — «Bekor qilish» dialogsiz yopadi', async () => {
    const { user } = await setup()
    await openForm(user)
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^Sarlavha/)).not.toBeInTheDocument()
  })

  it('o\'zgargan forma — «Bekor qilish» dialog ochadi; fokus «Tahrirlashda qolish»da; qolsa forma saqlanadi', async () => {
    const { user } = await setup()
    await openForm(user)
    await user.type(titleInput(), 'Yarim')
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    const dialog = screen.getByRole('alertdialog', { name: dialogName })
    expect(within(dialog).getByRole('button', { name: 'Tahrirlashda qolish' })).toHaveFocus()
    await user.click(within(dialog).getByRole('button', { name: 'Tahrirlashda qolish' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(titleInput()).toHaveValue('Yarim')
  })

  it('«Chiqish» formani yopadi va kiritilganni tashlaydi; qayta ochilganda forma toza', async () => {
    const { user } = await setup()
    await openForm(user)
    await user.type(titleInput(), 'Yarim')
    await user.click(screen.getByRole('button', { name: 'Formani yopish' }))
    await user.click(within(screen.getByRole('alertdialog', { name: dialogName })).getByRole('button', { name: 'Chiqish' }))
    expect(screen.queryByLabelText(/^Sarlavha/)).not.toBeInTheDocument()
    expect(await openForm(user)).toHaveValue('')
  })

  it('Esc dialogni yopadi (formada qoladi)', async () => {
    const { user } = await setup()
    await openForm(user)
    await user.type(titleInput(), 'Yarim')
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(titleInput()).toHaveValue('Yarim')
  })

  it('yangi fayl tanlash ham o\'zgarish hisoblanadi', async () => {
    const { user, container } = await setup()
    await openForm(user)
    await user.upload(container.querySelector('input[type=file]'), png('n.png'))
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.getByRole('alertdialog', { name: dialogName })).toBeInTheDocument()
  })

  it('tahrirlashda mavjud rasm olib tashlansa ham o\'zgarish hisoblanadi; asl holatiga qaytarilsa (matn) — yo\'q', async () => {
    const { user } = await setup()
    await user.click(screen.getByRole('button', { name: /Tahrirlash: Birinchi yangilik/ }))
    await user.click(screen.getAllByRole('button', { name: 'Rasmni olib tashlash' })[0])
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.getByRole('alertdialog', { name: dialogName })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Chiqish' }))
    await user.click(screen.getByRole('button', { name: /Tahrirlash: Birinchi yangilik/ }))
    await user.type(titleInput(), 'x')
    await user.type(titleInput(), '{Backspace}')
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('tahrirlash paytida o\'zgartirilgan bo\'lsa «Yangi yangilik» dialog ochadi; «Chiqish» — toza yangi forma', async () => {
    const { user } = await setup()
    await user.click(screen.getByRole('button', { name: /Tahrirlash: Birinchi yangilik/ }))
    await user.type(titleInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Yangi yangilik' }))
    await user.click(screen.getByRole('button', { name: 'Chiqish' }))
    expect(screen.getByRole('form', { name: 'Yangi yangilik' })).toBeInTheDocument()
    expect(titleInput()).toHaveValue('')
  })

  it('o\'zgargan forma ochiq paytda boshqa yangilikni tahrirlash — dialog; «Chiqish» boshqasini ochadi', async () => {
    const { user } = await setup()
    await user.click(screen.getByRole('button', { name: /Tahrirlash: Birinchi yangilik/ }))
    await user.type(titleInput(), '!')
    await user.click(screen.getByRole('button', { name: /Tahrirlash: Ikkinchi yangilik/ }))
    expect(screen.getByRole('alertdialog', { name: dialogName })).toBeInTheDocument()
    expect(titleInput()).toHaveValue('Birinchi yangilik!')
    await user.click(screen.getByRole('button', { name: 'Chiqish' }))
    expect(titleInput()).toHaveValue('Ikkinchi yangilik')
  })

  it('yangi forma ochiq bo\'lsa «Yangi yangilik» ma\'lumotni tozalamaydi — faqat sarlavhaga fokus', async () => {
    const { user } = await setup()
    await openForm(user)
    await user.type(titleInput(), 'Yarim')
    await user.click(screen.getByRole('button', { name: 'Yangi yangilik' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(titleInput()).toHaveValue('Yarim')
    expect(titleInput()).toHaveFocus()
  })

  it('o\'zgarmagan tahrirlash formasi ustida boshqa yangilikni tahrirlash dialogsiz almashadi', async () => {
    const { user } = await setup()
    await user.click(screen.getByRole('button', { name: /Tahrirlash: Birinchi yangilik/ }))
    await user.click(screen.getByRole('button', { name: /Tahrirlash: Ikkinchi yangilik/ }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(titleInput()).toHaveValue('Ikkinchi yangilik')
  })

  it('muvaffaqiyatli saqlangandan keyin dialog chiqmaydi (forma toza yopiladi)', async () => {
    mockApi({ 'GET /news': [], 'POST /news': { _id: 'n9', title: 'Yangi', createdAt: '2026-02-01T00:00:00Z' } })
    const user = userEvent.setup()
    render(<NewsAdmin />)
    await screen.findByText("Hali yangilik yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi yangilik' })[0])
    await user.type(titleInput(), 'Yangi')
    await submit(user)
    await screen.findByRole('heading', { name: 'Yangi' })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})

describe('NewsAdmin: kod qoidalari', () => {
  it('inline stil yo\'q (ro\'yxat, forma, dialoglar)', async () => {
    mockApi({ 'GET /news': [N1, S1] })
    const user = userEvent.setup()
    const { container } = render(<NewsAdmin />)
    await screen.findByText('Birinchi yangilik')
    await user.click(screen.getByRole('button', { name: /Tahrirlash: Birinchi yangilik/ }))
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })
})
