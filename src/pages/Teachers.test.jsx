import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Teachers from './Teachers'
import { mockApi } from '../test/helpers'

const T1 = { _id: 't1', name: 'Ali Valiyev', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi' }
const T2 = { _id: 't2', name: 'Vali Aliyev', role: 'Dotsent', dept: "Ijtimoiy fanlar kafedrasi", image: 'https://s/1.jpg' }

describe('Teachers (public)', () => {
  it('yuklanish paytida "Yuklanmoqda..." ko\'rsatadi', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<Teachers />)
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()
  })

  it("muvaffaqiyatli javob — o'qituvchilar ism, lavozim va kafedra bilan ko'rsatiladi", async () => {
    mockApi({ 'GET /teachers': [T1, T2] })
    render(<Teachers />)
    expect(await screen.findByText('Ali Valiyev')).toBeInTheDocument()
    expect(screen.getByText("O'qituvchi")).toBeInTheDocument()
    // "Aniq fanlar kafedrasi" ham yon panelda (filtr tugmasi), ham kartada chiqadi
    expect(screen.getAllByText('Aniq fanlar kafedrasi')).toHaveLength(2)
    expect(screen.getByAltText('Vali Aliyev')).toBeInTheDocument()
  })

  it("rasm bo'lmasa ismning bosh ikki harfi avatar sifatida ko'rsatiladi", async () => {
    mockApi({ 'GET /teachers': [T1] })
    render(<Teachers />)
    await screen.findByText('Ali Valiyev')
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('kafedra bo\'yicha filtrlash — faqat tanlangan kafedradagi o\'qituvchilarni ko\'rsatadi', async () => {
    mockApi({ 'GET /teachers': [T1, T2] })
    const user = userEvent.setup()
    render(<Teachers />)
    await screen.findByText('Ali Valiyev')
    await user.click(screen.getByRole('button', { name: /Ijtimoiy fanlar kafedrasi/ }))
    expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument()
    expect(screen.getByText('Vali Aliyev')).toBeInTheDocument()
    expect(screen.getByText(/Ijtimoiy fanlar kafedrasi — 1 nafar/)).toBeInTheDocument()
  })

  it('"Barcha o\'qituvchilar" tugmasi filtrni tozalaydi', async () => {
    mockApi({ 'GET /teachers': [T1, T2] })
    const user = userEvent.setup()
    render(<Teachers />)
    await screen.findByText('Ali Valiyev')
    await user.click(screen.getByRole('button', { name: /Ijtimoiy fanlar kafedrasi/ }))
    expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Barcha o'qituvchilar/ }))
    expect(screen.getByText('Ali Valiyev')).toBeInTheDocument()
    expect(screen.getByText('Vali Aliyev')).toBeInTheDocument()
  })

  it("server xatosi — banner ko'rsatiladi, lekin standart (fallback) o'qituvchilar baribir chiqadi", async () => {
    mockApi({ 'GET /teachers': { status: 500, body: {} } })
    render(<Teachers />)
    expect(await screen.findByText(/saqlangan ma'lumotlar ko'rsatilmoqda/)).toBeInTheDocument()
    expect(screen.getByText("Panjiyev Ulug'bek Rustamovich")).toBeInTheDocument()
  })

  it("javob massiv bo'lmasa ({error}) — qulamaydi, ro'yxat bo'sh ko'rsatiladi", async () => {
    mockApi({ 'GET /teachers': { error: "noto'g'ri format" } })
    render(<Teachers />)
    expect(await screen.findByText("Bu kafedraga biriktirilgan o'qituvchi topilmadi")).toBeInTheDocument()
  })

  it("XSS: ism va lavozim HTML sifatida emas, matn sifatida chiqadi", async () => {
    mockApi({ 'GET /teachers': [{ ...T1, name: '<img src=x onerror=alert(1)>' }] })
    render(<Teachers />)
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })
})