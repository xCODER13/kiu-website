import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Gallery from './Gallery'
import { mockApi } from '../test/helpers'

const ALBUM1 = { _id: 'a1', title: '1-kampus', desc: 'Kampus binosi', images: ['https://s/1.jpg', 'https://s/2.jpg'] }
const ALBUM2 = { _id: 'a2', title: '2-kampus', desc: '', images: ['https://s/3.jpg'] }

describe('Gallery (public)', () => {
  it('yuklanish paytida "Yuklanmoqda..." ko\'rsatadi', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<Gallery />)
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()
  })

  it("albom yo'q bo'lsa bo'sh holat ko'rsatiladi", async () => {
    mockApi({ 'GET /gallery': [] })
    render(<Gallery />)
    expect(await screen.findByText("Haqiqiy rasmlar tez orada qo'shiladi")).toBeInTheDocument()
  })

  it('har bir albomning har rasmi alohida panelka sifatida ko\'rsatiladi', async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    render(<Gallery />)
    // ALBUM1 ikki rasmga ega — ikkisi ham "1-kampus" nomi bilan alohida panelka
    expect(await screen.findAllByAltText('1-kampus')).toHaveLength(2)
    expect(screen.getAllByAltText('2-kampus')).toHaveLength(1)
    expect(screen.getAllByText('Kampus binosi')).toHaveLength(2)
  })

  it('panelka bosilganda lightbox ochiladi, sarlavha/tavsif bilan', async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    render(<Gallery />)
    const tiles = await screen.findAllByAltText('1-kampus')
    fireEvent.click(tiles[0].closest('.card'))
    expect(screen.getAllByText('1-kampus').length).toBeGreaterThanOrEqual(2) // panelka + lightbox
    expect(screen.getAllByText('Kampus binosi').length).toBeGreaterThanOrEqual(2)
  })

  it('lightbox yopish tugmasi bilan yopiladi', async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    render(<Gallery />)
    const tiles = await screen.findAllByAltText('1-kampus')
    fireEvent.click(tiles[0].closest('.card'))
    // 6.11c3: "✕" matni o'rniga SVG ikonka (aria-label orqali topiladi)
    fireEvent.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lightbox Escape tugmasi bilan yopiladi', async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    render(<Gallery />)
    const tiles = await screen.findAllByAltText('1-kampus')
    fireEvent.click(tiles[0].closest('.card'))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lightbox → (keyingi) barcha albomlar orasida ketma-ket o\'tadi', async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    render(<Gallery />)
    const tiles = await screen.findAllByAltText('1-kampus')
    fireEvent.click(tiles[1].closest('.card')) // ALBUM1'ning 2-rasmi (index 1)
    fireEvent.keyDown(window, { key: 'ArrowRight' }) // index 2 → ALBUM2'ning rasmi
    expect(screen.getAllByText('2-kampus').length).toBeGreaterThanOrEqual(2)
  })

  it("fetch xatosi (tarmoq) — xato xabari ko'rsatiladi", async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Gallery />)
    expect(await screen.findByText(/xatolik yuz berdi/)).toBeInTheDocument()
    expect(screen.queryByText('Yuklanmoqda...')).not.toBeInTheDocument()
    spy.mockRestore()
  })

  it("javob massiv bo'lmasa ({error}) — qulamaydi, bo'sh holat ko'rsatiladi", async () => {
    mockApi({ 'GET /gallery': { status: 500, body: { error: 'Server xatosi' } } })
    render(<Gallery />)
    expect(await screen.findByText("Haqiqiy rasmlar tez orada qo'shiladi")).toBeInTheDocument()
  })

  it("XSS: albom nomidagi HTML matn sifatida ko'rsatiladi", async () => {
    mockApi({ 'GET /gallery': [{ ...ALBUM1, title: '<img src=x onerror=alert(1)>' }] })
    render(<Gallery />)
    await screen.findAllByAltText('<img src=x onerror=alert(1)>')
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })

  // ── 6.11c3 ──────────────────────────────────────────────────────────────
  it("lightbox: role=dialog + aria-modal, sarlavha nomi bilan; hisoblagich `N / jami`", async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    render(<Gallery />)
    const tiles = await screen.findAllByAltText('1-kampus')
    fireEvent.click(tiles[1].closest('.card'))
    const dialog = screen.getByRole('dialog', { name: '1-kampus' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    // portal: `.fade-up` ning transformi `position: fixed` ni qamab qo'ymasligi uchun oyna document.body ga chiqariladi
    expect(dialog.closest('.photo-lightbox').parentElement).toBe(document.body)
    expect(dialog.querySelector('.photo-lightbox__count')).toHaveTextContent('2 / 3')
    fireEvent.click(screen.getByRole('button', { name: 'Keyingi rasm' }))
    expect(screen.getByRole('dialog', { name: '2-kampus' }).querySelector('.photo-lightbox__count')).toHaveTextContent('3 / 3')
  })

  it("lightbox aylanma: oxirgi rasmdan keyingisi — birinchi, birinchidan oldingisi — oxirgi", async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    render(<Gallery />)
    const tiles = await screen.findAllByAltText('2-kampus')
    fireEvent.click(tiles[0].closest('.card'))            // index 2 (oxirgi)
    fireEvent.click(screen.getByRole('button', { name: 'Keyingi rasm' }))
    expect(document.querySelector('.photo-lightbox__count')).toHaveTextContent('1 / 3')
    fireEvent.click(screen.getByRole('button', { name: 'Oldingi rasm' }))
    expect(document.querySelector('.photo-lightbox__count')).toHaveTextContent('3 / 3')
  })

  it("strelka tugmasi bosilganda lightbox yopilmaydi (stopPropagation); fon bosilsa yopiladi", async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    render(<Gallery />)
    const tiles = await screen.findAllByAltText('1-kampus')
    fireEvent.click(tiles[0].closest('.card'))
    fireEvent.click(screen.getByRole('button', { name: 'Keyingi rasm' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(document.querySelector('.photo-lightbox'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it("panelka klaviatura bilan ochiladi (Enter va Space), `role=button` + `tabindex=0`", async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findAllByAltText('1-kampus')
    const card = document.querySelector('.photo-card')
    expect(card).toHaveAttribute('role', 'button')
    expect(card).toHaveAttribute('tabindex', '0')
    card.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it("panelka: `data-slot` 0–5 aylanadi (rasmsiz placeholder rangi), rasm yuklanmasa `data-broken`, inline style yo'q", async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    render(<Gallery />)
    const imgs = await screen.findAllByAltText('1-kampus')
    expect([...document.querySelectorAll('.photo-card')].map(c => c.dataset.slot)).toEqual(['0', '1', '2'])
    fireEvent.error(imgs[0])
    expect(imgs[0]).toHaveAttribute('data-broken', 'true')
    expect(document.querySelector('.photo-card [aria-hidden="true"]')).not.toBeNull()
    expect(document.body.querySelector('[style]')).toBeNull()
  })

  it("tarmoq xatosi — `.notice-banner[data-tone=danger]` role=alert", async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Gallery />)
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveClass('notice-banner')
    expect(alert).toHaveAttribute('data-tone', 'danger')
    spy.mockRestore()
  })

  it("lightbox ochiq paytda orqa sahifa `inert` (#root), yopilganda olinadi", async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)
    render(<Gallery />, { container: root.appendChild(document.createElement('div')) })
    const tiles = await screen.findAllByAltText('1-kampus')
    expect(root.inert).toBeFalsy() // jsdom'da `inert` xossasi dastlab yo'q
    fireEvent.click(tiles[0].closest('.card'))
    expect(root.inert).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(root.inert).toBe(false)
    root.remove()
  })
})

