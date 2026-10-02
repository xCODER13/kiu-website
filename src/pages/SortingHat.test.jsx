import { describe, it, expect, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SortingHat from './SortingHat'
import { QUESTIONS, FACULTIES } from './sortinghat/Data'
import uz from '../i18n/locales/uz.json'

// Matnlar endi tarjima faylida (uz — standart til); id/variant kaliti bo'yicha olinadi
const qText = i => uz.sortingHat.questions[QUESTIONS[i].id].q
const optText = (i, j) => uz.sortingHat.questions[QUESTIONS[i].id].opts[QUESTIONS[i].opts[j].id]

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
    const text = optText(i, pick(i))
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
    expect(screen.getByText(qText(0))).toBeInTheDocument()
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
      fireEvent.click(screen.getByText(optText(0, 0)))
      expect(screen.getByText(optText(0, 1)).closest('button')).toBeDisabled()
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

describe('Sorting Hat — JS hover/focus CSS ga ko\'chirilgan (Bosqich 5c) va 6.11d dizayn', () => {
  it("intro: boshlash tugmasi `btn btn-primary sh-start`, hover inline stil yozmaydi", async () => {
    const user = userEvent.setup()
    setup()
    const btn = screen.getByRole('button', { name: /Testni boshlash/ })
    expect(btn).toHaveClass('btn', 'btn-primary', 'sh-start')
    await user.hover(btn)
    expect(btn.hasAttribute('style')).toBe(false)
    await user.unhover(btn)
    expect(btn.hasAttribute('style')).toBe(false)
  })

  it("hero: umumiy `.inner-hero`, orqaga — havola (ichida button yo'q), bitta h1, shlyapa/yulduzlar dekorativ", () => {
    const { container } = setup()
    const hero = container.querySelector('section.inner-hero.sh-hero')
    expect(hero).toBeInTheDocument()
    const back = screen.getByRole('link', { name: /Qabul sahifasi/ })
    expect(back).toHaveClass('sh-back')
    expect(back).toHaveAttribute('href', '/admission')
    expect(back.querySelector('button')).toBeNull()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(hero.querySelectorAll('.sh-hero__star')).toHaveLength(7)
    hero.querySelectorAll('svg').forEach(svg => expect(svg).toHaveAttribute('aria-hidden', 'true'))
  })

  it('hero har bosqichda saqlanadi (register, quiz)', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    expect(container.querySelector('.sh-hero')).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Ism Familiya/), 'Ali Valiyev')
    await user.type(screen.getByLabelText(/Telefon raqam/), '+998 90 123 45 67')
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    expect(container.querySelector('.sh-hero')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it("register: label↔input bog'langan (`htmlFor`), `*` dekorativ, `aria-required`; xato `role=alert` + `aria-describedby`", async () => {
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    const name = screen.getByLabelText(/Ism Familiya/)
    const phone = screen.getByLabelText(/Telefon raqam/)
    expect(name).toHaveAttribute('id', 'sh-name')
    expect(name).toHaveAttribute('aria-required', 'true')
    expect(name).not.toHaveAttribute('aria-describedby')
    // `*` matn ichidan ajratilgan: faqat aria-hidden belgi
    expect(container.querySelectorAll('.label__req[aria-hidden="true"]')).toHaveLength(2)
    await user.type(name, 'Ali')
    await user.type(phone, '12')
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
    expect(name).toHaveAttribute('aria-describedby', 'sh-name-err')
    expect(phone).toHaveAttribute('aria-describedby', 'sh-phone-err')
    expect(alerts.map(a => a.id)).toEqual(['sh-name-err', 'sh-phone-err'])
    alerts.forEach(a => expect(a.querySelector('svg')).toHaveAttribute('aria-hidden', 'true'))
  })

  it('register: "Orqaga" — secondary (kontur), "Boshlash" — btn-primary; ikkalasi `type=button`', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    const back = screen.getByRole('button', { name: /Orqaga/ })
    expect(back).toHaveClass('btn', 'btn-secondary')
    expect(back).toHaveAttribute('type', 'button')
    expect(screen.getByRole('button', { name: /Testni boshlash/ })).toHaveClass('btn', 'btn-primary')
  })

  it("register: xato `aria-invalid` orqali, fokus/blur inline `borderColor` yozmaydi", async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    const name = screen.getByPlaceholderText(/Xurshid/)
    const phone = screen.getByPlaceholderText('+998 90 123 45 67')
    expect(name).toHaveClass('input', 'input--lg')
    await user.type(name, 'Ali')
    await user.type(phone, '12')
    await user.click(screen.getByRole('button', { name: /Testni boshlash/ }))
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    name.focus(); name.blur()
    phone.focus(); phone.blur()
    expect(name.hasAttribute('style')).toBe(false)
    expect(phone.hasAttribute('style')).toBe(false)
    expect(screen.getAllByText(/to'liq kiriting|noto'g'ri/).every(e => e.closest('.field-error'))).toBe(true)
  })

  it('quiz: variant tanlanganda `data-selected`, hover inline stil yozmaydi', async () => {
    const user = userEvent.setup()
    setup(); await register(user)
    const opt = screen.getByText(optText(0, 0)).closest('button')
    expect(opt).toHaveClass('sh-opt')
    expect(opt).toHaveAttribute('data-selected', 'false')
    await user.hover(opt)
    expect(opt.hasAttribute('style')).toBe(false)
    expect(opt.querySelector('[style]')).toBeNull()
    fireEvent.click(opt)
    expect(opt).toHaveAttribute('data-selected', 'true')
    expect(opt).toBeDisabled()
    expect(opt.hasAttribute('style')).toBe(false)
    expect(opt.querySelector('[style]')).toBeNull()
    expect(opt.querySelector('.sh-opt-arrow')).toBeInTheDocument()
  })

  it('quiz: progress `role=progressbar` (qiymat — javob berilganlar ulushi), nuqtalar dekorativ va holati `data-state`', async () => {
    const user = userEvent.setup()
    const { container } = setup(); await register(user)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '0')
    expect(bar).toHaveAttribute('aria-label', expect.stringMatching(new RegExp(`Savol 1 / ${QUESTIONS.length}`)))
    expect(container.querySelector('.sh-dots')).toHaveAttribute('aria-hidden', 'true')
    const states = [...container.querySelectorAll('.sh-dot')].map(d => d.dataset.state)
    expect(states[0]).toBe('current')
    expect(states.slice(1).every(s => s === 'todo')).toBe(true)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fireEvent.click(screen.getByText(optText(0, 0)))
      await act(async () => { await vi.advanceTimersByTimeAsync(500) })
    } finally { vi.useRealTimers() }
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(Math.round(100 / QUESTIONS.length)))
    expect(container.querySelector('.sh-dot').dataset.state).toBe('done')
  })

  it("result: ichma-ich interaktiv element yo'q — CTA havolalar (`a.btn`) va bitta tugma; birinchi karta `data-best`", async () => {
    lead()
    const user = userEvent.setup()
    const { container } = setup(); await register(user)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try { await answerAll() } finally { vi.useRealTimers() }
    expect(container.querySelector('a button')).toBeNull()
    const apply = screen.getByRole('link', { name: /Ariza topshirish/ })
    const programs = screen.getByRole('link', { name: /Yo'nalishlarni ko'rish/ })
    expect(apply).toHaveAttribute('href', '/admission')
    expect(apply).toHaveClass('btn', 'btn-primary')
    expect(programs).toHaveAttribute('href', '/faculty')
    expect(programs).toHaveClass('btn', 'btn-accent')
    expect(screen.getByRole('button', { name: /Qayta o'tish/ })).toHaveClass('btn', 'btn-secondary')
    const cards = container.querySelectorAll('.sh-fac')
    expect(cards).toHaveLength(3)
    expect([...cards].map(c => c.dataset.best)).toEqual(['true', 'false', 'false'])
    expect(container.querySelectorAll('.sh-fac__best')).toHaveLength(1)
    // yo'nalish ranglari stilga yozilmaydi (hamma karta bitta brend rangida)
    expect(container.querySelector('.sh-fac [style]')).toBeNull()
    // sarlavhalar iyerarxiyasi: h2 (banner) → h3 (yo'nalish) → h4 (ro'yxat)
    expect(container.querySelectorAll('.sh-fac h3')).toHaveLength(3)
    expect(container.querySelectorAll('.sh-fac h4')).toHaveLength(6)
  })
})
