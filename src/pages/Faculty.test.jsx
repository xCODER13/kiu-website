import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Faculty from './Faculty'
import { BAKALAVR, MAGISTRATURA } from './faculty/data'
import uz from '../i18n/locales/uz.json'

function renderFaculty() {
  return render(
    <MemoryRouter>
      <Faculty />
    </MemoryRouter>
  )
}

describe('Faculty (public)', () => {
  it("sarlavha ko'rsatiladi va standart tab 'Bakalavr' bo'lib, barcha yo'nalishlar ko'rsatiladi", () => {
    renderFaculty()
    expect(screen.getByText("Yo'nalishlar")).toBeInTheDocument()
    expect(screen.getByText("Maktabgacha ta'lim")).toBeInTheDocument()
    expect(screen.getAllByText(String(BAKALAVR.length))).not.toHaveLength(0)
    expect(screen.getAllByText('4 yil').length).toBeGreaterThan(0)
  })

  it("'Magistratura' tabiga o'tilganda ro'yxat va statistika yangilanadi", async () => {
    const user = userEvent.setup()
    renderFaculty()
    await user.click(screen.getByRole('button', { name: /Magistratura/ }))
    expect(screen.getByText('Lingvistika (Ingliz tili)')).toBeInTheDocument()
    expect(screen.queryByText("Maktabgacha ta'lim")).not.toBeInTheDocument()
    expect(screen.getAllByText('2 yil').length).toBeGreaterThan(0)
    expect(screen.getAllByText(String(MAGISTRATURA.length)).length).toBeGreaterThan(0)
  })

  it("kartani sichqoncha bilan bosish tegishli ma'lumotlar bilan modalni ochadi", async () => {
    const user = userEvent.setup()
    renderFaculty()
    await user.click(screen.getByText("Maktabgacha ta'lim"))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: "Maktabgacha ta'lim" })).toBeInTheDocument()
    expect(within(dialog).getByText("12 850 000 so'm")).toBeInTheDocument()
    expect(within(dialog).getByText(/^Bakalavr$/)).toBeInTheDocument()
  })

  it("'Modalni yopish' tugmasi bosilganda modal yopiladi", async () => {
    const user = userEvent.setup()
    renderFaculty()
    await user.click(screen.getByText("Maktabgacha ta'lim"))
    await user.click(screen.getByRole('button', { name: 'Modalni yopish' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('Escape tugmasi bosilganda modal yopiladi', async () => {
    const user = userEvent.setup()
    renderFaculty()
    await user.click(screen.getByText("Maktabgacha ta'lim"))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('overlay (fon) bosilganda yopiladi, modal ichiga bosilganda yopilmaydi', async () => {
    const user = userEvent.setup()
    renderFaculty()
    await user.click(screen.getByText("Maktabgacha ta'lim"))
    const dialog = screen.getByRole('dialog')
    await user.click(dialog)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(dialog.parentElement)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it("regressiya: karta klaviatura bilan fokus qilinadi va Enter/Space bilan modalni ochadi", () => {
    renderFaculty()
    const card = screen.getByText("Maktabgacha ta'lim").closest('[role="button"]')
    expect(card).toHaveAttribute('tabIndex', '0')
    card.focus()
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })

    fireEvent.keyDown(card, { key: ' ' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('modal ochilganda yopish tugmasiga fokus tushadi, yopilgach avvalgi elementga (kartaga) qaytadi', () => {
    renderFaculty()
    const card = screen.getByText("Maktabgacha ta'lim").closest('[role="button"]')
    card.focus()
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Modalni yopish' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(card)
  })
})

describe('Faculty — <style> inject va JS hover CSS ga ko\'chirilgan (Bosqich 5c)', () => {
  it("`<style id=\"faculty-styles\">` endi hujjatga qo'shilmaydi", () => {
    renderFaculty()
    expect(document.getElementById('faculty-styles')).toBeNull()
    expect(document.querySelectorAll('style')).toHaveLength(0)
  })

  // 6.11a: `--accent` (har yo'nalishning o'z rangi) bekor qilindi — endi faqat animation-delay dinamik.
  it("karta: faqat animation-delay inline (rang yo'q); hover inline stilni o'zgartirmaydi", async () => {
    const user = userEvent.setup()
    renderFaculty()
    const card = screen.getByText("Maktabgacha ta'lim").closest('.faculty-card')
    expect(card).toHaveClass('card', 'faculty-card')
    expect(card).toHaveAttribute('role', 'button')
    const before = card.getAttribute('style')
    const props = before.split(';').map(d => d.split(':')[0].trim()).filter(Boolean)
    expect(props).toEqual(['animation-delay'])
    await user.hover(card)
    expect(card.getAttribute('style')).toBe(before)
    await user.unhover(card)
    expect(card.getAttribute('style')).toBe(before)
  })

  it("tab tugmalari klasslar bilan (`kiu-tab-*`)", () => {
    const { container } = renderFaculty()
    expect(container.querySelector('.kiu-tab-wrap')).toBeInTheDocument()
    expect(container.querySelectorAll('.kiu-tab-btn')).toHaveLength(2)
    expect(container.querySelectorAll('.kiu-tab-badge')).toHaveLength(2)
  })
})

describe("Faculty — qayta dizayn (Bosqich 6.11a)", () => {
  it("umumiy ichki hero: h1 va ta'rif `.inner-hero` ichida; tab almashtirgich hero ichida", () => {
    const { container } = renderFaculty()
    const hero = container.querySelector('.inner-hero')
    expect(hero).toBeInTheDocument()
    expect(within(hero).getByRole('heading', { level: 1, name: "Yo'nalishlar" })).toBeInTheDocument()
    expect(hero.querySelector('.kiu-tab-wrap')).toBeInTheDocument()
  })

  it("tab: faol tab `data-active` va `aria-pressed`; almashtirilganda holat ko'chadi", async () => {
    const user = userEvent.setup()
    renderFaculty()
    const bak = screen.getByRole('button', { name: /Bakalavr/ })
    const mag = screen.getByRole('button', { name: /Magistratura/ })
    expect(bak).toHaveAttribute('aria-pressed', 'true')
    expect(bak).toHaveAttribute('data-active', 'true')
    expect(mag).toHaveAttribute('aria-pressed', 'false')
    await user.click(mag)
    expect(mag).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Bakalavr/ })).toHaveAttribute('data-active', 'false')
  })

  it("statistika: bitta karta ichida 4 katak (yo'nalish soni, davomiylik, eng past narx, o'qish shakli)", () => {
    const { container } = renderFaculty()
    const stats = container.querySelector('.fac-stats')
    expect(stats).toHaveClass('card')
    expect(stats.querySelectorAll('.fac-stat')).toHaveLength(4)
    expect(within(stats).getByText(String(BAKALAVR.length))).toBeInTheDocument()
    expect(within(stats).getByText('Kunduzgi')).toBeInTheDocument()
    expect(within(stats).getByText("12 850 000 so'm")).toBeInTheDocument()
  })

  it("regressiya: hamma kartada `style` dagi qiymatlar rangsiz (data.js dagi `color` stilga qo'yilmaydi)", () => {
    const { container } = renderFaculty()
    const cards = container.querySelectorAll('.faculty-card')
    expect(cards).toHaveLength(BAKALAVR.length)
    for (const c of cards) expect(c.outerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|rgb/i)
  })

  it("modal: hamma element klass bilan (inline style yo'q); asosiy tugma `.btn-primary` /admission ga, telefon `.btn-secondary` `tel:` havolasi", async () => {
    const user = userEvent.setup()
    renderFaculty()
    await user.click(screen.getByText("Maktabgacha ta'lim"))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('fac-modal')
    expect(dialog.parentElement).toHaveClass('fac-modal-overlay')
    expect(dialog.querySelectorAll('[style]')).toHaveLength(0)
    const apply = within(dialog).getByRole('link', { name: /Ariza topshirish/ })
    expect(apply).toHaveClass('btn', 'btn-primary')
    expect(apply).toHaveAttribute('href', '/admission')
    const phone = within(dialog).getByRole('link', { name: /\+998 55 500 99 44/ })
    expect(phone).toHaveClass('btn', 'btn-secondary')
    expect(phone).toHaveAttribute('href', 'tel:+998555009944')
    expect(dialog.querySelector('.fac-deadline')).toHaveTextContent('Qabul muddati')
  })

  it("modal: izoh (note) faqat `hasNote` bo'lgan yo'nalishda ko'rinadi", async () => {
    const user = userEvent.setup()
    renderFaculty()
    const withNote = BAKALAVR.find(p => p.hasNote)
    const withoutNote = BAKALAVR.find(p => !p.hasNote)
    await user.click(screen.getByText(uz.faculty.programs[withoutNote.id].name))
    expect(screen.getByRole('dialog').querySelector('.fac-note')).toBeNull()
    await user.keyboard('{Escape}')
    await user.click(screen.getByText(uz.faculty.programs[withNote.id].name))
    expect(screen.getByRole('dialog').querySelector('.fac-note')).toHaveTextContent(uz.faculty.programs[withNote.id].note)
  })
})
