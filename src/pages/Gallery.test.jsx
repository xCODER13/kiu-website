import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Gallery from './Gallery'
import { mockApi } from '../test/helpers'

const ALBUM1 = { _id: 'a1', title: '1-kampus', desc: 'Kampus binosi', images: ['https://s/1.jpg', 'https://s/2.jpg'] }
const ALBUM2 = { _id: 'a2', title: '2-kampus', desc: '', images: ['https://s/3.jpg'] }

const CLUB = { _id: 'c1', section: 'club', title: 'Debat klubi', desc: 'Haftada bir uchrashuv', link: 'https://t.me/debat', image: 'https://s/c1.jpg', order: 0 }
const SPORT = { _id: 's1', section: 'sport', title: 'Futbol chempionligi', desc: '', link: '', image: '', order: 0 }
const CAMPUS = { _id: 'k1', section: 'campus', title: 'Yotoqxona', desc: 'Qulay xonalar', link: '', image: 'https://s/k1.jpg', order: 0 }

const tabBtn = name => screen.getByRole('button', { name: new RegExp(`^${name}`) })

// ── Fotogalereya (albomlar) — bo'limlar yo'q, sahifa «Fotogalereya» tabini o'zi ochadi ─────────────────────────
describe('Gallery (public): fotogalereya', () => {
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

  it('har bir albom — bitta karta (rasmlari alohida karta bo\'lmaydi)', async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    const { container } = render(<Gallery />)
    expect(await screen.findByRole('heading', { level: 2, name: '1-kampus' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    expect(container.querySelectorAll('.card.news-card')).toHaveLength(2)
    expect(screen.getAllByText('Kampus binosi')).toHaveLength(1)
  })

  it('karta yangiliklar kartasi bilan bir xil: `news-card`, sana va ko\'rishlar soni yo\'q', async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    expect(container.querySelectorAll('.card.news-card')).toHaveLength(1)
    expect(container.querySelector('.news-card-date')).toBeNull()
    expect(container.querySelector('.news-card-views')).toBeNull()
    expect(container.querySelector('.news-grid')).not.toBeNull()
  })

  it("mozaika (admin kartasidek): birinchi 3 rasm, `data-count`, «N ta rasm» belgisi", async () => {
    const five = { _id: 'a5', title: 'Besh rasm', desc: '', images: Array.from({ length: 5 }, (_, i) => `https://s/5-${i}.jpg`) }
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2, five] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: 'Besh rasm' })
    const mosaics = [...container.querySelectorAll('.album-mosaic')]
    expect(mosaics.map(m => m.getAttribute('data-count'))).toEqual(['2', '1', '3'])
    expect(mosaics.map(m => m.querySelectorAll('.album-tile').length)).toEqual([2, 1, 3])
    expect(mosaics.map(m => m.querySelector('.album-badge').textContent)).toEqual(['2 ta rasm', '1 ta rasm', '5 ta rasm'])
    // kartadagi rasmlar bezak: alt bo'sh, sarlavha h2 da
    expect(container.querySelectorAll('.album-tile[alt=""]')).toHaveLength(6)
  })

  it("rasmsiz albom (bo'sh yoki massiv bo'lmagan `images`) ko'rsatilmaydi", async () => {
    mockApi({ 'GET /gallery': [{ ...ALBUM1, images: [] }, { ...ALBUM2, images: null }] })
    render(<Gallery />)
    expect(await screen.findByText("Haqiqiy rasmlar tez orada qo'shiladi")).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })

  it('karta bosilganda albom rasmlari lightbox da ochiladi, sarlavha/tavsif va `1 / N` bilan', async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    fireEvent.click(container.querySelector('.card'))
    const dialog = screen.getByRole('dialog', { name: '1-kampus' })
    expect(within(dialog).getByText('Kampus binosi')).toBeInTheDocument()
    expect(dialog.querySelector('.photo-lightbox__img')).toHaveAttribute('src', 'https://s/1.jpg')
    expect(dialog.querySelector('.photo-lightbox__count')).toHaveTextContent('1 / 2')
  })

  it('lightbox yopish tugmasi bilan yopiladi', async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    fireEvent.click(container.querySelector('.card'))
    fireEvent.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lightbox Escape tugmasi bilan yopiladi', async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    fireEvent.click(container.querySelector('.card'))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it("lightbox faqat ochilgan albom rasmlari ichida aylanadi (boshqa albomga o'tmaydi)", async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    fireEvent.click(container.querySelectorAll('.card')[0])
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(document.querySelector('.photo-lightbox__count')).toHaveTextContent('2 / 2')
    fireEvent.keyDown(window, { key: 'ArrowRight' }) // aylanma: yana 1-rasm, ALBUM2 emas
    expect(screen.getByRole('dialog', { name: '1-kampus' }).querySelector('.photo-lightbox__count')).toHaveTextContent('1 / 2')
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(document.querySelector('.photo-lightbox__count')).toHaveTextContent('2 / 2')
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
    expect(await screen.findByRole('heading', { level: 2, name: '<img src=x onerror=alert(1)>' })).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })

  it("lightbox: role=dialog + aria-modal, sarlavha nomi bilan; hisoblagich `N / jami`", async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    fireEvent.click(container.querySelectorAll('.card')[0])
    const dialog = screen.getByRole('dialog', { name: '1-kampus' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    // portal: `.fade-up` ning transformi `position: fixed` ni qamab qo'ymasligi uchun oyna document.body ga chiqariladi
    expect(dialog.closest('.photo-lightbox').parentElement).toBe(document.body)
    expect(dialog.querySelector('.photo-lightbox__count')).toHaveTextContent('1 / 2')
    fireEvent.click(screen.getByRole('button', { name: 'Keyingi rasm' }))
    expect(screen.getByRole('dialog', { name: '1-kampus' }).querySelector('.photo-lightbox__count')).toHaveTextContent('2 / 2')
  })

  it("lightbox aylanma: oxirgi rasmdan keyingisi — birinchi, birinchidan oldingisi — oxirgi", async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    fireEvent.click(container.querySelector('.card'))
    fireEvent.click(screen.getByRole('button', { name: 'Oldingi rasm' }))
    expect(document.querySelector('.photo-lightbox__count')).toHaveTextContent('2 / 2')
    fireEvent.click(screen.getByRole('button', { name: 'Keyingi rasm' }))
    expect(document.querySelector('.photo-lightbox__count')).toHaveTextContent('1 / 2')
  })

  it("bitta rasmli albom: lightbox `1 / 1`, strelkalar aylanib o'sha rasmga qaytadi", async () => {
    mockApi({ 'GET /gallery': [ALBUM2] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '2-kampus' })
    fireEvent.click(container.querySelector('.card'))
    expect(document.querySelector('.photo-lightbox__count')).toHaveTextContent('1 / 1')
    fireEvent.click(screen.getByRole('button', { name: 'Keyingi rasm' }))
    expect(document.querySelector('.photo-lightbox__count')).toHaveTextContent('1 / 1')
  })

  it("strelka tugmasi bosilganda lightbox yopilmaydi (stopPropagation); fon bosilsa yopiladi", async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    fireEvent.click(container.querySelector('.card'))
    fireEvent.click(screen.getByRole('button', { name: 'Keyingi rasm' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(document.querySelector('.photo-lightbox'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it("karta klaviatura bilan ochiladi: ichidagi haqiqiy tugma (Enter), karta o'zi `role=button` emas", async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    expect(document.querySelector('.news-card')).not.toHaveAttribute('role')
    const btn = screen.getByRole('button', { name: "Ko'rish: 1-kampus" })
    btn.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(btn).toHaveFocus() // yopilganda fokus tugmaga qaytadi
  })

  it("mozaikada rasm yuklanmasa o'sha katak `data-broken`, inline style yo'q; hammasi yuklanmasa «Rasm yuklanmadi»", async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    const tiles = container.querySelectorAll('.album-tile')
    fireEvent.error(tiles[0])
    expect(tiles[0]).toHaveAttribute('data-broken', 'true')
    expect(container.querySelectorAll('.album-fallback')).toHaveLength(0) // 1-albomning 2-rasmi hali bor
    fireEvent.error(tiles[2]) // 2-albom — yagona rasm
    expect(screen.getByText('Rasm yuklanmadi')).toBeInTheDocument()
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
    const { container } = render(<Gallery />, { container: root.appendChild(document.createElement('div')) })
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    expect(root.inert).toBeFalsy() // jsdom'da `inert` xossasi dastlab yo'q
    fireEvent.click(container.querySelector('.card'))
    expect(root.inert).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(root.inert).toBe(false)
    root.remove()
  })

  it("albomlar uchun chiplar yo'q (har albom o'zi karta)", async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    const { container } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    expect(container.querySelector('.news-cats')).toBeNull()
  })

  it('qidiruv: nom yoki tavsif bo\'yicha; topilmasa xabar', async () => {
    mockApi({ 'GET /gallery': [ALBUM1, ALBUM2] })
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    const input = screen.getByRole('textbox', { name: 'Talabalar hayoti ichida qidiring...' })
    await user.type(input, 'BINOSI')
    expect(screen.getByRole('heading', { level: 2, name: '1-kampus' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: '2-kampus' })).not.toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'zzz')
    expect(screen.getByText('"zzz" bo\'yicha hech narsa topilmadi')).toBeInTheDocument()
  })

  it("«Ko'proq yuklash»: avval 6 ta albom, tugma bosilsa qolgani", async () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ _id: `m${i}`, title: `Albom ${i}`, desc: '', images: [`https://s/m${i}.jpg`] }))
    mockApi({ 'GET /gallery': many })
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: 'Albom 0' })
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(6)
    await user.click(screen.getByRole('button', { name: "Ko'proq yuklash (2 ta qoldi)" }))
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(8)
    expect(screen.queryByRole('button', { name: /Ko'proq yuklash/ })).not.toBeInTheDocument()
  })
})

