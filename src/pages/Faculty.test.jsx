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