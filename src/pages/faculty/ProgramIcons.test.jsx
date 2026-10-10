import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { PROGRAM_ICONS, programIcon } from './ProgramIcons.jsx'
import { IC } from './Icons.jsx'
import { BAKALAVR, MAGISTRATURA } from './data'

describe('Yo\'nalish ikonkalari (to\'ldirilgan piktogrammalar)', () => {
  it("har bir bakalavriat va magistratura yo'nalishi uchun ikonka bor", () => {
    for (const p of [...BAKALAVR, ...MAGISTRATURA]) expect(PROGRAM_ICONS[p.id], p.id).toBeTypeOf('function')
  })

  it("ikonka dekorativ SVG: aria-hidden, 48×48 viewBox, berilgan o'lcham, rang — currentColor", () => {
    for (const p of [...BAKALAVR, ...MAGISTRATURA]) {
      const { container } = render(programIcon(p, 30, IC))
      const svg = container.querySelector('svg')
      expect(svg, p.id).toHaveAttribute('aria-hidden', 'true')
      expect(svg).toHaveAttribute('viewBox', '0 0 48 48')
      expect(svg).toHaveAttribute('width', '30')
      expect(svg).toHaveAttribute('fill', 'currentColor')
      expect(svg.querySelectorAll('path, circle, rect').length).toBeGreaterThan(0)
    }
  })

  it("noma'lum id uchun `icon` kaliti bo'yicha chiziqli IC ikonkasiga qaytadi", () => {
    const { container } = render(programIcon({ id: 'yangi', icon: 'book' }, 24, IC))
    expect(container.querySelector('svg')).toHaveAttribute('stroke', 'currentColor')
    expect(programIcon({ id: 'yangi', icon: 'yoq' }, 24, IC)).toBeNull()
  })

  it("fayl rang kodsiz (hex/rgb yo'q) — rang CSS tokenlaridan (currentColor) keladi", () => {
    const src = readFileSync('src/pages/faculty/ProgramIcons.jsx', 'utf-8')
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b(?!\w)/)
    expect(src).not.toMatch(/rgb\(|hsl\(/)
  })
})
