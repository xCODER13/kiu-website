import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import ScrollToTop from './ScrollToTop'

function Harness({ start = '/faq' }) {
  return (
    <MemoryRouter initialEntries={[start]}>
      <ScrollToTop />
      <nav>
        <Link to="/news">news</Link>
        <Link to="/en/faq">en-faq</Link>
        <Link to="/news#sec">news-hash</Link>
      </nav>
      <Routes><Route path="*" element={<div id="sec">x</div>} /></Routes>
    </MemoryRouter>
  )
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('birinchi renderda scroll qilmaydi', () => {
    render(<Harness />)
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it("boshqa sahifaga o'tganda tepaga (darhol — smooth emas) qaytaradi", async () => {
    const { getByText } = render(<Harness />)
    await userEvent.click(getByText('news'))
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })

  it("til almashtirilganda (bir xil sahifa) scroll joyida qoladi", async () => {
    const { getByText } = render(<Harness />)
    await userEvent.click(getByText('en-faq'))
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it("#hash bo'lsa — elementga o'tadi", async () => {
    const { getByText } = render(<Harness />)
    await userEvent.click(getByText('news-hash'))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' })
  })
})
