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
})