import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import ProfileAdmin from './ProfileAdmin'
import { mockApi } from '../../test/helpers'

const renderProfile = () => render(
  <MemoryRouter initialEntries={['/admin/profile']}>
    <Routes>
      <Route path="/admin/profile" element={<ProfileAdmin />} />
      <Route path="/admin/login" element={<div>LOGIN</div>} />
    </Routes>
  </MemoryRouter>
)

beforeEach(() => localStorage.setItem('kiu_token', 'tok'))

async function fill(user, cur = 'eski-parol', nw = 'yangi-parol-1', conf = nw) {
  await user.type(screen.getByPlaceholderText('Kamida 8 ta belgi').closest('form').querySelectorAll('input')[0], cur)
  await user.type(screen.getByPlaceholderText('Kamida 8 ta belgi'), nw)
  await user.type(screen.getByPlaceholderText('Kamida 8 ta belgi').closest('form').querySelectorAll('input')[2], conf)
}

describe('ProfileAdmin — parol o\'zgartirish', () => {
  it('parollar mos kelmasa — so\'rov yuborilmaydi', async () => {
    const api = mockApi()
    const user = userEvent.setup()
    renderProfile()
    await fill(user, 'eski', 'yangi-parol-1', 'boshqa-parol-2')
    await user.click(screen.getByRole('button', { name: /Parolni saqlash/ }))
    expect(screen.getByText('Yangi parollar mos kelmadi!')).toBeInTheDocument()
    expect(api.calls).toHaveLength(0)
  })

  it('8 belgidan qisqa parol frontend da to\'xtatiladi (backend bilan mos)', async () => {
    const api = mockApi()
    const user = userEvent.setup()
    renderProfile()
    await fill(user, 'eski', '1234567')
    await user.click(screen.getByRole('button', { name: /Parolni saqlash/ }))
    expect(screen.getByText(/kamida 8 ta belgi/)).toBeInTheDocument()
    expect(api.calls).toHaveLength(0)
  })

  it('aynan 8 belgi — yuboriladi', async () => {
    const api = mockApi({ 'POST /admin/change-password': { success: true } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user, 'eski', '12345678')
    await user.click(screen.getByRole('button', { name: /Parolni saqlash/ }))
    await screen.findByText(/muvaffaqiyatli/)
    expect(api.find('POST', '/admin/change-password')).toHaveLength(1)
  })

  it('muvaffaqiyat: to\'g\'ri body va header, forma tozalanadi (confirmPassword yuborilmaydi)', async () => {
    const api = mockApi({ 'POST /admin/change-password': { success: true } })
    const user = userEvent.setup()
    const { container } = renderProfile()
    await fill(user)
    await user.click(screen.getByRole('button', { name: /Parolni saqlash/ }))
    expect(await screen.findByText(/muvaffaqiyatli/)).toBeInTheDocument()
    const [c] = api.find('POST', '/admin/change-password')
    expect(JSON.parse(c.body)).toEqual({ currentPassword: 'eski-parol', newPassword: 'yangi-parol-1' })
    expect(c.headers.Authorization).toBe('Bearer tok')
    container.querySelectorAll('input[type=password]').forEach(i => expect(i).toHaveValue(''))
  })

  it('joriy parol noto\'g\'ri (401) — server xabari, forma saqlanadi', async () => {
    mockApi({ 'POST /admin/change-password': { status: 401, body: { error: "Joriy parol noto'g'ri" } } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await user.click(screen.getByRole('button', { name: /Parolni saqlash/ }))
    expect(await screen.findByText("Joriy parol noto'g'ri")).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Kamida 8 ta belgi')).toHaveValue('yangi-parol-1')
  })

  it('tarmoq xatosi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await user.click(screen.getByRole('button', { name: /Parolni saqlash/ }))
    expect(await screen.findByText("Server bilan bog'lanib bo'lmadi")).toBeInTheDocument()
  })

  it('parol maydonlari yashirin (type=password)', () => {
    const { container } = renderProfile()
    expect(container.querySelectorAll('input[type=password]')).toHaveLength(3)
  })

  it('muvaffaqiyatdan so\'ng eski token o\'chiriladi va login sahifasiga o\'tadi', async () => {
    mockApi({ 'POST /admin/change-password': { success: true } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await user.click(screen.getByRole('button', { name: /Parolni saqlash/ }))
    await screen.findByText(/muvaffaqiyatli/)
    expect(localStorage.getItem('kiu_token')).toBeNull()
    expect(await screen.findByText('LOGIN', {}, { timeout: 4000 })).toBeInTheDocument()
  })

  it('xatoda (401) token SAQLANADI va login ga o\'tilmaydi', async () => {
    mockApi({ 'POST /admin/change-password': { status: 401, body: { error: "Joriy parol noto'g'ri" } } })
    const user = userEvent.setup()
    renderProfile()
    await fill(user)
    await user.click(screen.getByRole('button', { name: /Parolni saqlash/ }))
    await screen.findByText("Joriy parol noto'g'ri")
    expect(localStorage.getItem('kiu_token')).toBe('tok')
    await new Promise(r => setTimeout(r, 1700))
    expect(screen.queryByText('LOGIN')).not.toBeInTheDocument()
  })

  it("xabar `data-type` bilan (error/success), inline stil yo'q", async () => {
    mockApi()
    const user = userEvent.setup()
    const { container } = renderProfile()
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    await fill(user, 'eski', 'yangi-parol-1', 'boshqa-parol-2')
    await user.click(screen.getByRole('button', { name: /Parolni saqlash/ }))
    const msg = container.querySelector('.adm-msg')
    expect(msg.dataset.type).toBe('error')
    expect(msg.getAttribute('style')).toBeNull()
  })
})
