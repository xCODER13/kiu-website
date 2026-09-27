import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Documents from './Documents'

describe('Documents (public)', () => {
  it("barcha hujjatlar sarlavha va tavsif bilan ko'rsatiladi", () => {
    render(<Documents />)
    expect(screen.getByText('Litsenziya 1')).toBeInTheDocument()
    expect(screen.getAllByText("Ta'lim faoliyatini yuritish litsenziyasi")).toHaveLength(2)
    expect(screen.getByText('Guvohnoma')).toBeInTheDocument()
    expect(screen.getByText('Jamoa shartnomasi')).toBeInTheDocument()
    expect(screen.getByText('Ichki mehnat tartibi')).toBeInTheDocument()
    expect(screen.getByText('Odob-axloq kodeksi')).toBeInTheDocument()
    // Sahifada aynan 6 ta hujjat havolasi bo'lishi kerak
    expect(screen.getAllByRole('link')).toHaveLength(6)
  })

  it("har bir havola PDF faylga to'g'ri manzil bilan, yangi tabda va xavfsiz (tabnabbing'dan himoyalangan) ochiladi", () => {
    render(<Documents />)
    const link = screen.getByText('Guvohnoma').closest('a')
    expect(link).toHaveAttribute('href', '/docs/Guvohnoma.pdf')
    expect(link).toHaveAttribute('target', '_blank')
    // rel="noreferrer" yolg'iz o'zi window.opener'ni har doim ham kafolatlab
    // bloklamaydi — noopener ham bo'lishi shart (tabnabbing himoyasi)
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
  })
})