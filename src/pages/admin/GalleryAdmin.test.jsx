import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GalleryAdmin from './GalleryAdmin'
import { mockApi } from '../../test/helpers'

const imgs = n => Array.from({ length: n }, (_, i) => `https://s/${i + 1}.jpg`)
const G1 = { _id: 'g1', title: '1-kampus', desc: 'Kampus binosi', images: ['https://s/1.jpg', 'https://s/2.jpg'], createdAt: '2026-01-02T12:00:00Z' }
const G3 = { _id: 'g3', title: 'Katta albom', desc: '', images: imgs(5), createdAt: '2026-03-05T12:00:00Z' }
const png = (name = 'a.png', size = 1000) => { const f = new File(['x'], name, { type: 'image/png' }); Object.defineProperty(f, 'size', { value: size }); return f }

let blobN
beforeEach(() => {
  vi.stubGlobal('alert', vi.fn())
  blobN = 0
  URL.createObjectURL = vi.fn(() => `blob:x${++blobN}`); URL.revokeObjectURL = vi.fn()
  localStorage.setItem('kiu_token', 'tok')
})

const titleInput = () => screen.getByLabelText(/^Nomi/)
const fileInput = container => container.querySelector('input[type=file]')
// bo'sh ro'yxatda «Yangi albom» ikki joyda (sahifa boshi va bo'sh holat) — birinchisi (sahifa boshi)
const openForm = async user => { await user.click(screen.getAllByRole('button', { name: 'Yangi albom' })[0]); return titleInput() }
const submit = (user, name = /Qo'shish|Saqlash/) => user.click(screen.getByRole('button', { name }))
const cardOf = title => screen.getByRole('heading', { name: title }).closest('li')

describe('GalleryAdmin: ro\'yxat', () => {
  it('sarlavha, albomlar soni nishoni va «jami N ta rasm»; kartada nom, tavsif, sana, rasm soni', async () => {
    mockApi({ 'GET /gallery': [G1, G3] })
    const { container } = render(<GalleryAdmin />)
    expect(await screen.findByRole('heading', { name: '1-kampus' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Talabalar hayoti' })).toBeInTheDocument()
    expect(container.querySelector('.adm-page-head .adm-count-pill')).toHaveTextContent('Albomlar: 2')
    expect(screen.getByText('jami 7 ta rasm')).toBeInTheDocument()
    const card = cardOf('1-kampus')
    expect(within(card).getByText('Kampus binosi')).toBeInTheDocument()
    expect(within(card).getByText('2 ta rasm')).toBeInTheDocument()
    expect(within(card).getByText(/^2 yanvar 2026$/)).toBeInTheDocument()
    expect(within(cardOf('Katta albom')).getByText('5 ta rasm')).toBeInTheDocument()
  })

  it('mozaika: 1 → to\'liq, 2 → yarim-yarim, 3 va undan ko\'p → faqat birinchi 3 rasm (katta + 2 kichik)', async () => {
    mockApi({ 'GET /gallery': [
      { ...G1, _id: 'a', title: 'A', images: imgs(1) },
      { ...G1, _id: 'b', title: 'B', images: imgs(2) },
      { ...G1, _id: 'c', title: 'C', images: imgs(10) },
    ] })
    render(<GalleryAdmin />)
    await screen.findByText('A')
    const mosaic = t => cardOf(t).querySelector('.adm-album-mosaic')
    expect(mosaic('A')).toHaveAttribute('data-count', '1')
    expect(mosaic('A').querySelectorAll('img')).toHaveLength(1)
    expect(mosaic('B')).toHaveAttribute('data-count', '2')
    expect(mosaic('B').querySelectorAll('img')).toHaveLength(2)
    expect(mosaic('C')).toHaveAttribute('data-count', '3')
    expect(mosaic('C').querySelectorAll('img')).toHaveLength(3)
    // belgi — albomdagi HAMMA rasm soni, mozaikadagisi emas
    expect(within(cardOf('C')).getByText('10 ta rasm')).toBeInTheDocument()
  })

  it('rasmlar lazy/async yuklanadi (mozaika 3 ta original rasmni birdan olmasin)', async () => {
    mockApi({ 'GET /gallery': [G3] })
    render(<GalleryAdmin />)
    await screen.findByText('Katta albom')
    for (const img of cardOf('Katta albom').querySelectorAll('img')) {
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).toHaveAttribute('decoding', 'async')
    }
  })

  it('bitta rasm yuklanmasa — o\'sha katak xiralashadi; hammasi yuklanmasa — «Rasm yuklanmadi» bloki, belgi qoladi', async () => {
    mockApi({ 'GET /gallery': [G3] })
    render(<GalleryAdmin />)
    await screen.findByText('Katta albom')
    const card = cardOf('Katta albom')
    const tiles = card.querySelectorAll('.adm-album-tile')
    expect(tiles).toHaveLength(3)
    fireEvent.error(tiles[0])
    expect(tiles[0].dataset.broken).toBe('true')
    expect(within(card).queryByText('Rasm yuklanmadi')).not.toBeInTheDocument()
    fireEvent.error(tiles[1]); fireEvent.error(tiles[2])
    expect(within(card).getByText('Rasm yuklanmadi')).toBeInTheDocument()
    expect(card.querySelectorAll('.adm-album-tile')).toHaveLength(0)
    expect(within(card).getByText('5 ta rasm')).toBeInTheDocument()
  })

  it('rasmsiz albom (eski/buzuq ma\'lumot) — qulamaydi, «Rasm yo\'q» bloki', async () => {
    mockApi({ 'GET /gallery': [{ _id: 'x', title: 'Bo\'sh', createdAt: '2026-01-01T00:00:00Z' }] })
    render(<GalleryAdmin />)
    const card = (await screen.findByRole('heading', { name: "Bo'sh" })).closest('li')
    expect(within(card).getByText("Rasm yo'q")).toBeInTheDocument()
    expect(within(card).getByText('0 ta rasm')).toBeInTheDocument()
  })

  it('tahrirlash va o\'chirish tugmalari aria-label da albom nomi bilan', async () => {
    mockApi({ 'GET /gallery': [G1] })
    render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    expect(screen.getByRole('button', { name: 'Tahrirlash: 1-kampus' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "O'chirish: 1-kampus" })).toBeInTheDocument()
  })

  it('so\'rov yuklanayotganda skelet (`aria-busy`), nishon "–"', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { container } = render(<GalleryAdmin />)
    expect(container.querySelector('.adm-skel-list')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()
    expect(container.querySelector('.adm-page-head .adm-count-pill')).toHaveTextContent('–')
    expect(screen.queryByText(/^jami/)).not.toBeInTheDocument()
  })

  // 6.26: avval `.catch(() => {})` xatoni yutardi va «Hali albom qo'shilmagan» chiqardi; endi xato paneli + «Qayta urinish»
  it('GET xatosi — xato paneli (jim bo\'sh ro\'yxat emas); «Qayta urinish» qayta yuklaydi', async () => {
    let ok = false
    mockApi({ 'GET /gallery': () => (ok ? [G1] : { status: 500, body: { error: 'Server xatosi' } }) })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    expect(await screen.findByRole('alert')).toHaveTextContent("Albomlarni yuklab bo'lmadi.")
    expect(screen.queryByText("Hali albom yo'q")).not.toBeInTheDocument()
    ok = true
    await user.click(screen.getByRole('button', { name: 'Qayta urinish' }))
    expect(await screen.findByText('1-kampus')).toBeInTheDocument()
    expect(screen.queryByText("Albomlarni yuklab bo'lmadi.")).not.toBeInTheDocument()
  })

  it('tarmoq xatosida ham xato paneli', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    render(<GalleryAdmin />)
    expect(await screen.findByRole('alert')).toHaveTextContent("Albomlarni yuklab bo'lmadi.")
  })

  it('bo\'sh ro\'yxat: «Hali albom yo\'q» + tugma formani ochadi', async () => {
    mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    expect(await screen.findByText("Hali albom yo'q")).toBeInTheDocument()
    const buttons = screen.getAllByRole('button', { name: 'Yangi albom' })
    await user.click(buttons[buttons.length - 1])
    expect(titleInput()).toBeInTheDocument()
    expect(screen.queryByText("Hali albom yo'q")).not.toBeInTheDocument()
  })

  it('XSS: nom va tavsifdagi HTML matn sifatida ko\'rsatiladi', async () => {
    mockApi({ 'GET /gallery': [{ ...G1, title: '<img src=x onerror=alert(1)>', desc: '<script>alert(2)</script>' }] })
    render(<GalleryAdmin />)
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(screen.getByText('<script>alert(2)</script>')).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })

  it('inline stil yo\'q (karta, mozaika, forma, plitkalar)', async () => {
    mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await user.click(screen.getByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(2)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })
})

describe('GalleryAdmin: forma', () => {
  it('yorliqlar inputlarga bog\'langan; hisoblagichlar «N / 200» va «N / 500»; maxLength; «Rasmlar 0 / 10»', async () => {
    mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    expect(screen.getByRole('form', { name: 'Yangi albom' })).toBeInTheDocument()
    expect(titleInput()).toHaveAttribute('maxlength', '200')
    expect(screen.getByLabelText('Tavsif')).toHaveAttribute('maxlength', '500')
    expect(screen.getByLabelText('Tavsif').tagName).toBe('TEXTAREA')
    expect(screen.getByText('0 / 200')).toBeInTheDocument()
    expect(screen.getByText('0 / 500')).toBeInTheDocument()
    expect(screen.getByText('0 / 10')).toBeInTheDocument()
    await user.type(titleInput(), 'Salom')
    expect(screen.getByText('5 / 200')).toBeInTheDocument()
  })

  it('forma ochilganda fokus nomda; yordam matni va «* majburiy maydon» bor', async () => {
    mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    expect(titleInput()).toHaveFocus()
    expect(screen.getByText('har bir rasm alohida karta').tagName).toBe('STRONG')
    expect(screen.getByText('* majburiy maydon')).toBeInTheDocument()
  })

  // 6.26: avval `alert('Nom kiritilishi shart!')` va `alert('Kamida bitta rasm tanlang!')` ketma-ket chiqardi
  it('validatsiya: bo\'sh forma — ikkala xabar maydon ostida (`alert()` yo\'q), so\'rov ketmaydi, fokus nomda', async () => {
    const api = mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    await submit(user)
    const alerts = screen.getAllByRole('alert').map(a => a.textContent)
    expect(alerts).toEqual(expect.arrayContaining(['Albom nomini kiriting.', 'Kamida bitta rasm tanlang.']))
    expect(titleInput()).toHaveAttribute('aria-invalid', 'true')
    expect(titleInput()).toHaveFocus()
    expect(alert).not.toHaveBeenCalled()
    expect(api.find('POST', '/gallery')).toHaveLength(0)
  })

  it('nom yozilsa xato yo\'qoladi; rasm tanlansa «Kamida bitta rasm» xabari yo\'qoladi', async () => {
    mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    await submit(user)
    await user.type(titleInput(), 'A')
    expect(screen.queryByText('Albom nomini kiriting.')).not.toBeInTheDocument()
    expect(screen.getByText('Kamida bitta rasm tanlang.')).toBeInTheDocument()
    expect(container.querySelector('.adm-dz')).toHaveAttribute('data-invalid', 'true')
    await user.upload(fileInput(container), png())
    expect(screen.queryByText('Kamida bitta rasm tanlang.')).not.toBeInTheDocument()
    expect(container.querySelector('.adm-dz')).not.toHaveAttribute('data-invalid')
  })

  it('faqat bo\'sh joylardan iborat nom — xato', async () => {
    const api = mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    await user.type(titleInput(), '   ')
    await user.upload(fileInput(container), png())
    await submit(user)
    expect(screen.getByText('Albom nomini kiriting.')).toBeInTheDocument()
    expect(api.find('POST', '/gallery')).toHaveLength(0)
  })

  it('yaratish: multipart FormData, bir nechta rasm, token yuboriladi, albom ro\'yxat boshiga qo\'shiladi, forma yopiladi', async () => {
    const created = { _id: 'g9', title: 'Yangi albom', desc: 'Tavsif matni', images: ['https://s/new1.jpg', 'https://s/new2.jpg'], createdAt: '2026-02-01T00:00:00Z' }
    const api = mockApi({ 'GET /gallery': [G1], 'POST /gallery': created })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await openForm(user)
    await user.type(titleInput(), '  Yangi albom ')
    await user.type(screen.getByLabelText('Tavsif'), 'Tavsif matni')
    await user.upload(fileInput(container), [png('a.png'), png('b.png')])
    await submit(user)

    expect(await screen.findByRole('heading', { name: 'Yangi albom', level: 4 })).toBeInTheDocument()
    const [call] = api.find('POST', '/gallery')
    expect(call.body).toBeInstanceOf(FormData)
    expect(call.headers).toEqual({ Authorization: 'Bearer tok' })
    expect(call.headers['Content-Type']).toBeUndefined()
    expect(call.body.get('title')).toBe('Yangi albom')
    expect(call.body.get('desc')).toBe('Tavsif matni')
    expect(call.body.get('existingImages')).toBe('[]')
    expect(call.body.getAll('imageFiles').map(f => f.name)).toEqual(['a.png', 'b.png'])
    expect(screen.queryByLabelText(/^Nomi/)).not.toBeInTheDocument()
    const titles = screen.getAllByRole('heading', { level: 4 }).map(h => h.textContent)
    expect(titles).toEqual(['Yangi albom', '1-kampus'])
    expect(screen.getByText('jami 4 ta rasm')).toBeInTheDocument()
  })

  it('tahrirlash: forma to\'ladi, PUT /gallery/:id, mavjud rasm URL lar existingImages da qoladi', async () => {
    const updated = { ...G1, title: 'Tahrirlangan' }
    const api = mockApi({ 'GET /gallery': [G1], 'PUT /gallery/g1': updated })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    expect(screen.getByRole('form', { name: 'Tahrirlash' })).toBeInTheDocument()
    expect(titleInput()).toHaveValue('1-kampus')
    expect(screen.getByLabelText('Tavsif')).toHaveValue('Kampus binosi')
    expect(screen.getByText('2 / 10')).toBeInTheDocument()
    await user.clear(titleInput()); await user.type(titleInput(), 'Tahrirlangan')
    await submit(user, 'Saqlash')
    expect(await screen.findByRole('heading', { name: 'Tahrirlangan' })).toBeInTheDocument()
    const [call] = api.find('PUT', '/gallery/g1')
    expect(JSON.parse(call.body.get('existingImages'))).toEqual(['https://s/1.jpg', 'https://s/2.jpg'])
    expect(screen.queryByText('1-kampus')).not.toBeInTheDocument()
  })

  it('tahrirlashda mavjud rasm olib tashlansa — existingImages dan chiqadi', async () => {
    const api = mockApi({ 'GET /gallery': [G1], 'PUT /gallery/g1': G1 })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    await user.click(screen.getAllByRole('button', { name: 'Rasmni olib tashlash' })[0])
    expect(screen.getByText('1 / 10')).toBeInTheDocument()
    await submit(user, 'Saqlash')
    await waitFor(() => expect(api.find('PUT', '/gallery/g1')).toHaveLength(1))
    expect(JSON.parse(api.find('PUT', '/gallery/g1')[0].body.get('existingImages'))).toEqual(['https://s/2.jpg'])
  })

  it('hamma rasm olib tashlansa va yangisi yo\'q — «Kamida bitta rasm tanlang.», so\'rov ketmaydi', async () => {
    const api = mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    for (let i = 0; i < 2; i++) await user.click(screen.getAllByRole('button', { name: 'Rasmni olib tashlash' })[0])
    await submit(user, 'Saqlash')
    expect(screen.getByText('Kamida bitta rasm tanlang.')).toBeInTheDocument()
    expect(api.find('PUT', '/gallery/g1')).toHaveLength(0)
  })

  it('rasm plitkalari: tartib raqami (1, 2, …), «Muqova» yo\'q; yangi tanlangan — «Yangi» belgisi', async () => {
    mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    await user.upload(fileInput(container), png('n.png'))
    const tiles = [...container.querySelectorAll('.adm-ithumb')]
    expect(tiles.map(t => t.querySelector('.adm-ithumb-num').textContent)).toEqual(['1', '2', '3'])
    expect(tiles[2]).toHaveAttribute('data-new', 'true')
    expect(within(tiles[2]).getByText('Yangi')).toBeInTheDocument()
    expect(within(tiles[0]).queryByText('Yangi')).not.toBeInTheDocument()
    expect(screen.queryByText('Muqova')).not.toBeInTheDocument()
  })

  it('fayl xatolari yuklash maydoni ostida (`alert()` yo\'q): tur va 5 MB; keyingi to\'g\'ri fayl xatoni tozalaydi', async () => {
    mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup({ applyAccept: false })
    const { container } = render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    await user.upload(fileInput(container), new File(['x'], 'foto.pdf', { type: 'application/pdf' }))
    expect(screen.getByRole('alert')).toHaveTextContent('foto.pdf — faqat JPEG, PNG, WebP yoki GIF qabul qilinadi.')
    await user.upload(fileInput(container), png('katta.png', 5 * 1024 * 1024 + 1))
    expect(screen.getByRole('alert')).toHaveTextContent('katta.png — 5 MB dan katta. Boshqa rasm tanlang.')
    await user.upload(fileInput(container), png('ok.png'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(1)
    expect(alert).not.toHaveBeenCalled()
  })

  // 6.26: avval 11-chi rasm qabul qilinar va faqat serverdan xom xato kelardi
  it('10 / 10: yuklash maydoni o\'chadi («Albom to\'ldi — 10 ta rasm»), input disabled; birini olib tashlasa qayta yoqiladi', async () => {
    mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    await user.upload(fileInput(container), Array.from({ length: 10 }, (_, i) => png(`${i}.png`)))
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(10)
    expect(screen.getByText('10 / 10')).toBeInTheDocument()
    expect(screen.getByText("Albom to'ldi — 10 ta rasm")).toBeInTheDocument()
    expect(screen.getByText("yangisini qo'shish uchun avval bittasini olib tashlang")).toBeInTheDocument()
    expect(container.querySelector('.adm-dz')).toHaveAttribute('data-full', 'true')
    expect(fileInput(container)).toBeDisabled()
    await user.click(screen.getAllByRole('button', { name: 'Rasmni olib tashlash' })[0])
    expect(fileInput(container)).toBeEnabled()
    expect(screen.getByText("Rasm qo'shish")).toBeInTheDocument()
  })

  it('10 tadan ko\'p rasmni birdan tanlash — «Albomda ko\'pi bilan 10 ta rasm bo\'lishi mumkin.», hech biri qo\'shilmaydi', async () => {
    mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    await user.upload(fileInput(container), Array.from({ length: 11 }, (_, i) => png(`${i}.png`)))
    expect(screen.getByRole('alert')).toHaveTextContent("Albomda ko'pi bilan 10 ta rasm bo'lishi mumkin.")
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(0)
  })

  it('drag-and-drop: faqat fayl sudralganda yoqiladi; to\'lgan maydonga tashlash e\'tiborsiz', async () => {
    mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    const zone = container.querySelector('.adm-dz')
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['text/plain'], files: [] } })
    expect(zone).toHaveAttribute('data-drag', 'false')
    const dataTransfer = { types: ['Files'], files: [png('d1.png'), png('d2.png')] }
    fireEvent.dragEnter(zone, { dataTransfer })
    expect(zone).toHaveAttribute('data-drag', 'true')
    expect(screen.getByText('Rasmlarni bu yerga tashlang')).toBeInTheDocument()
    fireEvent.drop(zone, { dataTransfer })
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(2)
    await user.upload(fileInput(container), Array.from({ length: 8 }, (_, i) => png(`m${i}.png`)))
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(10)
    fireEvent.dragEnter(zone, { dataTransfer })
    expect(zone).toHaveAttribute('data-drag', 'false')
    fireEvent.drop(zone, { dataTransfer: { types: ['Files'], files: [png('x.png')] } })
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(10)
  })

  it('fayl kiritish `.adm-sr-only` (Tab bilan fokuslanadi), `hidden` emas', async () => {
    mockApi({ 'GET /gallery': [] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await openForm(user)
    expect(fileInput(container)).toHaveClass('adm-sr-only')
    expect(fileInput(container).hidden).toBe(false)
  })
})

describe('GalleryAdmin: saqlash xatolari va holati', () => {
  const fill = async (user, container) => {
    await openForm(user)
    await user.type(titleInput(), 'Sarlavha')
    await user.upload(fileInput(container), png())
  }

  // 6.26: avval `alert(...)` — forma ochiq qolardi, lekin xabar brauzer oynasida chiqardi
  it('server xatosi (ok:false) — forma tepasida banner, forma/fayl saqlanadi, tugma qayta faol (`alert()` yo\'q)', async () => {
    mockApi({ 'GET /gallery': [G1], 'POST /gallery': { status: 400, body: { error: 'Rasm hajmi juda katta' } } })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await fill(user, container)
    await submit(user)
    const banner = await screen.findByText(/Rasm hajmi juda katta/)
    expect(banner).toHaveTextContent("Rasm hajmi juda katta — kiritilgan ma'lumotlar saqlanib turibdi, qayta urinib ko'ring.")
    expect(alert).not.toHaveBeenCalled()
    expect(titleInput()).toHaveValue('Sarlavha')
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(1)
    expect(screen.getByRole('button', { name: "Qo'shish" })).toBeEnabled()
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(1)
  })

  it('tarmoq xatosi — banner, tugma qayta faollashadi, forma ochiq', async () => {
    vi.stubGlobal('fetch', vi.fn((u, init) => (init?.method === 'POST' ? Promise.reject(new Error('net')) : Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))))
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText("Hali albom yo'q")
    await fill(user, container)
    await submit(user)
    expect(await screen.findByText(/Server bilan bog'lanib bo'lmadi/)).toHaveTextContent('Albom saqlanmadi.')
    expect(alert).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: "Qo'shish" })).toBeEnabled()
    expect(titleInput()).toHaveValue('Sarlavha')
  })

  it('saqlanayotganda: maydonlar `disabled`, tugma `aria-busy`, «N ta rasm yuklanmoqda…», qayta bosib bo\'lmaydi', async () => {
    let resolve
    const base = mockApi({ 'GET /gallery': [G1] })
    const get = globalThis.fetch
    vi.stubGlobal('fetch', vi.fn((url, init = {}) => (init.method === 'POST'
      ? new Promise(r => { resolve = () => r({ ok: true, status: 200, json: () => Promise.resolve({ _id: 'n9', title: 'Z', images: ['https://s/z.jpg'], createdAt: '2026-02-01T00:00:00Z' }) }) })
      : get(url, init))))
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await openForm(user)
    await user.type(titleInput(), 'Z')
    await user.upload(fileInput(container), [png('a.png'), png('b.png')])
    await submit(user)
    const btn = await screen.findByRole('button', { name: 'Saqlanmoqda...' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
    expect(titleInput()).toBeDisabled()
    expect(screen.getByLabelText('Tavsif')).toBeDisabled()
    expect(fileInput(container)).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Bekor qilish' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Formani yopish' })).toBeDisabled()
    expect(screen.getAllByRole('button', { name: 'Rasmni olib tashlash' }).every(b => b.disabled)).toBe(true)
    expect(screen.getByRole('status')).toHaveTextContent('2 ta rasm yuklanmoqda va albom saqlanmoqda...')
    resolve()
    expect(await screen.findByRole('heading', { name: 'Z' })).toBeInTheDocument()
    expect(base.find('POST', '/gallery')).toHaveLength(0)
  })
})

