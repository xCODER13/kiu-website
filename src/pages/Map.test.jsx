import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Map from './Map'
import config from '../config'

describe('Map (smoke test)', () => {
  it("qulamasdan render bo'ladi, ikkala kampus manzili va xarita iframe'lari ko'rsatiladi", () => {
    render(<Map />)
    expect(screen.getByText('Kampus xaritasi')).toBeInTheDocument()
    expect(screen.getByText(config.contact.address1)).toBeInTheDocument()
    expect(screen.getByText(config.contact.address2)).toBeInTheDocument()
    expect(screen.getByTitle('1-kampus')).toBeInTheDocument()
    expect(screen.getByTitle('2-kampus')).toBeInTheDocument()
  })
})

describe('Map — qayta dizayn (Bosqich 6.11c2)', () => {
  it("har kampus bitta kartada: xarita `role=region` + `aria-label`, iframe xavfsizlik sozlamalari bilan", () => {
    const { container } = render(<Map />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(container.querySelectorAll('.map-card')).toHaveLength(2)
    for (const n of [1, 2]) {
      const region = screen.getByRole('region', { name: `${n}-kampus` })
      const frame = region.querySelector('iframe')
      expect(frame).toHaveAttribute('title', `${n}-kampus`)
      expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer-when-downgrade')
      expect(frame).toHaveAttribute('loading', 'lazy')
      expect(frame.getAttribute('src')).toMatch(/^https:\/\/maps\.google\.com\/maps\?q=/)
    }
  })
})
