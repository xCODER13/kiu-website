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
})
