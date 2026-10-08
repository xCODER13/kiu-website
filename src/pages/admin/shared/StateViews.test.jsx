import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoadingState, ErrorState, EmptyState, ErrorBanner, ErrorPanel } from './StateViews.jsx'

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

  // 6.23 (Arizalar)
  it('ErrorPanel: `role="alert"`, sarlavha, izoh va «Qayta urinish» tugmasi', async () => {
    const onRetry = vi.fn()
    render(<ErrorPanel title="Arizalarni yuklab bo'lmadi." onRetry={onRetry}>Internet aloqasini tekshiring.</ErrorPanel>)
    const panel = screen.getByRole('alert')
    expect(panel).toHaveTextContent("Arizalarni yuklab bo'lmadi.")
    expect(panel).toHaveTextContent('Internet aloqasini tekshiring.')
    await userEvent.click(screen.getByRole('button', { name: 'Qayta urinish' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it("ErrorPanel: `onRetry` bo'lmasa tugma chiqmaydi", () => {
    render(<ErrorPanel title="Xato" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it("EmptyState: sarlavha berilsa panel ko'rinishi (sarlavha + izoh + harakat tugmasi)", () => {
    const { container } = render(<EmptyState title="Hali ariza kelmagan" action={<button type="button">Barchasi</button>}>Izoh matni</EmptyState>)
    expect(container.firstChild).toHaveClass('adm-empty-state--panel')
    expect(screen.getByText('Hali ariza kelmagan')).toBeInTheDocument()
    expect(screen.getByText('Izoh matni')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Barchasi' })).toBeInTheDocument()
  })

  it("EmptyState: sarlavhasiz ixcham ko'rinish o'zgarmagan (Statistika kartalari)", () => {
    const { container } = render(<EmptyState />)
    expect(container.firstChild).not.toHaveClass('adm-empty-state--panel')
  })

  it("ErrorBanner: `onDismiss` bo'lsa «Yopish» tugmasi, bosilganda chaqiriladi; bo'lmasa tugma yo'q", async () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<ErrorBanner>Xabar</ErrorBanner>)
    expect(screen.queryByRole('button', { name: 'Yopish' })).not.toBeInTheDocument()
    rerender(<ErrorBanner onDismiss={onDismiss}>Xabar</ErrorBanner>)
    expect(screen.getByRole('alert')).toHaveClass('adm-banner--dismissible')
    await userEvent.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
