import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Events from './Events'
import { mockApi } from '../test/helpers'

const E1 = { _id: 'e1', date: '5 mart', month: 'mart', title: 'Ochiq eshiklar', desc: 'Tanishuv kuni', type: 'open' }
const E2 = { _id: 'e2', date: '10 aprel', month: 'aprel', title: 'Sport kuni', desc: 'Musobaqalar', type: 'sport', image: 'https://s/1.jpg' }

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

  it("server xatosi — banner ko'rsatiladi, lekin standart (fallback) tadbirlar baribir chiqadi", async () => {
    mockApi({ 'GET /events': { status: 500, body: {} } })
    render(<Events />)
    expect(await screen.findByText(/saqlangan ma'lumotlar ko'rsatilmoqda/)).toBeInTheDocument()
    expect(screen.getByText('Ochiq eshiklar kuni')).toBeInTheDocument()
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
})