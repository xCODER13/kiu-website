import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import NewsDetail from './NewsDetail'

const ARTICLE = { _id: 'n1', title: "Yangi o'quv yili boshlandi", content: 'Birinchi xat.', category: 'umumiy', views: 3, createdAt: '2026-01-05', images: [] }

const renderDetail = () => render(
  <MemoryRouter initialEntries={['/news/n1']}>
    <Routes><Route path="/news/:id" element={<NewsDetail />} /></Routes>
  </MemoryRouter>
)

afterEach(() => vi.unstubAllGlobals())

describe('NewsDetail', () => {
  it("maqola ko'rsatiladi va ko'rishlar hisoblagichi chaqiriladi", async () => {
    const fetchMock = vi.fn(url => Promise.resolve({ ok: true, json: () => Promise.resolve(String(url).endsWith('/view') ? {} : ARTICLE) }))
    vi.stubGlobal('fetch', fetchMock)
    renderDetail()
    expect(await screen.findByRole('heading', { name: ARTICLE.title })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/news\/n1\/view$/), { method: 'PUT' })
  })

  it("ko'rishlar hisoblagichi xato bersa ham maqola yashirilmaydi (regressiya)", async () => {
    vi.stubGlobal('fetch', vi.fn(url => String(url).endsWith('/view')
      ? Promise.reject(new TypeError('Failed to fetch'))
      : Promise.resolve({ ok: true, json: () => Promise.resolve(ARTICLE) })))
    renderDetail()
    expect(await screen.findByRole('heading', { name: ARTICLE.title })).toBeInTheDocument()
    expect(screen.queryByText('Yangilik topilmadi')).not.toBeInTheDocument()
  })

  it("maqola topilmasa 'Yangilik topilmadi' ko'rsatiladi", async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })))
    renderDetail()
    expect(await screen.findByText('Yangilik topilmadi')).toBeInTheDocument()
  })
})

describe('NewsDetail — JS hover va <style> CSS ga ko\'chirilgan (Bosqich 5c)', () => {
  const stub = article => vi.stubGlobal('fetch', vi.fn(url => Promise.resolve({ ok: true, json: () => Promise.resolve(String(url).endsWith('/view') ? {} : article) })))

  it("yuklanish holatida `<style>` yo'q", () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderDetail()
    expect(document.querySelectorAll('style')).toHaveLength(0)
  })

  it("orqaga tugmalari klass bilan, hover inline stil yozmaydi", async () => {
    stub(ARTICLE)
    const { container } = renderDetail()
    await screen.findByRole('heading', { name: ARTICLE.title })
    const [top, bottom] = screen.getAllByRole('button', { name: /Yangiliklarga qaytish/ })
    expect(top).toHaveClass('back-link')
    // 6.11b: pastdagi tugma umumiy `.btn-primary` (hover `.btn` dan); `.back-btn` — faqat nom/ilgak
    expect(bottom).toHaveClass('btn', 'btn-primary', 'back-btn')
    const user = userEvent.setup()
    await user.hover(top)
    await user.hover(bottom)
    expect(top.hasAttribute('style')).toBe(false)
    expect(bottom.hasAttribute('style')).toBe(false)
    expect(document.querySelectorAll('style')).toHaveLength(0)
    expect(container.querySelectorAll('button[style]')).toHaveLength(0)
  })

  it("rasm galereyasi: o'qlar klass bilan; hover inline `background` yozmaydi; `<style>` yo'q", async () => {
    stub({ ...ARTICLE, image: JSON.stringify(['/a.jpg', '/b.jpg']) })
    renderDetail()
    await screen.findByRole('heading', { name: ARTICLE.title })
    const prev = screen.getByRole('button', { name: 'Oldingi rasm' })
    const next = screen.getByRole('button', { name: 'Keyingi rasm' })
    expect(prev).toHaveClass('gallery-arrow', 'gallery-arrow--prev')
    expect(next).toHaveClass('gallery-arrow', 'gallery-arrow--next')
    const user = userEvent.setup()
    await user.hover(prev)
    await user.hover(next)
    expect(prev.hasAttribute('style')).toBe(false)
    expect(next.hasAttribute('style')).toBe(false)
    expect(document.querySelectorAll('style')).toHaveLength(0)
  })
})

