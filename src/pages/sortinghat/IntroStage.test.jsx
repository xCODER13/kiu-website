import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import IntroStage from './IntroStage'
import { QUESTIONS } from './Data.jsx'

describe('IntroStage', () => {
  it("4 ta ma'lumot kartasi chiqadi", () => {
    render(<IntroStage onStart={() => {}} />)
    expect(screen.getByText(`${QUESTIONS.length} ta savol`)).toBeInTheDocument()
    expect(screen.getByText('3 daqiqa')).toBeInTheDocument()
    expect(screen.getByText('Top 3 tavsiya')).toBeInTheDocument()
    expect(screen.getByText('Shaxsiy tahlil')).toBeInTheDocument()
  })

  // 6.11d: JS'da hisoblangan `INFO_CARD_MIN_WIDTH`/`INFO_CARD_GAP` (auto-fit) olib tashlandi: setka CSS'da aniq `repeat(4, 1fr)`,
  // konteyner 760 px. Regressiya (4-karta pastki qatorga tushishi) endi CSS testida (`pages.test.js`) tekshiriladi.
  it("karta ro'yxat (`ul > li`) ko'rinishida, inline stilsiz; ustun soni CSS'da", () => {
    const { container } = render(<IntroStage onStart={() => {}} />)
    const grid = screen.getByText('3 daqiqa').closest('ul')
    expect(grid).toHaveClass('sh-info')
    expect(grid.children).toHaveLength(4)
    expect(grid.hasAttribute('style')).toBe(false)
    expect(container.querySelector('[style]')).toBeNull()
  })

  it('"Qanday ishlaydi" — tartiblangan 4 qadam (`ol`), raqamlar dekorativ', () => {
    const { container } = render(<IntroStage onStart={() => {}} />)
    const steps = container.querySelectorAll('ol.sh-steps > li')
    expect(steps).toHaveLength(4)
    steps.forEach(li => expect(li.querySelector('.sh-step__num')).toHaveAttribute('aria-hidden', 'true'))
    expect(screen.getByRole('heading', { name: 'Qanday ishlaydi?' })).toBeInTheDocument()
  })

  it('"Testni boshlash" tugmasi onStart ni chaqiradi', () => {
    const onStart = vi.fn()
    render(<IntroStage onStart={onStart} />)
    const btn = screen.getByRole('button', { name: /Testni boshlash/ })
    expect(btn).toHaveClass('btn', 'btn-primary', 'sh-start')
    expect(btn).toHaveAttribute('type', 'button')
    fireEvent.click(btn)
    expect(onStart).toHaveBeenCalledTimes(1)
  })
})
