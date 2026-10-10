import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LocaleProvider from './LocaleProvider'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Home from '../pages/Home'
import config from '../config'
import { mockApi } from '../test/helpers'

vi.mock('../components/Search', () => ({ default: () => null }))

const N1 = { _id: 'n1', title: 'Birinchi yangilik', category: 'umumiy', createdAt: '2026-01-05' }
const N2 = { _id: 'n2', title: 'Ikkinchi yangilik', category: "ta'lim", createdAt: '2026-01-02' }

const at = (path, ui) => render(<MemoryRouter initialEntries={[path]}><LocaleProvider>{ui}</LocaleProvider></MemoryRouter>)

describe('Navbar (EN)', () => {
  const props = { dark: false, setDark: () => {}, onApply: () => {} }

  it("brend, havolalar va tugmalar inglizcha; havolalar /en prefiksli", () => {
    at('/en/faculty', <Navbar {...props} />)
    expect(screen.getByText('Karshi International University')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Programs' })[0]).toHaveAttribute('href', '/en/faculty')
    expect(screen.getAllByRole('link', { name: 'Admission' })[0]).toHaveAttribute('href', '/en/admission')
    expect(screen.getAllByRole('button', { name: 'Apply now' }).length).toBeGreaterThan(0)
    expect(screen.queryByText('Ariza topshirish')).not.toBeInTheDocument()
  })

  it("logotip /en ga olib boradi", () => {
    at('/en/faculty', <Navbar {...props} />)
    expect(screen.getAllByRole('link').find(a => a.querySelector('svg[role="img"]'))).toHaveAttribute('href', '/en')
  })

  it("faol guruh prefikssiz yo'l bo'yicha aniqlanadi (/en/faculty → 'For students' faol)", () => {
    at('/en/faculty', <Navbar {...props} />)
    const students = screen.getByRole('button', { name: /For students/ })
    const other = screen.getByRole('button', { name: /Media/ })
    expect(students).toHaveAttribute('data-active', 'true')
    expect(other).toHaveAttribute('data-active', 'false')
  })

  it("mobil menyu: til almashtirgich bor va EN da UZ havolasi prefikssiz; bosilganda menyu yopiladi", async () => {
    const user = userEvent.setup()
    at('/en/faculty', <Navbar {...props} />)
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const uzLinks = screen.getAllByRole('link', { name: "O'zbekcha" })
    expect(uzLinks.length).toBeGreaterThan(0)
    uzLinks.forEach(a => expect(a).toHaveAttribute('href', '/faculty'))
    await user.click(uzLinks[uzLinks.length - 1])
    expect(screen.queryByRole('button', { name: 'Close menu' })).not.toBeInTheDocument()
  })

  it("o'zbekcha holatda ham til almashtirgich EN ga /en/... havola beradi", () => {
    at('/faculty', <Navbar {...props} />)
    screen.getAllByRole('link', { name: 'English' }).forEach(a => expect(a).toHaveAttribute('href', '/en/faculty'))
  })
})

describe('Footer (EN)', () => {
  it("matnlar inglizcha, havolalar /en prefiksli, aloqa ma'lumotlari va ijtimoiy tarmoqlar o'zgarishsiz", () => {
    at('/en', <Footer />)
    expect(screen.getByText('Karshi International University')).toBeInTheDocument()
    expect(screen.getByText(/Quality education in the Kashkadarya region since 2022/)).toBeInTheDocument()
    expect(screen.getByText('Mon–Sat: 09:00–20:00')).toBeInTheDocument()
    expect(screen.getByText('© 2026 Karshi International University. All rights reserved.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Find your program' })).toHaveAttribute('href', '/en/sorting-hat')
    expect(screen.getByRole('link', { name: 'Student life' })).toHaveAttribute('href', '/en/student-life')
    expect(screen.getByText(config.contact.phone)).toBeInTheDocument()
    // Ijtimoiy tarmoq havolalari tashqi URL — /en prefiksi olmaydi
    expect(screen.getByRole('link', { name: 'Telegram' })).toHaveAttribute('href', config.social.telegram)
  })
})

