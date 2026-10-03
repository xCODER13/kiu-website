import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
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
    // 6.11c3: soni muted <span> ichida — matn ikkita tugunga bo'lingan, shuning uchun butun blokning matni tekshiriladi
    expect(document.querySelector('.kafedra-selected')).toHaveTextContent(/Ijtimoiy fanlar kafedrasi — 1 nafar/)
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

  it("server xatosi — offline banner ko'rsatiladi, ro'yxat bo'sh (fallback yo'q)", async () => {
    mockApi({ 'GET /teachers': { status: 500, body: {} } })
    render(<Teachers />)
    expect(await screen.findByText(/[Ss]erverga ulanib bo'lmadi/)).toBeInTheDocument()
    expect(screen.getByText("Bu kafedraga biriktirilgan o'qituvchi topilmadi")).toBeInTheDocument()
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

  // ── Himoya: o'qituvchi emaili ommaviy saytda ko'rsatilmaydi (DESIGN.md qaror 51) ──
  it("elektron pochta ommaviy kartada ko'rsatilmaydi — API qaytarsa ham (mailto yo'q)", async () => {
    mockApi({ 'GET /teachers': [{ ...T1, email: 'ali@kiu.uz' }] })
    render(<Teachers />)
    await screen.findByText('Ali Valiyev')
    expect(screen.queryByText(/ali@kiu\.uz/)).toBeNull()
    expect(document.querySelector('.teacher-card__email')).toBeNull()
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull()
  })

  it("kafedra tugmalari `aria-pressed` + `data-active` bilan; hisoblagich ko'rsatiladi", async () => {
    mockApi({ 'GET /teachers': [T1, T2] })
    const user = userEvent.setup()
    render(<Teachers />)
    await screen.findByText('Ali Valiyev')
    const all = screen.getByRole('button', { name: /Barcha o'qituvchilar/ })
    expect(all).toHaveAttribute('aria-pressed', 'true')
    expect(all).toHaveAttribute('data-active', 'true')
    expect(all.querySelector('.kafedra-btn__count')).toHaveTextContent('2')
    const soc = screen.getByRole('button', { name: /Ijtimoiy fanlar kafedrasi/ })
    expect(soc).toHaveAttribute('aria-pressed', 'false')
    await user.click(soc)
    expect(soc).toHaveAttribute('aria-pressed', 'true')
    expect(all).toHaveAttribute('data-active', 'false')
  })

  it("kafedralar paneli yig'iladi: `aria-expanded` o'zgaradi, ro'yxat olib tashlanadi", async () => {
    mockApi({ 'GET /teachers': [T1] })
    const user = userEvent.setup()
    render(<Teachers />)
    await screen.findByText('Ali Valiyev')
    const toggle = screen.getByRole('button', { name: /Kafedralar/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAttribute('aria-controls', 'kafedra-list')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById('kafedra-list')).toBeNull()
  })

  it("avatar: bosh harflar aria-hidden, rasm ustida yotadi; rasm yuklanmasa `data-broken`; inline style yo'q", async () => {
    mockApi({ 'GET /teachers': [T2] })
    render(<Teachers />)
    const img = await screen.findByAltText('Vali Aliyev')
    expect(img.parentElement.querySelector('span[aria-hidden="true"]')).toHaveTextContent('VA')
    fireEvent.error(img)
    expect(img).toHaveAttribute('data-broken', 'true')
    expect(document.body.querySelector('[style]')).toBeNull()
  })

  describe('modal', () => {
    const T3 = { _id: 't3', name: 'Karim Soliyev', role: 'Professor', dept: 'Aniq fanlar kafedrasi', avatar: 'KS' }

    it("karta bosilganda modal ochiladi: ism, lavozim va kafedra; hamkasblar soni va email yo'q", async () => {
      mockApi({ 'GET /teachers': [{ ...T1, email: 'ali@kiu.uz' }, T2, T3] })
      const user = userEvent.setup()
      render(<Teachers />)
      await user.click(await screen.findByText('Ali Valiyev'))
      const dialog = screen.getByRole('dialog', { name: 'Ali Valiyev' })
      expect(dialog).toHaveTextContent("O'qituvchi")
      expect(dialog).toHaveTextContent('Aniq fanlar kafedrasi')
      expect(dialog).not.toHaveTextContent('nafar') // kafedradagi o'qituvchilar soni ko'rsatilmaydi
      expect(dialog).not.toHaveTextContent('ali@kiu.uz')
      expect(dialog.querySelector('[style]')).toBeNull()
    })

    it("klaviatura: Enter bilan ochiladi, Esc bilan yopiladi va fokus kartaga qaytadi", async () => {
      mockApi({ 'GET /teachers': [T1] })
      const user = userEvent.setup()
      render(<Teachers />)
      await screen.findByText('Ali Valiyev')
      const card = screen.getByRole('button', { name: /Ali Valiyev/ })
      card.focus()
      await user.keyboard('{Enter}')
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(card).toHaveFocus()
    })

    it("yopish tugmasi va fon (overlay) modalni yopadi; modal ichiga bosish yopmaydi", async () => {
      mockApi({ 'GET /teachers': [T1] })
      const user = userEvent.setup()
      render(<Teachers />)
      await user.click(await screen.findByText('Ali Valiyev'))
      await user.click(screen.getByRole('dialog'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Oynani yopish' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await user.click(screen.getByText('Ali Valiyev'))
      await user.click(document.querySelector('.fac-modal-overlay'))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it("rasm bo'lmasa bosh harflar, bo'lsa dekorativ rasm (alt bo'sh) ko'rsatiladi; XSS matn DOM'ga HTML bo'lib tushmaydi", async () => {
      mockApi({ 'GET /teachers': [T3, { ...T2, name: '<img src=x onerror=alert(1)>' }] })
      const user = userEvent.setup()
      render(<Teachers />)
      await user.click(await screen.findByText('Karim Soliyev'))
      expect(within(screen.getByRole('dialog')).getByText('KS')).toBeInTheDocument()
      await user.keyboard('{Escape}')
      await user.click(screen.getByText('<img src=x onerror=alert(1)>'))
      const dlg = screen.getByRole('dialog')
      expect(dlg.querySelector('img[alt=""]')).not.toBeNull()
      expect(dlg.querySelectorAll('img[onerror]')).toHaveLength(0)
    })
  })
})