describe('Gallery (public): Talabalar hayoti bo\'limlari', () => {
  const CLUB = { _id: 'c1', section: 'club', title: 'Debat klubi', desc: 'Haftada bir uchrashuv', link: 'https://t.me/debat', image: 'https://s/c1.jpg', order: 0 }
  const SPORT = { _id: 's1', section: 'sport', title: 'Futbol chempionligi', desc: '', link: '', image: '', order: 0 }
  const CAMPUS = { _id: 'k1', section: 'campus', title: 'Yotoqxona', desc: 'Qulay xonalar', link: '', image: 'https://s/k1.jpg', order: 0 }

  it("bo'limlar tartibi: klub → sport → kampus (javob tartibidan qat'i nazar), har biri o'z sarlavhasi ostida", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CAMPUS, SPORT, CLUB] })
    render(<Gallery />)
    await screen.findByText('Debat klubi')
    const heads = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    expect(heads).toEqual(["Klublar va to'garaklar", 'Sport va yutuqlar', 'Kampus va yotoqxona hayoti'])
    expect(screen.getByRole('heading', { level: 3, name: 'Futbol chempionligi' })).toBeInTheDocument()
    // bo'limlar bor, albom yo'q — «rasmlar tez orada» bo'sh holati chiqmaydi
    expect(screen.queryByText("Haqiqiy rasmlar tez orada qo'shiladi")).not.toBeInTheDocument()
  })

  it("bo'sh bo'lim sarlavhasi chiqmaydi", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB] })
    render(<Gallery />)
    await screen.findByText('Debat klubi')
    expect(screen.queryByText('Sport va yutuqlar')).not.toBeInTheDocument()
    expect(screen.queryByText('Kampus va yotoqxona hayoti')).not.toBeInTheDocument()
  })

  it("havola: yangi oynada, noopener noreferrer, nomi aria-label'da; havolasiz kartada tugma yo'q", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB, SPORT] })
    render(<Gallery />)
    const link = await screen.findByRole('link', { name: 'Batafsil: Debat klubi' })
    expect(link).toHaveAttribute('href', 'https://t.me/debat')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getAllByRole('link', { name: /Batafsil/ })).toHaveLength(1)
  })

  it.each([['javascript:alert(1)'], ['http://t.me/x'], ['data:text/html,<b>'], ['//evil.uz'], ['https://a b.uz']])(
    "xavfli havola %s `<a>` ga tushmaydi (backend tekshiruvidan o'tib ketsa ham)",
    async link => {
      mockApi({ 'GET /gallery': [], 'GET /student-life': [{ ...CLUB, link }] })
      const { container } = render(<Gallery />)
      await screen.findByText('Debat klubi')
      expect(container.querySelector('a[href]')).toBeNull()
    },
  )

  it("rasmsiz element ham chiqadi (rasm joyida gradient fon), rasm bo'lsa lazy", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [SPORT, CAMPUS] })
    const { container } = render(<Gallery />)
    await screen.findByText('Futbol chempionligi')
    const cards = container.querySelectorAll('.photo-card--static')
    expect(cards).toHaveLength(2)
    expect(cards[0].querySelector('img')).toBeNull()
    expect(cards[1].querySelector('img')).toHaveAttribute('loading', 'lazy')
  })

  it("bo'limlar ham, albomlar ham bo'lsa «Fotogalereya» sarlavhasi albomlar oldida chiqadi; albom kartalari avvalgidek lightbox ochadi", async () => {
    mockApi({ 'GET /gallery': [ALBUM1], 'GET /student-life': [CLUB] })
    render(<Gallery />)
    await screen.findByText('Debat klubi')
    expect(screen.getByRole('heading', { level: 2, name: 'Fotogalereya' })).toBeInTheDocument()
    const tiles = await screen.findAllByAltText('1-kampus')
    fireEvent.click(tiles[0].closest('.card'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it("faqat albomlar bo'lsa (bo'lim yo'q) sahifa avvalgidek: «Fotogalereya» sarlavhasi yo'q", async () => {
    mockApi({ 'GET /gallery': [ALBUM1], 'GET /student-life': [] })
    render(<Gallery />)
    await screen.findAllByAltText('1-kampus')
    expect(screen.queryByRole('heading', { name: 'Fotogalereya' })).not.toBeInTheDocument()
  })

  it("bo'limlar yuklanmasa (500) albomlar ishlayveradi, xato banneri chiqmaydi", async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(url => String(url).endsWith('/api/student-life')
      ? Promise.reject(new Error('network'))
      : Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([ALBUM2]) })))
    render(<Gallery />)
    expect(await screen.findAllByAltText('2-kampus')).toHaveLength(1)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it("albom API xatosi, lekin bo'limlar bor: bo'limlar ko'rinadi va xato banneri ham chiqadi", async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(url => String(url).endsWith('/api/student-life')
      ? Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([CLUB]) })
      : Promise.reject(new Error('network'))))
    render(<Gallery />)
    expect(await screen.findByText('Debat klubi')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it("javob massiv bo'lmasa yoki noma'lum bo'lim bo'lsa e'tiborga olinmaydi (albom javobi bo'limga aralashib ketmaydi)", async () => {
    // Har ikkala URL ham albom massivini qaytaradi: elementlarda `section` yo'q → bo'limlar bo'sh
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([ALBUM1]) })))
    const { container } = render(<Gallery />)
    await screen.findAllByAltText('1-kampus')
    expect(container.querySelector('.photo-card--static')).toBeNull()
    mockApi({ 'GET /gallery': [], 'GET /student-life': [{ ...CLUB, section: 'bayram' }] })
    render(<Gallery />)
    expect(await screen.findAllByText("Haqiqiy rasmlar tez orada qo'shiladi")).not.toHaveLength(0)
  })
})
