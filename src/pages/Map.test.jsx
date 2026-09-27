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