// Bosqich 6.11b: Yangilik sahifasi qayta dizayni (spec 6.11) — hero, meta, SVG o'qli galereya, topilmadi holati.
describe('NewsDetail — qayta dizayn (Bosqich 6.11b)', () => {
  const stub = article => vi.stubGlobal('fetch', vi.fn(url => Promise.resolve({ ok: true, json: () => Promise.resolve(String(url).endsWith('/view') ? {} : article) })))

  it("hero: orqaga, toifa belgisi (`--cat` — yagona inline qiymat), sana, ko'rishlar va h1; maqola matni", async () => {
    stub(ARTICLE)
    const { container } = renderDetail()
    const h1 = await screen.findByRole('heading', { level: 1, name: ARTICLE.title })
    expect(container.querySelector('.detail-hero')).toContainElement(h1)
    const cat = container.querySelector('.detail-cat')
    expect(cat).toHaveClass('news-card-cat')
    expect(cat.getAttribute('style')).toBe('--cat: var(--chart-1);')
    expect(cat.querySelector('.cat-dot')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.detail-views')).toHaveTextContent('3')
    expect(container.querySelector('.detail-content')).toHaveTextContent('Birinchi xat.')
    expect(container.querySelectorAll('[style]')).toHaveLength(1)
  })

  it("matn bo'lmasa 'Matn kiritilmagan.' ko'rsatiladi", async () => {
    stub({ ...ARTICLE, content: '' })
    const { container } = renderDetail()
    await screen.findByRole('heading', { name: ARTICLE.title })
    expect(screen.getByText('Matn kiritilmagan.')).toHaveClass('detail-empty')
    expect(container.querySelector('.detail-content')).toBeNull()
  })

  it("pastki qator: orqaga tugmasi + Telegram kanaliga xavfsiz havola (`noopener noreferrer`)", async () => {
    stub(ARTICLE)
    renderDetail()
    await screen.findByRole('heading', { name: ARTICLE.title })
    const tg = screen.getByRole('link', { name: '@kiu_uz' })
    expect(tg).toHaveAttribute('href', 'https://t.me/kiu_uz')
    expect(tg).toHaveAttribute('target', '_blank')
    expect(tg).toHaveAttribute('rel', 'noopener noreferrer')
    expect(tg).toHaveClass('btn', 'btn-secondary')
  })

  it("bitta rasm: `.gallery--single`, yuklanmasa galereya `data-broken` bilan yashiriladi (inline `display` yo'q)", async () => {
    stub({ ...ARTICLE, image: '/a.jpg' })
    const { container } = renderDetail()
    await screen.findByRole('heading', { name: ARTICLE.title })
    const gallery = container.querySelector('.gallery')
    expect(gallery).toHaveClass('gallery--single')
    expect(screen.queryByRole('button', { name: 'Keyingi rasm' })).toBeNull()
    fireEvent.error(gallery.querySelector('img'))
    expect(gallery).toHaveAttribute('data-broken', 'true')
    expect(gallery.hasAttribute('style')).toBe(false)
  })

  it("ko'p rasm: o'qlar SVG (matn '‹ ›' emas), hisoblagich, nuqtalar `aria-current`; ← → va nuqta bilan almashadi; inline stil yo'q", async () => {
    stub({ ...ARTICLE, image: JSON.stringify(['/a.jpg', '/b.jpg', '/c.jpg']) })
    const { container } = renderDetail()
    await screen.findByRole('heading', { name: ARTICLE.title })
    const prev = screen.getByRole('button', { name: 'Oldingi rasm' })
    const next = screen.getByRole('button', { name: 'Keyingi rasm' })
    expect(prev.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(next).not.toHaveTextContent(/[‹›]/)
    expect(container.querySelector('.gallery-counter')).toHaveTextContent('1 / 3')
    const dots = container.querySelectorAll('.gallery-dot')
    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveAttribute('aria-current', 'true')
    expect(dots[1].hasAttribute('aria-current')).toBe(false)
    const user = userEvent.setup()
    await user.click(next)
    await waitFor(() => expect(container.querySelector('.gallery-counter')).toHaveTextContent('2 / 3'))
    expect(container.querySelectorAll('.gallery-dot')[1]).toHaveAttribute('aria-current', 'true')
    await user.keyboard('{ArrowLeft}')
    await waitFor(() => expect(container.querySelector('.gallery-counter')).toHaveTextContent('1 / 3'))
    fireEvent.error(container.querySelector('.gallery-img'))
    expect(container.querySelector('.gallery-img')).toHaveAttribute('data-broken', 'true')
    expect(container.querySelector('.gallery [style]')).toBeNull()
  })

  it("topilmadi holati: sarlavha + izoh (`news.notFoundHint`) + `btn-primary` orqaga tugmasi; yuklanish — `.page-loading .spinner`", async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { container, unmount } = renderDetail()
    expect(container.querySelector('.page-loading .spinner')).not.toBeNull()
    unmount()
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })))
    const r = renderDetail()
    expect(await screen.findByText('Yangilik topilmadi')).toHaveClass('empty-state-title')
    expect(screen.getByText(/Havola eskirgan/)).toHaveClass('empty-state-hint')
    expect(screen.getByRole('button', { name: /Yangiliklarga qaytish/ })).toHaveClass('btn', 'btn-primary')
    expect(r.container.querySelectorAll('[style]')).toHaveLength(0)
  })
})