describe('Home (EN)', () => {
  it("hero, 'haqida' bo'limi va statistika yorliqlari inglizcha", () => {
    mockApi({ 'GET /news': [] })
    at('/en', <Home />)
    expect(screen.getByRole('heading', { level: 1, name: 'Karshi International University' })).toBeInTheDocument()
    expect(screen.queryByText('Admissions 2026–2027 are open')).not.toBeInTheDocument()
    expect(screen.getByText('About Karshi International University')).toBeInTheDocument()
    for (const label of ['Students', 'Teachers', 'Programs', 'Year founded']) {
      // 'Programs' ham statistika, ham tugma yorlig'i — shuning uchun getAllByText
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute('href', '/en/about')
    expect(screen.getByRole('link', { name: 'Admission info' })).toHaveAttribute('href', '/en/admission')
    // o'zbekcha matn qolib ketmaganini tekshirish
    expect(screen.queryByText('Qabul haqida')).not.toBeInTheDocument()
    expect(screen.queryByText("Batafsil ma'lumot")).not.toBeInTheDocument()
  })

  it("yangiliklar: bo'lim inglizcha, sarlavhalar o'zbekcha (lang=uz) va izoh bor, havolalar /en/news/:id", async () => {
    mockApi({ 'GET /news': [N1, N2] })
    at('/en', <Home />)
    expect(await screen.findByText('Latest news')).toBeInTheDocument()
    expect(screen.getByText('This content is published in Uzbek.')).toBeInTheDocument()
    // Karusel + karta: sarlavha o'zgarishsiz (baza kontenti), lang="uz" bilan
    const title = screen.getAllByText('Birinchi yangilik')[0]
    expect(title.closest('[lang]')).toHaveAttribute('lang', 'uz')
    // kategoriya yorlig'i tarjima qilingan
    expect(screen.getAllByText('General').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Education').length).toBeGreaterThan(0)
    // sana inglizcha (en-GB: kun/oy/yil)
    expect(screen.getAllByText('02.01.2026').length).toBeGreaterThan(0)
    const detailLinks = screen.getAllByRole('link').filter(a => a.getAttribute('href')?.includes('/news/'))
    expect(detailLinks.length).toBeGreaterThan(0)
    detailLinks.forEach(a => expect(a.getAttribute('href')).toMatch(/^\/en\/news\/n[12]$/))
    // karusel boshqaruvi inglizcha aria-label
    const carouselBtns = screen.getAllByRole('button', { name: /^(Previous|Next|News \d)$/ })
    expect(carouselBtns.length).toBeGreaterThanOrEqual(4)
  })

  it("xato va bo'sh holat xabarlari inglizcha", async () => {
    mockApi({ 'GET /news': { status: 500, body: {} } })
    const { unmount } = at('/en', <Home />)
    expect(await screen.findByText('Could not connect to the news server.')).toBeInTheDocument()
    unmount()
    mockApi({ 'GET /news': [] })
    at('/en', <Home />)
    expect(await screen.findByText('There is no news yet.')).toBeInTheDocument()
  })

  it("o'zbekcha Home o'zgarishsiz: izoh chiqmaydi, havola prefikssiz, sana uz-UZ", async () => {
    mockApi({ 'GET /news': [N1, N2] })
    at('/', <Home />)
    await screen.findByText("So'nggi yangiliklar")
    expect(screen.queryByText('This content is published in Uzbek.')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: "Batafsil ma'lumot" })).toHaveAttribute('href', '/about')
    expect(within(document.body).getAllByText('Umumiy').length).toBeGreaterThan(0)
  })

  it("JSON-LD tilga qarab: nom, inLanguage va url", async () => {
    mockApi({ 'GET /news': [] })
    at('/en', <Home />)
    const script = document.head.querySelector('script#jsonld-university')
    const data = JSON.parse(script.textContent)
    expect(data.name).toBe('Karshi International University')
    expect(data.inLanguage).toBe('en')
    expect(data.url).toBe('https://kiu-university.vercel.app/en')
    expect(data.address[0].streetAddress).toMatch(/Bahodir Sherkulov/)
  })
})
