import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Events from './Events'
import { mockApi } from '../test/helpers'

const E1 = { _id: 'e1', eventDate: '2026-03-05', title: 'Ochiq eshiklar', desc: 'Tanishuv kuni', type: 'open' }
const E2 = { _id: 'e2', eventDate: '2026-04-10', title: 'Sport kuni', desc: 'Musobaqalar', type: 'sport', image: 'https://s/1.jpg' }

describe('Events (public)', () => {
  it('yuklanish paytida "Yuklanmoqda..." ko\'rsatadi', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<Events />)
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()
  })

  it("muvaffaqiyatli javob — tadbirlar sarlavha, tavsif va kategoriya yorlig'i bilan ko'rsatiladi", async () => {
    mockApi({ 'GET /events': [E1, E2] })
    render(<Events />)
    expect(await screen.findByText('Ochiq eshiklar')).toBeInTheDocument()
    expect(screen.getByText('Tanishuv kuni')).toBeInTheDocument()
    expect(screen.getByText('Ochiq kun')).toBeInTheDocument()
    expect(screen.getByText('Sport')).toBeInTheDocument()
    expect(screen.getByAltText('Sport kuni')).toBeInTheDocument()
  })

  it("noma'lum type uchun 'Umumiy' yorlig'i qo'llaniladi", async () => {
    mockApi({ 'GET /events': [{ ...E1, type: 'nomalum-tur' }] })
    render(<Events />)
    expect(await screen.findByText('Umumiy')).toBeInTheDocument()
  })

  it("server xatosi — offline banner ko'rsatiladi, ro'yxat bo'sh (fallback yo'q)", async () => {
    mockApi({ 'GET /events': { status: 500, body: {} } })
    render(<Events />)
    expect(await screen.findByText(/[Ss]erverga ulanib bo'lmadi/)).toBeInTheDocument()
    expect(document.querySelectorAll('.card')).toHaveLength(0)
  })

  it("javob massiv bo'lmasa ({error}) — qulamaydi, ro'yxat bo'sh ko'rsatiladi", async () => {
    mockApi({ 'GET /events': { error: 'noto\'g\'ri format' } })
    render(<Events />)
    await new Promise(r => setTimeout(r, 0))
    expect(screen.queryByText('Yuklanmoqda...')).not.toBeInTheDocument()
    expect(document.querySelectorAll('.card')).toHaveLength(0)
  })

  it("XSS: sarlavha va tavsif HTML sifatida emas, matn sifatida chiqadi", async () => {
    mockApi({ 'GET /events': [{ ...E1, title: '<img src=x onerror=alert(1)>', desc: '<b>zararli</b>' }] })
    render(<Events />)
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(screen.getByText('<b>zararli</b>')).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })

  // Band 6 (admin statistika — "tadbirlar ko'rilishi"): kartaga bosilganda
  // kengaytirilgan ko'rinish (modal) ochiladi va ko'rish soni oshiriladi.
  describe('kengaytirilgan ko\'rinish (modal)', () => {
    it('kartaga bosilganda modal ochiladi va PUT /:id/view chaqiriladi', async () => {
      const { calls } = mockApi({ 'GET /events': [E1, E2] })
      const user = userEvent.setup()
      render(<Events />)
      await user.click(await screen.findByText('Ochiq eshiklar'))

      expect(await screen.findByRole('dialog')).toBeInTheDocument()
      // Modal ichida sarlavha yana bir marta chiqadi (h3 sifatida)
      expect(screen.getAllByText('Ochiq eshiklar').length).toBeGreaterThanOrEqual(2)
      await waitFor(() => expect(calls.some(c => c.method === 'PUT' && c.path === '/events/e1/view')).toBe(true))
    })

    it('Yopish tugmasi bosilganda modal yopiladi', async () => {
      mockApi({ 'GET /events': [E1] })
      const user = userEvent.setup()
      render(<Events />)
      await user.click(await screen.findByText('Ochiq eshiklar'))
      await screen.findByRole('dialog')

      await user.click(screen.getByRole('button', { name: 'Modalni yopish' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('Escape bosilganda modal yopiladi', async () => {
      mockApi({ 'GET /events': [E1] })
      const user = userEvent.setup()
      render(<Events />)
      await user.click(await screen.findByText('Ochiq eshiklar'))
      await screen.findByRole('dialog')

      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('klaviatura bilan (Enter) ham ochish mumkin', async () => {
      mockApi({ 'GET /events': [E1] })
      const user = userEvent.setup()
      render(<Events />)
      const cardTitle = await screen.findByText('Ochiq eshiklar')
      cardTitle.closest('[role="button"]').focus()
      await user.keyboard('{Enter}')
      expect(await screen.findByRole('dialog')).toBeInTheDocument()
    })

    it("ko'rish so'rovi (PUT .../view) muvaffaqiyatsiz bo'lsa ham modal ochiladi", async () => {
      // mockApi haqiqiy tarmoq xatosini emulyatsiya qilolmaydi (har doim
      // Promise.resolve qaytaradi) — shuning uchun HTTP 500 ishlatiladi.
      // Events.jsx bu chaqiruvning javobini/xatosini umuman tekshirmaydi
      // (fetch(...).catch(() => {})), shuning uchun bu ham yetarli tekshiruv.
      mockApi({
        'GET /events': [E1],
        'PUT /events/e1/view': { status: 500, body: {} },
      })
      render(<Events />)
      const user = userEvent.setup()
      const card = await screen.findByText('Ochiq eshiklar')
      await user.click(card)
      expect(await screen.findByRole('dialog')).toBeInTheDocument()
    })
  })

  // ── 6.11c3 ──────────────────────────────────────────────────────────────
  it("tur chip'i `data-type` bilan beriladi (rang CSS da); noma'lum tur → general", async () => {
    mockApi({ 'GET /events': [E1, E2, { ...E1, _id: 'e3', title: 'Boshqa', type: 'nomalum-tur' }] })
    render(<Events />)
    await screen.findByText('Ochiq eshiklar')
    const types = [...document.querySelectorAll('.ev-card .ev-chip')].map(c => c.dataset.type)
    expect(types).toEqual(['open', 'sport', 'general'])
    expect(document.querySelectorAll('.ev-chip .cat-dot[aria-hidden="true"]')).toHaveLength(3)
  })

  it("karta: kun/oy nishonchasi aria-hidden, to'liq sana matni va rasm bor; inline style yo'q", async () => {
    mockApi({ 'GET /events': [E2] })
    render(<Events />)
    await screen.findByText('Sport kuni')
    const date = document.querySelector('.ev-date')
    expect(date).toHaveAttribute('aria-hidden', 'true')
    expect(date.querySelector('.ev-date__day')).toHaveTextContent('10')
    expect(document.querySelector('.ev-when')).toHaveTextContent('10')
    expect(document.body.querySelector('[style]')).toBeNull()
  })

  it("rasmsiz va sanasiz tadbir — sana plitkasida taqvim ikonkasi, `.ev-when` yo'q", async () => {
    mockApi({ 'GET /events': [{ _id: 'e9', title: 'Sanasiz', desc: 'x', type: 'culture' }] })
    render(<Events />)
    await screen.findByText('Sanasiz')
    expect(document.querySelector('.ev-date svg')).not.toBeNull()
    expect(document.querySelector('.ev-date__day')).toBeNull()
    expect(document.querySelector('.ev-when')).toBeNull()
  })

  it("modal: role=dialog, aria-labelledby sarlavhaga, yopish tugmasi fokusda; rasm bo'lsa `data-over-image`; Esc yopadi", async () => {
    mockApi({ 'GET /events': [E2] })
    const user = userEvent.setup()
    render(<Events />)
    await user.click(await screen.findByText('Sport kuni'))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'event-modal-title')
    expect(document.getElementById('event-modal-title')).toHaveTextContent('Sport kuni')
    const close = screen.getByRole('button', { name: 'Modalni yopish' })
    expect(close).toHaveAttribute('data-over-image', 'true')
    expect(close).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it("modal: rasmsiz tadbirda yopish tugmasi `data-over-image` olmaydi", async () => {
    mockApi({ 'GET /events': [E1] })
    const user = userEvent.setup()
    render(<Events />)
    await user.click(await screen.findByText('Ochiq eshiklar'))
    expect(screen.getByRole('button', { name: 'Modalni yopish' })).not.toHaveAttribute('data-over-image')
  })

  it("server xatosi — `.notice-banner` (role=status) ko'rsatiladi", async () => {
    mockApi({ 'GET /events': { status: 500, body: {} } })
    render(<Events />)
    const banner = await screen.findByRole('status')
    expect(banner).toHaveClass('notice-banner')
  })
})