describe('GalleryAdmin: o\'chirish', () => {
  const del = (user, title = '1-kampus') => user.click(screen.getByRole('button', { name: `O'chirish: ${title}` }))
  const confirmBtn = () => within(screen.getByRole('alertdialog')).getByRole('button', { name: "O'chirish" })

  // 6.26: `window.confirm` o'rniga `alertdialog` (Arizalar/Yangiliklar bilan bir xil)
  it('dialog: sarlavha, matnda albom nomi, rasm soni va «butunlay» (rasmlar Storage\'dan ham o\'chadi, 2.1); Bekor qilish — hech narsa yuborilmaydi', async () => {
    const api = mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await del(user)
    const dialog = screen.getByRole('alertdialog', { name: "Albomni o'chirishni tasdiqlaysizmi?" })
    expect(dialog).toHaveTextContent("«1-kampus» albomi va undagi 2 ta rasm butunlay o'chiriladi, saytdagi galereyadan ham yo'qoladi. Bu amalni qaytarib bo'lmaydi.")
    await user.click(within(dialog).getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(api.find('DELETE', '/gallery/g1')).toHaveLength(0)
    expect(screen.getByText('1-kampus')).toBeInTheDocument()
  })

  it('tasdiqlansa DELETE yuboriladi (token bilan), albom ro\'yxatdan olinadi, dialog yopiladi, hisoblagich yangilanadi', async () => {
    const api = mockApi({ 'GET /gallery': [G1, G3], 'DELETE /gallery/g1': { success: true } })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await del(user)
    await user.click(confirmBtn())
    await waitFor(() => expect(screen.queryByText('1-kampus')).not.toBeInTheDocument())
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(api.find('DELETE', '/gallery/g1')[0].headers.Authorization).toBe('Bearer tok')
    expect(container.querySelector('.adm-page-head .adm-count-pill')).toHaveTextContent('Albomlar: 1')
    expect(screen.getByText('jami 5 ta rasm')).toBeInTheDocument()
  })

  it("DELETE 404 (boshqa admin allaqachon o'chirgan) — albom ro'yxatdan ketadi, xato banneri yo'q", async () => {
    mockApi({ 'GET /gallery': [G1], 'DELETE /gallery/g1': { status: 404, body: { error: 'Topilmadi' } } })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await del(user)
    await user.click(confirmBtn())
    await waitFor(() => expect(screen.queryByText('1-kampus')).not.toBeInTheDocument())
    expect(screen.queryByText('Topilmadi')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('server DELETE ni rad etsa (500) — albom qoladi, xabar bannerda (`alert()` yo\'q), dialog yopiladi', async () => {
    mockApi({ 'GET /gallery': [G1], 'DELETE /gallery/g1': { status: 500, body: { error: 'Baza xatosi' } } })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await del(user)
    await user.click(confirmBtn())
    expect(await screen.findByText('Baza xatosi')).toBeInTheDocument()
    expect(alert).not.toHaveBeenCalled()
    expect(screen.getByText('1-kampus')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('tarmoq xatosi — albom qoladi, xabar bannerda', async () => {
    const get = mockApi({ 'GET /gallery': [G1] }).fn
    vi.stubGlobal('fetch', vi.fn((u, init = {}) => (init.method === 'DELETE' ? Promise.reject(new Error('net')) : get(u, init))))
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await del(user)
    await user.click(confirmBtn())
    expect(await screen.findByText("Server bilan bog'lanib bo'lmadi.")).toBeInTheDocument()
    expect(screen.getByText('1-kampus')).toBeInTheDocument()
  })

  it('ochiq formadagi albomni o\'chirsa — forma ham yopiladi', async () => {
    mockApi({ 'GET /gallery': [G1], 'DELETE /gallery/g1': { success: true } })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await user.click(screen.getByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    await del(user)
    await user.click(confirmBtn())
    await waitFor(() => expect(screen.queryByLabelText(/^Nomi/)).not.toBeInTheDocument())
  })
})

describe('GalleryAdmin: saqlanmagan o\'zgarishlar', () => {
  const dialogName = "Saqlanmagan o'zgarishlar bor"

  it('o\'zgarmagan forma dialogsiz yopiladi (Bekor qilish va X)', async () => {
    mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^Nomi/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    await user.click(screen.getByRole('button', { name: 'Formani yopish' }))
    expect(screen.queryByLabelText(/^Nomi/)).not.toBeInTheDocument()
  })

  it('o\'zgargan forma — «Bekor qilish» dialog ochadi; fokus «Tahrirlashda qolish»da; qolsa forma saqlanadi, «Chiqish» yopadi', async () => {
    mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    await user.type(titleInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    const dialog = screen.getByRole('alertdialog', { name: dialogName })
    expect(dialog).toHaveTextContent("O'zgarishlar saqlanmagan. Chiqsangiz, kiritilgan ma'lumotlar yo'qoladi.")
    expect(within(dialog).getByRole('button', { name: 'Tahrirlashda qolish' })).toHaveFocus()
    await user.click(within(dialog).getByRole('button', { name: 'Tahrirlashda qolish' }))
    expect(titleInput()).toHaveValue('1-kampus!')
    await user.click(screen.getByRole('button', { name: 'Formani yopish' }))
    await user.click(within(screen.getByRole('alertdialog', { name: dialogName })).getByRole('button', { name: 'Chiqish' }))
    expect(screen.queryByLabelText(/^Nomi/)).not.toBeInTheDocument()
  })

  it('o\'zgarish: yangi fayl tanlash yoki mavjud rasmni olib tashlash ham hisoblanadi', async () => {
    mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    await user.upload(fileInput(container), png())
    await user.click(screen.getByRole('button', { name: 'Formani yopish' }))
    expect(screen.getByRole('alertdialog', { name: dialogName })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Chiqish' }))
    await user.click(screen.getByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    await user.click(screen.getAllByRole('button', { name: 'Rasmni olib tashlash' })[0])
    await user.click(screen.getByRole('button', { name: 'Formani yopish' }))
    expect(screen.getByRole('alertdialog', { name: dialogName })).toBeInTheDocument()
  })

  it('boshqa albomni tahrirlash / «Yangi albom» o\'zgargan formani jimgina tozalamaydi — dialog; «Chiqish» dan keyin ochiladi', async () => {
    mockApi({ 'GET /gallery': [G1, G3] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await user.click(await screen.findByRole('button', { name: 'Tahrirlash: 1-kampus' }))
    await user.type(titleInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Tahrirlash: Katta albom' }))
    expect(screen.getByRole('alertdialog', { name: dialogName })).toBeInTheDocument()
    expect(titleInput()).toHaveValue('1-kampus!')
    await user.click(screen.getByRole('button', { name: 'Chiqish' }))
    expect(titleInput()).toHaveValue('Katta albom')
    await user.type(titleInput(), '?')
    await user.click(screen.getByRole('button', { name: 'Yangi albom' }))
    expect(screen.getByRole('alertdialog', { name: dialogName })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Chiqish' }))
    expect(titleInput()).toHaveValue('')
    expect(screen.getByRole('form', { name: 'Yangi albom' })).toBeInTheDocument()
  })

  it('ochiq yangi forma bor paytda «Yangi albom» — tozalamaydi, nomga fokus', async () => {
    mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await openForm(user)
    await user.type(titleInput(), 'Yarim')
    await user.click(screen.getByRole('button', { name: 'Yangi albom' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(titleInput()).toHaveValue('Yarim')
    expect(titleInput()).toHaveFocus()
  })

  it('«Bekor qilish» dan keyin forma qayta ochilsa eski fayllar/matn qolmaydi; blob URL lar bo\'shatiladi', async () => {
    mockApi({ 'GET /gallery': [G1] })
    const user = userEvent.setup()
    const { container } = render(<GalleryAdmin />)
    await screen.findByText('1-kampus')
    await openForm(user)
    await user.type(titleInput(), 'Eski')
    await user.upload(fileInput(container), png())
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    await user.click(screen.getByRole('button', { name: 'Chiqish' }))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x1')
    await openForm(user)
    expect(titleInput()).toHaveValue('')
    expect(container.querySelectorAll('.adm-ithumb')).toHaveLength(0)
  })
})
