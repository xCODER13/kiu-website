import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Logo from './Logo'

/* global process */
describe('Logo', () => {
  it("role=img va i18n'dagi alt matni bor", () => {
    render(<Logo />)
    expect(screen.getByRole('img', { name: 'KIU logo' })).toBeInTheDocument()
  })

  it("rang currentColor'dan olinadi (qattiq rang yo'q)", () => {
    const { container } = render(<Logo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg.innerHTML).not.toMatch(/#[0-9a-f]{3,6}/i)
  })

  it('nisbat 100:78 saqlanadi', () => {
    const { container } = render(<Logo height={39} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('height', '39')
    expect(Number(svg.getAttribute('width'))).toBeCloseTo(50, 5)
  })

  it('juda kichik balandlik 19 px ga ko\'tariladi (teshiklar yo\'qolmasligi uchun)', () => {
    const { container } = render(<Logo height={10} />)
    expect(container.querySelector('svg')).toHaveAttribute('height', '19')
  })

  it('decorative: ekran o\'qiydigan dasturlardan yashirinadi (role/aria-label yo\'q)', () => {
    const { container } = render(<Logo decorative />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
    expect(svg).not.toHaveAttribute('aria-label')
  })

  it('public/logo.svg bilan bir xil kontur (ikki nusxa chetga chiqmasin)', () => {
    const file = readFileSync(resolve(process.cwd(), 'public/logo.svg'), 'utf8')
    const fileD = file.match(/ d="([^"]+)"/)[1]
    const { container } = render(<Logo />)
    expect(container.querySelector('path')).toHaveAttribute('d', fileD)
  })
})
