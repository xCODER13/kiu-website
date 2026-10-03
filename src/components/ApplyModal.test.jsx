import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplyModal from './ApplyModal'

const okFetch = () => vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })))

async function fillValid(user) {
  await user.type(screen.getByPlaceholderText('Ism Familiya'), 'Ali Valiyev')
  await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '+998 90 123 45 67')
}

describe('ApplyModal', () => {
  it('to\'g\'ri ma\'lumot — API ga type:"admission" bilan yuboradi va muvaffaqiyat ekranini ko\'rsatadi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await fillValid(user)
    await user.selectOptions(screen.getByRole('combobox'), 'Iqtisodiyot')
    await user.type(screen.getByPlaceholderText(/Savollaringiz/), 'Salom')
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))

    expect(await screen.findByText('Ariza yuborildi!')).toBeInTheDocument()
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('http://api.test/api/applications')
    expect(opts.method).toBe('POST')
    expect(opts.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(opts.body)).toEqual({
      name: 'Ali Valiyev', phone: '+998 90 123 45 67', faculty: 'Iqtisodiyot', message: 'Salom', type: 'admission',
    })
  })

  it('ommaviy formaga admin token yuborilmaydi (Authorization yo\'q)', async () => {
    localStorage.setItem('kiu_token', 'secret')
    okFetch()
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    await screen.findByText('Ariza yuborildi!')
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('bo\'sh forma — xatolar ko\'rinadi, so\'rov yuborilmaydi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect(screen.getAllByText('Bu maydon majburiy')).toHaveLength(2)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('noto\'g\'ri ism va telefon — mos xabarlar', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await user.type(screen.getByPlaceholderText('Ism Familiya'), 'Ali')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '123')
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect(screen.getByText(/to'liq kiriting/)).toBeInTheDocument()
    expect(screen.getByText(/Telefon raqam noto'g'ri/)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('o\'zbek apostrofli ism (Gʻayrat) qabul qilinadi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await user.type(screen.getByPlaceholderText('Ism Familiya'), 'Gʻayrat Oʻktamov')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '901234567')
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect(await screen.findByText('Ariza yuborildi!')).toBeInTheDocument()
  })

  it('server xatosi (ok:false) — xato xabari, forma saqlanadi, qayta urinish mumkin', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })))
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect(await screen.findByText(/xatolik yuz berdi/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ism Familiya')).toHaveValue('Ali Valiyev')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Yuborish' })).toBeEnabled())
  })

  it('tarmoq xatosi — xato xabari', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect(await screen.findByText(/xatolik yuz berdi/)).toBeInTheDocument()
  })

  it('xatodan keyin qayta yuborilsa xabar yo\'qoladi va muvaffaqiyatli o\'tadi', async () => {
    const f = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('fetch', f)
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    await screen.findByText(/xatolik yuz berdi/)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect(await screen.findByText('Ariza yuborildi!')).toBeInTheDocument()
    expect(screen.queryByText(/xatolik yuz berdi/)).not.toBeInTheDocument()
  })

  it('yuborish paytida tugma bloklanadi (ikki marta yuborishdan himoya)', async () => {
    let resolve
    vi.stubGlobal('fetch', vi.fn(() => new Promise(r => { resolve = r })))
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect(screen.getByRole('button', { name: 'Yuborilmoqda...' })).toBeDisabled()
    resolve({ ok: true })
    await screen.findByText('Ariza yuborildi!')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('fon (overlay) bosilsa yopiladi, modal ichida bosilsa yopilmaydi', async () => {
    const onClose = vi.fn()
    const { container } = render(<ApplyModal onClose={onClose} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Ariza topshirish'))
    expect(onClose).not.toHaveBeenCalled()
    await user.click(container.firstChild)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muvaffaqiyat ekranidagi "Yopish" onClose ni chaqiradi', async () => {
    okFetch()
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ApplyModal onClose={onClose} />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    await user.click(await screen.findByRole('button', { name: 'Yopish' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('XSS: skript matni JSON sifatida yuboriladi, DOM ga HTML bo\'lib tushmaydi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await fillValid(user)
    await user.type(screen.getByPlaceholderText(/Savollaringiz/), '<img src=x onerror=alert(1)>')
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    await screen.findByText('Ariza yuborildi!')
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })

  it('qulaylik: role=dialog, ochilganda fokus birinchi maydonda, Esc yopadi', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ApplyModal onClose={onClose} />)
    const dialog = screen.getByRole('dialog', { name: 'Ariza topshirish' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByPlaceholderText('Ism Familiya')).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('qulaylik: Tab modal ichida aylanadi, yopilganda fokus avvalgi tugmaga qaytadi', async () => {
    const user = userEvent.setup()
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const { unmount } = render(<ApplyModal onClose={() => {}} />)
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 12; i++) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
    unmount()
    expect(opener).toHaveFocus()
    opener.remove()
  })
})

describe('ApplyModal — inline stillar klassga ko\'chirilgan (Bosqich 5c)', () => {
  it("modal butunlay klass bilan: `[style]` yo'q, `<style>` yo'q", () => {
    const { container } = render(<ApplyModal onClose={() => {}} />)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(document.querySelectorAll('style')).toHaveLength(0)
    expect(container.firstChild).toHaveClass('modal-overlay')
    expect(screen.getByRole('dialog')).toHaveClass('modal-dialog')
  })

  it("xato holati `aria-invalid` orqali (oldin inline `borderColor`): faqat xatoli maydon belgilanadi", async () => {
    okFetch()
    const user = userEvent.setup()
    const { container } = render(<ApplyModal onClose={() => {}} />)
    const name = screen.getByPlaceholderText('Ism Familiya')
    const phone = screen.getByPlaceholderText('+998 90 123 45 67')
    expect(name).not.toHaveAttribute('aria-invalid')
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(container.querySelectorAll('.field-error')).toHaveLength(2)

    await user.type(name, 'Ali Valiyev')
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect(name).not.toHaveAttribute('aria-invalid')
    expect(phone).toHaveAttribute('aria-invalid', 'true')
  })

  it("server xatosi va muvaffaqiyat ekrani ham klass bilan", async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })))
    const user = userEvent.setup()
    const { container } = render(<ApplyModal onClose={() => {}} />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    expect((await screen.findByText(/xatolik yuz berdi/)).closest('.modal-alert')).not.toBeNull()
    expect(container.querySelectorAll('[style]')).toHaveLength(0)

    okFetch()
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    await screen.findByText('Ariza yuborildi!')
    expect(container.querySelector('.modal-success')).toBeInTheDocument()
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it('yorliqlar maydonlarga bog\'langan (htmlFor/id), majburiy belgi dekorativ', () => {
    render(<ApplyModal onClose={() => {}} />)
    expect(screen.getByLabelText(/To'liq ism/)).toBe(screen.getByPlaceholderText('Ism Familiya'))
    expect(screen.getByLabelText(/Telefon raqam/)).toBe(screen.getByPlaceholderText('+998 90 123 45 67'))
    expect(screen.getByLabelText(/Yo'nalish/)).toBe(screen.getByRole('combobox'))
    expect(document.querySelectorAll('.req[aria-hidden="true"]')).toHaveLength(2)
  })

  it('maydon xatosi role="alert", aria-invalid va aria-describedby bilan bog\'lanadi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    const name = screen.getByPlaceholderText('Ism Familiya')
    expect(name).toHaveAttribute('aria-invalid', 'true')
    const err = document.getElementById(name.getAttribute('aria-describedby'))
    expect(err).toHaveAttribute('role', 'alert')
    expect(err).toHaveTextContent('Bu maydon majburiy')
  })

  it('server xatosi: role="alert" banner sarlavha + matn bilan', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })))
    const user = userEvent.setup()
    render(<ApplyModal onClose={() => {}} />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Yuborish' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Ariza yuborilmadi.')
    expect(alert).toHaveTextContent(/xatolik yuz berdi/)
  })

  it('maxfiylik izohi tugma ostida ko\'rinadi', () => {
    render(<ApplyModal onClose={() => {}} />)
    expect(screen.getByText(/faqat KIU mutaxassislari bilan/)).toBeInTheDocument()
  })
})
