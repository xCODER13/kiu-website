import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import useCarouselPause from './useCarouselPause'

function Demo() {
  const { paused, handlers } = useCarouselPause()
  return (
    <div data-testid="box" data-paused={String(paused)} {...handlers}>
      <button>ichki</button>
    </div>
  )
}
const state = () => screen.getByTestId('box').dataset.paused

describe('useCarouselPause (WCAG 2.2.2)', () => {
  afterEach(() => { vi.unstubAllGlobals(); delete window.matchMedia })

  it('sichqoncha ustida to\'xtaydi, chiqqach davom etadi', () => {
    render(<Demo />)
    expect(state()).toBe('false')
    fireEvent.mouseEnter(screen.getByTestId('box'))
    expect(state()).toBe('true')
    fireEvent.mouseLeave(screen.getByTestId('box'))
    expect(state()).toBe('false')
  })

  it("klaviatura fokusida (`:focus-visible`) to'xtaydi; fokus tashqariga chiqqach davom etadi; guruh ichida o'tishda to'xtamaydi", () => {
    render(<Demo />)
    const btn = screen.getByRole('button')
    // jsdom `:focus-visible` ni to'g'ri hisoblamaydi — brauzer qiymatini qo'lda belgilaymiz
    btn.matches = sel => sel === ':focus-visible'
    fireEvent.focus(btn)
    expect(state()).toBe('true')
    fireEvent.blur(btn, { relatedTarget: screen.getByTestId('box') }) // guruh ichiga
    expect(state()).toBe('true')
    fireEvent.blur(btn, { relatedTarget: document.body })
    expect(state()).toBe('false')
  })

  it("sichqoncha bilan bosilgan fokus (`:focus-visible` emas) avtoaylanishni to'xtatib qo'ymaydi", () => {
    render(<Demo />)
    const btn = screen.getByRole('button')
    btn.matches = () => false
    fireEvent.focus(btn)
    expect(state()).toBe('false')
  })

  it("`prefers-reduced-motion: reduce` yoqilgan bo'lsa — doim to'xtagan (avtoaylanish yo'q)", () => {
    window.matchMedia = vi.fn(q => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
    render(<Demo />)
    expect(state()).toBe('true')
    act(() => {})
  })
})
