import { describe, it, expect, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SortingHat from './SortingHat'
import { QUESTIONS, FACULTIES } from './sortinghat/Data'

const setup = () => render(<MemoryRouter><SortingHat /></MemoryRouter>)
const lead = () => vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })))

async function register(user, name = 'Ali Valiyev', phone = '+998 90 123 45 67') {
  await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))       // intro → register
  await user.type(screen.getByPlaceholderText(/Xurshid/), name)
  await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), phone)
  await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))       // register → quiz
}

// Har savolda `optIndex` variantini tanlaydi; 480ms taymerni fake timers bilan o'tkazadi
async function answerAll(pick = () => 0) {
  for (let i = 0; i < QUESTIONS.length; i++) {
    const text = QUESTIONS[i].opts[pick(i)].t
    fireEvent.click(screen.getByText(text))
    await act(async () => { await vi.advanceTimersByTimeAsync(500) })
  }
}

describe('Sorting Hat oqimi', () => {
  it('intro → register bosqichi', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    expect(screen.getByText('Bir qadam qoldi!')).toBeInTheDocument()
  })

  it('register: bo\'sh maydonlarda tugma bloklangan', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    expect(screen.getByRole('button', { name: /Testni boshlash/ })).toBeDisabled()
  })

  it('register: noto\'g\'ri ma\'lumot — xatolar, quiz boshlanmaydi', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    await user.type(screen.getByPlaceholderText(/Xurshid/), 'Ali')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '12')
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    expect(screen.getByText(/to'liq kiriting/)).toBeInTheDocument()
    expect(screen.getByText(/Telefon raqam noto'g'ri/)).toBeInTheDocument()
    expect(screen.queryByText(new RegExp(`Savol 1 / ${QUESTIONS.length}`))).not.toBeInTheDocument()
  })

  it('register: "Orqaga" introga qaytaradi', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    await user.click(screen.getByRole('button', { name: /Orqaga/ }))
    expect(screen.queryByText('Bir qadam qoldi!')).not.toBeInTheDocument()
  })

  it('quiz: birinchi savol va progress ko\'rsatiladi', async () => {
    const user = userEvent.setup()
    setup(); await register(user)
    expect(screen.getByText(new RegExp(`Savol 1 / ${QUESTIONS.length}`))).toBeInTheDocument()
    expect(screen.getByText(QUESTIONS[0].q)).toBeInTheDocument()
  })

  it('to\'liq oqim: barcha savollar → top-3 natija, lead bir marta to\'g\'ri ma\'lumot bilan yuboriladi', async () => {
    lead()
    const user = userEvent.setup()
    setup(); await register(user)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      await answerAll(() => 0)
      expect(screen.getByText('Tahlil tayyor!')).toBeInTheDocument()
    } finally { vi.useRealTimers() }

    expect(fetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.name).toBe('Ali Valiyev')
    expect(body.phone).toBe('+998 90 123 45 67')
    expect(body.faculties).toHaveLength(3)
    body.faculties.forEach(n => expect(Object.values(FACULTIES).map(f => f.name)).toContain(n))
    // Natija kartalari (yo'nalish nomlari) ko'rinadi
    expect(screen.getByText(body.faculties[0], { selector: 'h3' })).toBeInTheDocument()
    expect(screen.getByText('Eng mos')).toBeInTheDocument()
  })

  it('ball hisobi: birinchi variantni doim tanlash — kutilgan top-3 (mustaqil hisob bilan solishtiriladi)', async () => {
    lead()
    const scores = {}
    QUESTIONS.forEach(q => Object.entries(q.opts[0].s).forEach(([k, v]) => { scores[k] = (scores[k] || 0) + v }))
    const expected = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => FACULTIES[k].name)

    const user = userEvent.setup()
    setup(); await register(user)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      await answerAll(() => 0)
      screen.getByText('Tahlil tayyor!')
    } finally { vi.useRealTimers() }
    expect(JSON.parse(fetch.mock.calls[0][1].body).faculties).toEqual(expected)
  })

  it('lead xatosi (tarmoq) natija ko\'rsatilishiga to\'sqinlik qilmaydi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const user = userEvent.setup()
    setup(); await register(user)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      await answerAll(i => i % 4)
      expect(screen.getByText('Tahlil tayyor!')).toBeInTheDocument()
    } finally { vi.useRealTimers() }
  })

  it('javob berilgach (480ms ichida) ikkinchi bosish e\'tiborga olinmaydi (busy)', async () => {
    const user = userEvent.setup()
    setup(); await register(user)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fireEvent.click(screen.getByText(QUESTIONS[0].opts[0].t))
      expect(screen.getByText(QUESTIONS[0].opts[1].t).closest('button')).toBeDisabled()
      await act(async () => { await vi.advanceTimersByTimeAsync(500) })
      expect(screen.getByText(new RegExp(`Savol 2 / ${QUESTIONS.length}`))).toBeInTheDocument()
    } finally { vi.useRealTimers() }
  })

  it('"Qayta o\'tish" register bosqichiga qaytaradi', async () => {
    lead()
    const user = userEvent.setup()
    setup(); await register(user)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      await answerAll()
      screen.getByText('Tahlil tayyor!')
      fireEvent.click(screen.getByRole('button', { name: /Qayta o'tish/ }))
    } finally { vi.useRealTimers() }
    expect(screen.getByText('Bir qadam qoldi!')).toBeInTheDocument()
  })
})
