import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TrendLineChart from './TrendLineChart'

const data = [1, 2, 3].map(d => ({ date: new Date(Date.UTC(2026, 8, d)), admission: d, vacancy: d * 2 }))
const series = [
  { key: 'admission', label: 'Qabul arizalari', color: 'var(--stat-amber)' },
  { key: 'vacancy', label: 'Vakansiya arizalari', color: 'var(--stat-cyan)' },
]
const dateLabel = (d, full) => `${String(d.getUTCDate()).padStart(2, '0')}${full ? ' to\'liq' : ''}`

const setup = () => render(<TrendLineChart data={data} series={series} dateLabel={dateLabel} ariaLabel="Arizalar trendi" />)

// 6.22: grafik sichqonchasiz ham ishlaydi, ekran o'quvchiga nom va qiymatlarni beradi
describe('TrendLineChart (a11y)', () => {
  it('svg: `role="img"`, nom (`aria-label`) va klaviatura fokusi (`tabIndex=0`)', async () => {
    setup()
    const svg = await screen.findByRole('img', { name: /Arizalar trendi/ })
    expect(svg).toHaveAttribute('tabindex', '0')
  })

  it("fokus — oxirgi nuqta tooltip'i; ← → Home End bilan nuqtalar orasida o'tiladi; Esc yopadi", async () => {
    setup()
    const svg = await screen.findByRole('img', { name: /Arizalar trendi/ })
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.focus(svg)
    expect(screen.getByRole('status')).toHaveTextContent("03 to'liq")
    expect(screen.getByRole('status')).toHaveTextContent('Qabul arizalari: 3')
    fireEvent.keyDown(svg, { key: 'ArrowLeft' })
    expect(screen.getByRole('status')).toHaveTextContent("02 to'liq")
    fireEvent.keyDown(svg, { key: 'Home' })
    expect(screen.getByRole('status')).toHaveTextContent("01 to'liq")
    fireEvent.keyDown(svg, { key: 'ArrowLeft' }) // chetdan chiqmaydi
    expect(screen.getByRole('status')).toHaveTextContent("01 to'liq")
    fireEvent.keyDown(svg, { key: 'End' })
    expect(screen.getByRole('status')).toHaveTextContent("03 to'liq")
    fireEvent.keyDown(svg, { key: 'Escape' })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it("fokus ketganda tooltip yopiladi; yo'naltiruvchi chiziq va 2 ta nuqta tooltip bilan birga chiziladi", async () => {
    const { container } = setup()
    const svg = await screen.findByRole('img', { name: /Arizalar trendi/ })
    expect(container.querySelector('.adm-chart-guide')).toBeNull()
    fireEvent.focus(svg)
    expect(container.querySelector('.adm-chart-guide')).not.toBeNull()
    expect(container.querySelectorAll('circle')).toHaveLength(2)
    fireEvent.blur(svg)
    expect(screen.queryByRole('status')).toBeNull()
    expect(container.querySelector('.adm-chart-guide')).toBeNull()
  })
})
