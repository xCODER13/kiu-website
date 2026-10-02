import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Faculty from './Faculty'
import { BAKALAVR, MAGISTRATURA } from './faculty/data'

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

  it("karta: faqat dinamik qiymatlar inline (`--accent`, animation-delay); hover inline stilni o'zgartirmaydi", async () => {
    const user = userEvent.setup()
    renderFaculty()
    const card = screen.getByText("Maktabgacha ta'lim").closest('.faculty-card')
    expect(card).toHaveClass('card', 'faculty-card')
    expect(card).toHaveAttribute('role', 'button')
    const before = card.getAttribute('style')
    expect(before).toMatch(/--accent:/)
    const props = before.split(';').map(d => d.split(':')[0].trim()).filter(Boolean)
    expect(props).toEqual(['--accent', 'animation-delay'])
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
