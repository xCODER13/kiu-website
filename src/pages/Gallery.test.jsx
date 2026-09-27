import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('lightbox "✕" tugmasi bilan yopiladi', async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    render(<Gallery />)
    const tiles = await screen.findAllByAltText('1-kampus')
    fireEvent.click(tiles[0].closest('.card'))
    fireEvent.click(screen.getByText('✕'))
    expect(screen.queryByText('✕')).not.toBeInTheDocument()
  })

  it('lightbox Escape tugmasi bilan yopiladi', async () => {
    mockApi({ 'GET /gallery': [ALBUM1] })
    render(<Gallery />)
    const tiles = await screen.findAllByAltText('1-kampus')
    fireEvent.click(tiles[0].closest('.card'))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByText('✕')).not.toBeInTheDocument()
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
})