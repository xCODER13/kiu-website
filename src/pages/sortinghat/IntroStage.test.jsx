import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import IntroStage, { INFO_CARD_MIN_WIDTH, INFO_CARD_GAP } from './IntroStage'
import { QUESTIONS } from './Data.jsx'

// SortingHat sahifasi konteyneri maxWidth: 680px, ichki bo'sh joyni olib tashlagach
// kontent kengligi ~615px (haqiqiy brauzerda o'lchangan).
const CONTENT_WIDTH = 615

describe('IntroStage', () => {
  it("4 ta ma'lumot kartasi chiqadi", () => {
    render(<IntroStage onStart={() => {}} />)
    expect(screen.getByText(`${QUESTIONS.length} ta savol`)).toBeInTheDocument()
    expect(screen.getByText('3 daqiqa')).toBeInTheDocument()
    expect(screen.getByText('Top 3 tavsiya')).toBeInTheDocument()
    expect(screen.getByText('Shaxsiy tahlil')).toBeInTheDocument()
  })

  it("4 ta karta konteyner kengligida (~615px) bitta qatorga sig'adi", () => {
    // Regressiya: minimal ustun 148px bo'lganda 4*148 + 3*12 = 628px > 615px edi va
    // to'rtinchi karta ("Shaxsiy tahlil") pastki qatorga tushib qolgan.
    expect(4 * INFO_CARD_MIN_WIDTH + 3 * INFO_CARD_GAP).toBeLessThanOrEqual(CONTENT_WIDTH)
  })

  it("setka minimal ustun kengligini stildan oladi (auto-fit)", () => {
    const { container } = render(<IntroStage onStart={() => {}} />)
    const grid = screen.getByText('3 daqiqa').closest('.card').parentElement
    expect(grid.style.gridTemplateColumns).toContain(`minmax(${INFO_CARD_MIN_WIDTH}px`)
    expect(grid.children).toHaveLength(4)
    expect(container.firstChild).toContainElement(grid)
  })

  it('"Testni boshlash" tugmasi onStart ni chaqiradi', () => {
    const onStart = vi.fn()
    render(<IntroStage onStart={onStart} />)
    fireEvent.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    expect(onStart).toHaveBeenCalledTimes(1)
  })
})