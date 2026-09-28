import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RankedBarChart from './RankedBarChart'

const two = [{ label: 'Birinchi', value: 5 }, { label: 'Ikkinchi', value: 2 }]
const three = [...two, { label: 'Uchinchi', value: 1 }]

// jsdom'da haqiqiy layout yo'q, shuning uchun bu yerda tekshiriladigan narsa —
// tashqi konteynerda ANIQ px balandlik borligi. `ParentSize` grafikni absolute
// konteynerda chizadi va o'zi 0 balandlikda qoladi; tashqi konteynerda aniq
// balandlik bo'lmasa, admin Statistika sahifasidagi kartalar grafikni sig'dirmay,
// grafik kartadan pastga toshib chiqib kesilib qolardi (haqiqiy brauzerda topilgan xato).
describe('RankedBarChart', () => {
  it("tashqi konteynerga aniq px balandlik beriladi (ParentSize 0 balandlikda qolmasin)", () => {
    const { container } = render(<RankedBarChart data={two} />)
    const height = parseFloat(container.firstChild.style.height)
    expect(height).toBeGreaterThan(0)
    expect(container.firstChild.style.height).toMatch(/px$/)
  })

  it("balandlik qatorlar soniga qarab o'sadi", () => {
    const { container: c2 } = render(<RankedBarChart data={two} />)
    const { container: c3 } = render(<RankedBarChart data={three} />)
    expect(parseFloat(c3.firstChild.style.height)).toBeGreaterThan(parseFloat(c2.firstChild.style.height))
  })

  it("yorliqlar va qiymatlar chiqadi", async () => {
    render(<RankedBarChart data={two} />)
    expect(await screen.findByText('Birinchi')).toBeInTheDocument()
    expect(screen.getByText('Ikkinchi')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it("bo'sh ma'lumotda matn ko'rsatiladi (grafik chizilmaydi)", () => {
    render(<RankedBarChart data={[]} emptyLabel="Hech narsa yo'q" />)
    expect(screen.getByText("Hech narsa yo'q")).toBeInTheDocument()
  })
})