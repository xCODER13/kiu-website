import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'

const setup = () => render(
  <MemoryRouter initialEntries={['/admin/login']}>
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<div>DASH</div>} />
    </Routes>
  </MemoryRouter>
)
const respond = body => vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ json: () => Promise.resolve(body) })))

async function fill(user, u = 'admin', p = 'secret123') {
  await user.type(screen.getByPlaceholderText('Login'), u)
  await user.type(screen.getByPlaceholderText('Parol'), p)
}

describe('Login', () => {
  it('muvaffaqiyatli kirish — token saqlanadi, /admin ga o\'tadi, to\'g\'ri so\'rov yuboriladi', async () => {
    respond({ token: 'jwt123' })
    const user = userEvent.setup()
    setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(await screen.findByText('DASH')).toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).toBe('jwt123')
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('http://api.test/api/admin/login')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ username: 'admin', password: 'secret123' })
  })

  it('noto\'g\'ri parol — server xabari ko\'rsatiladi, token yo\'q', async () => {
    respond({ error: "Login yoki parol noto'g'ri" })
    const user = userEvent.setup()
    setup()
    await fill(user, 'admin', 'x')
    await user.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(await screen.findByText("Login yoki parol noto'g'ri")).toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).toBeNull()
    expect(screen.queryByText('DASH')).not.toBeInTheDocument()
  })

  it('xabarsiz javob — umumiy xato matni', async () => {
    respond({})
    const user = userEvent.setup()
    setup(); await fill(user)
    await user.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(await screen.findByText('Xato yuz berdi')).toBeInTheDocument()
  })

  it('tarmoq xatosi — "Server bilan bog\'lanib bo\'lmadi", tugma qayta faollashadi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const user = userEvent.setup()
    setup(); await fill(user)
    await user.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(await screen.findByText("Server bilan bog'lanib bo'lmadi")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kirish' })).toBeEnabled())
  })

  it('yuborish paytida tugma bloklanadi (ikki marta yuborishdan himoya)', async () => {
    let resolve
    vi.stubGlobal('fetch', vi.fn(() => new Promise(r => { resolve = r })))
    const user = userEvent.setup()
    setup(); await fill(user)
    await user.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(screen.getByRole('button', { name: 'Kirmoqda...' })).toBeDisabled()
    resolve({ json: () => Promise.resolve({ error: 'x' }) })
    await screen.findByText('x')
  })

  it('parol ko\'rsatish/yashirish tugmasi', async () => {
    const user = userEvent.setup()
    setup()
    const pass = screen.getByPlaceholderText('Parol')
    expect(pass).toHaveAttribute('type', 'password')
    await user.click(screen.getAllByRole('button').find(b => b.type === 'button'))
    expect(pass).toHaveAttribute('type', 'text')
  })

  it('429 (JSON emas) — "Juda ko\'p urinish" xabari', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 429, json: () => Promise.reject(new Error('not json')) })))
    const user = userEvent.setup()
    setup(); await fill(user)
    await user.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(await screen.findByText(/Juda ko'p urinish/)).toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).toBeNull()
  })

  it('429 (JSON, server xabari bilan) — server xabari ko\'rsatiladi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 429, json: () => Promise.resolve({ error: 'Biroz kuting' }) })))
    const user = userEvent.setup()
    setup(); await fill(user)
    await user.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(await screen.findByText('Biroz kuting')).toBeInTheDocument()
  })

  it('502 (HTML javob, JSON emas) — "Server bilan bog\'lanib bo\'lmadi"', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 502, json: () => Promise.reject(new SyntaxError('x')) })))
    const user = userEvent.setup()
    setup(); await fill(user)
    await user.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(await screen.findByText("Server bilan bog'lanib bo'lmadi")).toBeInTheDocument()
  })

  it('inline stilsiz: maydonlar `.input`, tugma `.btn-primary`, xato `.auth-error`', async () => {
    respond({ error: 'xato' })
    const user = userEvent.setup()
    const { container } = setup(); await fill(user)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(screen.getByPlaceholderText('Login')).toHaveClass('input', 'auth-input')
    expect(screen.getByPlaceholderText('Parol')).toHaveClass('input', 'auth-input--pass')
    await user.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(await screen.findByText('xato')).toHaveClass('auth-error')
  })
})
