import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from './ConfirmDialog.jsx'

// 6.23: window.confirm o'rniga ilovaning o'z `alertdialog`i (taxta: Admin-Apps «O'chirish tasdig'i»)
function setup(props = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  const view = render(
    <ConfirmDialog title="Arizani o'chirishni tasdiqlaysizmi?" onConfirm={onConfirm} onCancel={onCancel} {...props}>
      <strong>Aziz Karimov</strong> arizasi butunlay o'chiriladi.
    </ConfirmDialog>,
  )
  return { onConfirm, onCancel, ...view }
}

describe('ConfirmDialog', () => {
  it('`alertdialog`: aria-modal, sarlavha va tavsif bilan bog\'langan', () => {
    setup()
    const dialog = screen.getByRole('alertdialog', { name: "Arizani o'chirishni tasdiqlaysizmi?" })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription("Aziz Karimov arizasi butunlay o'chiriladi.")
  })

  it('body\'ga portal qilinadi (admin qobig\'ining overflow\'i kesmaydi)', () => {
    const { container } = setup()
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(document.body.querySelector(':scope > .adm-dialog-overlay [role="alertdialog"]')).not.toBeNull()
  })

  it('fokus ochilganda «Bekor qilish»da (xavfli amal tasodifan Enter bilan bajarilmasin)', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Bekor qilish' })).toHaveFocus()
  })

  it('tugmalar: tasdiqlash va bekor qilish o\'z handler\'ini chaqiradi', async () => {
    const user = userEvent.setup()
    const { onConfirm, onCancel } = setup()
    await user.click(screen.getByRole('button', { name: "O'chirish" }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('matnlar sozlanadi (`confirmLabel`, `cancelLabel`)', () => {
    setup({ confirmLabel: 'Ha, o\'chir', cancelLabel: 'Yo\'q' })
    expect(screen.getByRole('button', { name: "Ha, o'chir" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Yo'q" })).toBeInTheDocument()
  })

  it('Esc bekor qiladi', async () => {
    const user = userEvent.setup()
    const { onCancel, onConfirm } = setup()
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('orqa fonni bosish bekor qiladi, dialog ichini bosish — yo\'q', async () => {
    const user = userEvent.setup()
    const { onCancel } = setup()
    await user.click(screen.getByRole('alertdialog'))
    expect(onCancel).not.toHaveBeenCalled()
    await user.click(document.querySelector('.adm-dialog-overlay'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('Tab dialog ichida aylanadi (oxirgidan birinchiga, Shift+Tab — teskari)', async () => {
    const user = userEvent.setup()
    setup()
    const cancel = screen.getByRole('button', { name: 'Bekor qilish' })
    const confirm = screen.getByRole('button', { name: "O'chirish" })
    expect(cancel).toHaveFocus()
    await user.tab()
    expect(confirm).toHaveFocus()
    await user.tab()
    expect(cancel).toHaveFocus()
    await user.tab({ shift: true })
    expect(confirm).toHaveFocus()
  })

  it('so\'rov ketayotganda (`busy`): tugmalar o\'chiq, Esc va orqa fon yopmaydi, tasdiq tugmasi `aria-busy`', async () => {
    const user = userEvent.setup()
    const { onCancel } = setup({ busy: true })
    expect(screen.getByRole('button', { name: 'Bekor qilish' })).toBeDisabled()
    expect(screen.getByRole('button', { name: "O'chirish" })).toBeDisabled()
    expect(screen.getByRole('button', { name: "O'chirish" })).toHaveAttribute('aria-busy', 'true')
    await user.keyboard('{Escape}')
    await user.click(document.querySelector('.adm-dialog-overlay'))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('ochiq payt sahifa aylanmaydi; yopilganda tiklanadi va fokus chaqirgan elementga qaytadi', () => {
    document.body.style.overflow = 'auto'
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const { unmount } = setup()
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('auto')
    expect(opener).toHaveFocus()
    opener.remove()
    document.body.style.overflow = ''
  })

  // 6.24: «Saqlanmagan o'zgarishlar» (tone="warning")
  describe('tone="warning" (saqlanmagan o\'zgarishlar)', () => {
    const warn = (props = {}) => setup({ tone: 'warning', title: "Saqlanmagan o'zgarishlar bor", confirmLabel: 'Chiqish', cancelLabel: 'Tahrirlashda qolish', ...props })

    it('fokus xavfsiz tugmada («Tahrirlashda qolish»), «Chiqish» chapda', () => {
      warn()
      const stay = screen.getByRole('button', { name: 'Tahrirlashda qolish' })
      const leave = screen.getByRole('button', { name: 'Chiqish' })
      expect(stay).toHaveFocus()
      expect(leave.compareDocumentPosition(stay) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(stay).toHaveClass('btn-primary')
    })

    it('ogohlantirish ikonkasi (o\'chirish ikonkasi emas), tasdiq tugmasida ikonka yo\'q', () => {
      warn()
      expect(document.querySelector('.adm-dialog-icon--warning')).not.toBeNull()
      expect(screen.getByRole('button', { name: 'Chiqish' }).querySelector('svg')).toBeNull()
    })

    it('«Chiqish» — onConfirm, «Tahrirlashda qolish» va Esc — onCancel', async () => {
      const user = userEvent.setup()
      const { onConfirm, onCancel } = warn()
      await user.click(screen.getByRole('button', { name: 'Chiqish' }))
      expect(onConfirm).toHaveBeenCalledTimes(1)
      await user.click(screen.getByRole('button', { name: 'Tahrirlashda qolish' }))
      await user.keyboard('{Escape}')
      expect(onCancel).toHaveBeenCalledTimes(2)
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })
})
