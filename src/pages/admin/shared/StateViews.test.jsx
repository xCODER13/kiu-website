import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingState, ErrorState, EmptyState, ErrorBanner } from './StateViews.jsx'

// 6.22: taxtadagi "karta holatlari" va "sahifa darajasidagi holatlar"
describe('StateViews', () => {
  it('LoadingState: `role="status"`, standart matn va yashirin spinner', () => {
    const { container } = render(<LoadingState />)
    expect(screen.getByRole('status')).toHaveTextContent('Yuklanmoqda...')
    expect(container.querySelector('.adm-load-state-spinner')).toHaveAttribute('aria-hidden', 'true')
  })

  it('ErrorState: `role="alert"`, standart va maxsus matn, ikonka bor', () => {
    const { rerender } = render(<ErrorState />)
    expect(screen.getByRole('alert')).toHaveTextContent('Yuklashda xatolik yuz berdi.')
    expect(screen.getByRole('alert').querySelector('svg')).not.toBeNull()
    rerender(<ErrorState>Trendni yuklashda xatolik yuz berdi.</ErrorState>)
    expect(screen.getByRole('alert')).toHaveTextContent('Trendni yuklashda xatolik yuz berdi.')
  })

  it("EmptyState: ikonka plitkasi (yashirin) + \"Ma'lumot yo'q\"", () => {
    const { container } = render(<EmptyState />)
    expect(screen.getByText("Ma'lumot yo'q")).toBeInTheDocument()
    expect(container.querySelector('.adm-empty-state-icon')).toHaveAttribute('aria-hidden', 'true')
  })

  it('ErrorBanner: `role="alert"` va matn', () => {
    render(<ErrorBanner>Statistikani yuklashda xatolik yuz berdi.</ErrorBanner>)
    const banner = screen.getByRole('alert')
    expect(banner).toHaveClass('adm-banner')
    expect(banner).toHaveTextContent('Statistikani yuklashda xatolik yuz berdi.')
  })
})