// ── «Bo'limlar» tabi (klublar / sport / kampus) ─────────────────────────────────────────────────────────────
describe("Gallery (public): Talabalar hayoti bo'limlari", () => {
  it("bo'limlar bor bo'lsa «Bo'limlar» tabi birinchi ochiladi; tablarda elementlar soni", async () => {
    mockApi({ 'GET /gallery': [ALBUM1], 'GET /student-life': [CLUB, SPORT] })
    render(<Gallery />)
    await screen.findByText('Debat klubi')
    expect(tabBtn("Bo'limlar")).toHaveAttribute('aria-pressed', 'true')
    expect(tabBtn('Fotogalereya')).toHaveAttribute('aria-pressed', 'false')
    expect(tabBtn("Bo'limlar")).toHaveTextContent('2')
    expect(tabBtn('Fotogalereya')).toHaveTextContent('Fotogalereya1')
    // albom rasmlari hali ko'rinmaydi
    expect(screen.queryByRole('heading', { level: 2, name: '1-kampus' })).not.toBeInTheDocument()
  })

  it("bo'limlar bo'sh bo'lsa sahifa «Fotogalereya» tabini o'zi ochadi", async () => {
    mockApi({ 'GET /gallery': [ALBUM1], 'GET /student-life': [] })
    render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    expect(tabBtn('Fotogalereya')).toHaveAttribute('aria-pressed', 'true')
    expect(tabBtn("Bo'limlar")).toHaveAttribute('aria-pressed', 'false')
  })

  it("tab almashtirish: «Fotogalereya» → albomlar, qaytib «Bo'limlar» → bo'limlar; qidiruv holati tozalanadi", async () => {
    mockApi({ 'GET /gallery': [ALBUM1], 'GET /student-life': [CLUB, CAMPUS] })
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findByText('Debat klubi')
    await user.type(screen.getByRole('textbox'), 'Yotoq')
    expect(screen.queryByText('Debat klubi')).not.toBeInTheDocument()
    await user.click(tabBtn('Fotogalereya'))
    expect(await screen.findByRole('heading', { level: 2, name: '1-kampus' })).toBeInTheDocument()
    expect(screen.queryByText('Yotoqxona')).not.toBeInTheDocument()
    await user.click(tabBtn("Bo'limlar"))
    expect(screen.getByText('Debat klubi')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it("foydalanuvchi bo'sh «Bo'limlar» tabini tanlasa bo'sh holat chiqadi", async () => {
    mockApi({ 'GET /gallery': [ALBUM1], 'GET /student-life': [] })
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    await user.click(tabBtn("Bo'limlar"))
    expect(screen.getByText("Hozircha bo'limlar yo'q")).toBeInTheDocument()
  })

  it("kartalar: tartib klub → sport → kampus (javob tartibidan qat'i nazar), sarlavha h2, bo'lim nomi chipda; sana/ko'rishlar yo'q", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CAMPUS, SPORT, CLUB] })
    const { container } = render(<Gallery />)
    await screen.findByText('Debat klubi')
    const heads = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    expect(heads).toEqual(['Debat klubi', 'Futbol chempionligi', 'Yotoqxona'])
    expect(container.querySelectorAll('.card.news-card')).toHaveLength(3)
    expect(container.querySelector('.news-card-date')).toBeNull()
    expect(container.querySelector('.news-card-views')).toBeNull()
    const cardTags = [...container.querySelectorAll('.news-card-cat')].map(c => c.textContent)
    expect(cardTags).toEqual(["Klublar va to'garaklar", 'Sport va yutuqlar', 'Kampus va yotoqxona hayoti'])
    // bo'limlar bor, albom yo'q — «rasmlar tez orada» bo'sh holati bu tabda chiqmaydi
    expect(screen.queryByText("Haqiqiy rasmlar tez orada qo'shiladi")).not.toBeInTheDocument()
  })

  it("rasmsiz karta placeholder bilan chiqadi, rasm bo'lsa lazy; kartada `<a>` yo'q", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [SPORT, CLUB] })
    const { container } = render(<Gallery />)
    await screen.findByText('Debat klubi')
    const cards = container.querySelectorAll('.news-card')
    expect(cards[0].querySelector('.news-card-ph')).toBeNull()       // klub tartibda birinchi (rasmli)
    expect(cards[0].querySelector('img')).toHaveAttribute('loading', 'lazy')
    expect(cards[1].querySelector('img')).toBeNull()
    expect(cards[1].querySelector('.news-card-ph')).not.toBeNull()
    expect(container.querySelector('a[href]')).toBeNull()
  })

  it('chiplar: «Barchasi» + mavjud bo\'limlar (soni bilan, tartibda); bo\'sh bo\'lim chipi yo\'q', async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CAMPUS, CLUB, { ...CLUB, _id: 'c2', title: 'Shaxmat' }] })
    render(<Gallery />)
    await screen.findByText('Debat klubi')
    const chips = [...document.querySelectorAll('.news-cat')].map(c => c.textContent)
    expect(chips).toEqual(['Barchasi3', "Klublar va to'garaklar2", 'Kampus va yotoqxona hayoti1'])
    expect(screen.queryByRole('button', { name: /Sport/ })).not.toBeInTheDocument()
  })

  it("chip bosilsa faqat shu bo'lim; «Barchasi» hammasini qaytaradi; faol chip aria-pressed", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB, SPORT, CAMPUS] })
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findByText('Debat klubi')
    const sportChip = screen.getByRole('button', { name: /^Sport va yutuqlar/ })
    await user.click(sportChip)
    expect(sportChip).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Futbol chempionligi')).toBeInTheDocument()
    expect(screen.queryByText('Debat klubi')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Barchasi/ }))
    expect(screen.getByText('Debat klubi')).toBeInTheDocument()
    expect(screen.getByText('Yotoqxona')).toBeInTheDocument()
  })

  it("bitta bo'lim bo'lsa chiplar chiqmaydi", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB] })
    const { container } = render(<Gallery />)
    await screen.findByText('Debat klubi')
    expect(container.querySelector('.news-cats')).toBeNull()
  })

  it("qidiruv: sarlavha va tavsif bo'yicha, katta-kichik harfga qaramaydi; topilmasa xabar", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB, SPORT, CAMPUS] })
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findByText('Debat klubi')
    const input = screen.getByRole('textbox', { name: 'Talabalar hayoti ichida qidiring...' })
    await user.type(input, 'QULAY')
    expect(screen.getByText('Yotoqxona')).toBeInTheDocument()
    expect(screen.queryByText('Debat klubi')).not.toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'futbol')
    expect(screen.getByText('Futbol chempionligi')).toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'yo\'q narsa')
    expect(screen.getByText('"yo\'q narsa" bo\'yicha hech narsa topilmadi')).toBeInTheDocument()
  })

  it("chip va qidiruv birga ishlaydi; chip soni qidiruvga bog'liq emas", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB, { ...CLUB, _id: 'c2', title: 'Shaxmat klubi', desc: '' }, SPORT] })
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findByText('Debat klubi')
    await user.click(screen.getByRole('button', { name: /^Klublar/ }))
    await user.type(screen.getByRole('textbox'), 'shaxmat')
    expect(screen.getByText('Shaxmat klubi')).toBeInTheDocument()
    expect(screen.queryByText('Debat klubi')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Klublar/ })).toHaveTextContent('2')
  })

  it("«Ko'proq yuklash»: 7 ta element — avval 6 ta, tugma bosilgach hammasi", async () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ ...CLUB, _id: `m${i}`, title: `Klub ${i}`, desc: '', link: '' }))
    mockApi({ 'GET /gallery': [], 'GET /student-life': many })
    const user = userEvent.setup()
    const { container } = render(<Gallery />)
    await screen.findByText('Klub 0')
    expect(container.querySelectorAll('.news-card')).toHaveLength(6)
    await user.click(screen.getByRole('button', { name: "Ko'proq yuklash (1 ta qoldi)" }))
    expect(container.querySelectorAll('.news-card')).toHaveLength(7)
    expect(screen.queryByRole('button', { name: /Ko'proq yuklash/ })).not.toBeInTheDocument()
  })

  // ── Modal ────────────────────────────────────────────────────────────────
  it('karta bosilganda modal ochiladi: nom, bo\'lim, to\'liq tavsif, rasm; fon orqada qoladi', async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB] })
    render(<Gallery />)
    fireEvent.click((await screen.findByText('Debat klubi')).closest('.card'))
    const dialog = screen.getByRole('dialog', { name: 'Debat klubi' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog.parentElement.parentElement).toBe(document.body) // portal
    expect(within(dialog).getByText('Haftada bir uchrashuv')).toHaveClass('ev-modal__desc--pre')
    expect(within(dialog).getByText("Klublar va to'garaklar")).toBeInTheDocument()
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://s/c1.jpg')
  })

  it('«Batafsil» tugmasi (klaviatura uchun) ham modalni ochadi va nomi aria-label da', async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB] })
    const user = userEvent.setup()
    render(<Gallery />)
    const btn = await screen.findByRole('button', { name: 'Batafsil: Debat klubi' })
    btn.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog', { name: 'Debat klubi' })).toBeInTheDocument()
  })

  it('modal Yopish tugmasi, Esc va fon bosilganda yopiladi; fokus kartadagi tugmaga qaytadi', async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB] })
    const user = userEvent.setup()
    render(<Gallery />)
    const btn = await screen.findByRole('button', { name: 'Batafsil: Debat klubi' })
    await user.click(btn)
    await user.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(btn).toHaveFocus()

    await user.click(btn)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(btn)
    fireEvent.click(document.querySelector('.ev-modal-overlay'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('modal ichidagi bosish modalni yopmaydi', async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB] })
    render(<Gallery />)
    fireEvent.click((await screen.findByText('Debat klubi')).closest('.card'))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('heading', { name: 'Debat klubi' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('modal ochiq paytda orqa sahifa `inert` (#root), yopilganda olinadi', async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB] })
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)
    render(<Gallery />, { container: root.appendChild(document.createElement('div')) })
    fireEvent.click((await screen.findByText('Debat klubi')).closest('.card'))
    expect(root.inert).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(root.inert).toBe(false)
    root.remove()
  })

  it("havola faqat modalda: yangi oynada, noopener noreferrer; havolasiz elementda tugma yo'q", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [CLUB, SPORT] })
    render(<Gallery />)
    fireEvent.click((await screen.findByText('Debat klubi')).closest('.card'))
    const link = screen.getByRole('link', { name: /Havolani ochish/ })
    expect(link).toHaveAttribute('href', 'https://t.me/debat')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    fireEvent.click(screen.getByRole('button', { name: 'Yopish' }))

    fireEvent.click(screen.getByText('Futbol chempionligi').closest('.card'))
    expect(screen.getByRole('dialog', { name: 'Futbol chempionligi' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it.each([['javascript:alert(1)'], ['http://t.me/x'], ['data:text/html,<b>'], ['//evil.uz'], ['https://a b.uz']])(
    "xavfli havola %s `<a>` ga tushmaydi (backend tekshiruvidan o'tib ketsa ham)",
    async link => {
      mockApi({ 'GET /gallery': [], 'GET /student-life': [{ ...CLUB, link }] })
      const { container } = render(<Gallery />)
      fireEvent.click((await screen.findByText('Debat klubi')).closest('.card'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(container.querySelector('a[href]')).toBeNull()
      expect(document.body.querySelector('a[href]')).toBeNull()
    },
  )

  it("XSS: bo'lim nomi/tavsifidagi HTML matn sifatida chiqadi (kartada ham, modalda ham)", async () => {
    const evil = { ...CLUB, title: '<img src=x onerror=alert(1)>', desc: '<script>alert(1)</script>' }
    mockApi({ 'GET /gallery': [], 'GET /student-life': [evil] })
    render(<Gallery />)
    fireEvent.click((await screen.findByText('<img src=x onerror=alert(1)>')).closest('.card'))
    expect(screen.getAllByText('<script>alert(1)</script>')).toHaveLength(2)
    expect(document.querySelector('img[src="x"]')).toBeNull()
    expect(document.querySelector('script')).toBeNull()
  })

  // ── Xatolar va chegaraviy holatlar ───────────────────────────────────────
  it("bo'limlar yuklanmasa (tarmoq xatosi) albomlar ishlayveradi, xato banneri chiqmaydi", async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(url => String(url).endsWith('/api/student-life')
      ? Promise.reject(new Error('network'))
      : Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([ALBUM2]) })))
    render(<Gallery />)
    expect(await screen.findByRole('heading', { level: 2, name: '2-kampus' })).toBeInTheDocument()
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
    const { container, unmount } = render(<Gallery />)
    await screen.findByRole('heading', { level: 2, name: '1-kampus' })
    expect(tabBtn('Fotogalereya')).toHaveAttribute('aria-pressed', 'true')
    // Bitta albom = bitta karta (ichidagi rasmlar soniga bog'liq emas)
    expect(container.querySelectorAll('.news-card')).toHaveLength(1)
    unmount()

    mockApi({ 'GET /gallery': [], 'GET /student-life': [{ ...CLUB, section: 'bayram' }] })
    render(<Gallery />)
    expect(await screen.findAllByText("Haqiqiy rasmlar tez orada qo'shiladi")).not.toHaveLength(0)
    expect(screen.queryByText('Debat klubi')).not.toBeInTheDocument()
  })

  it("bo'limlar ham, albomlar ham yo'q: «Fotogalereya» tabi va bo'sh holat", async () => {
    mockApi({ 'GET /gallery': [], 'GET /student-life': [] })
    render(<Gallery />)
    expect(await screen.findByText("Haqiqiy rasmlar tez orada qo'shiladi")).toBeInTheDocument()
    expect(tabBtn('Fotogalereya')).toHaveAttribute('aria-pressed', 'true')
  })
})
