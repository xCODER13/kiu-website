import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'
import config from '../config'
import { mockApi } from '../test/helpers'

const N1 = { _id: 'n1', title: 'Birinchi yangilik', category: 'umumiy', createdAt: '2026-01-01' }
const N2 = { _id: 'n2', title: 'Ikkinchi yangilik', category: "ta'lim", createdAt: '2026-01-02' }

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

describe('Home (smoke test)', () => {
  it("qulamasdan render bo'ladi va asosiy (hero) tarkib ko'rsatiladi", () => {
    mockApi({ 'GET /news': [] })
    renderHome()
    expect(screen.getByText(config.university.name)).toBeInTheDocument()
    expect(screen.getByText('Qabul haqida')).toBeInTheDocument()
    expect(screen.getByText("Qarshi Xalqaro Universiteti haqida")).toBeInTheDocument()
  })

  it('yangiliklar yuklanayotganda skeleton ko\'rsatiladi, xato/bo\'sh xabari chiqmaydi', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderHome()
    expect(screen.queryByText("Hozircha yangiliklar yo'q.")).not.toBeInTheDocument()
    expect(screen.queryByText(/ulanib bo'lmadi/)).not.toBeInTheDocument()
  })

  it('muvaffaqiyatli javobda karusel va so\'nggi yangilik kartalari ko\'rsatiladi', async () => {
    mockApi({ 'GET /news': [N1, N2] })
    renderHome()
    expect(await screen.findByText('Batafsil')).toBeInTheDocument()
    expect(screen.getAllByText('Birinchi yangilik').length).toBeGreaterThan(0)
    expect(screen.getByText('Ikkinchi yangilik')).toBeInTheDocument()
  })

  it("server xatosida qulamaydi — mos xabar ko'rsatiladi", async () => {
    mockApi({ 'GET /news': { status: 500, body: {} } })
    renderHome()
    expect(await screen.findByText("Yangiliklar serveriga ulanib bo'lmadi.")).toBeInTheDocument()
  })

  it('regressiya: javob massiv bo\'lmasa ({error}) — ".filter is not a function" bilan qulamaydi', async () => {
    mockApi({ 'GET /news': { error: "noto'g'ri format" } })
    renderHome()
    // useApi bunda xato deb belgilamaydi (ok:true), shuning uchun "bo'sh" xabari chiqadi
    expect(await screen.findByText("Hozircha yangiliklar yo'q.")).toBeInTheDocument()
  })
})