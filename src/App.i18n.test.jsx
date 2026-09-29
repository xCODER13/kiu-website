import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// Sahifalar soxtalashtirilgan — bu yerda faqat til routing'i, SEO va layout tekshiriladi.
// Navbar/Footer HAQIQIY (til almashtirgich va havolalar shu yerda tekshiriladi).
vi.mock('./pages/admin/Dashboard', () => ({ default: () => <div>DASHBOARD</div> }))
vi.mock('./pages/admin/Login', () => ({ default: () => <div>LOGIN</div> }))
vi.mock('./pages/Home', () => ({ default: () => <div>HOME</div> }))
vi.mock('./pages/About', () => ({ default: () => <div>ABOUT</div> }))
vi.mock('./pages/News', () => ({ default: () => <div>NEWS</div> }))
vi.mock('./pages/NewsDetail', () => ({ default: () => <div>NEWS-DETAIL</div> }))
vi.mock('./components/ApplyModal', () => ({ default: () => <div>APPLY</div> }))
vi.mock('./components/Search', () => ({ default: () => null }))

const SITE = 'https://kiu-university.vercel.app'
const renderAt = path => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
const hreflangs = () => Object.fromEntries(
  [...document.head.querySelectorAll('link[rel="alternate"][hreflang]')].map(l => [l.getAttribute('hreflang'), l.getAttribute('href')])
)
const robots = () => document.head.querySelector('meta[name="robots"]')?.getAttribute('content')

beforeEach(() => {
  document.head.innerHTML =
    '<meta name="description" content=""><meta property="og:title" content=""><meta property="og:description" content=""><meta name="robots" content="index, follow"><link rel="canonical" href="">'
})
afterEach(() => { document.head.innerHTML = '' })

describe('til routing', () => {
  it("/ — o'zbekcha, <html lang=uz>", async () => {
    renderAt('/')
    expect(await screen.findByText('HOME')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('uz')
    expect(document.title).toBe('Bosh sahifa — Qarshi Xalqaro Universiteti | KIU')
  })

  it('/en — inglizcha bosh sahifa, <html lang=en>, inglizcha title', async () => {
    renderAt('/en')
    expect(await screen.findByText('HOME')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('Home — Karshi International University | KIU')
    expect(document.querySelector('meta[name="description"]').content).toMatch(/Karshi International University/)
  })

  it("/en/about — ichki sahifa ham /en ostida ochiladi", async () => {
    renderAt('/en/about')
    expect(await screen.findByText('ABOUT')).toBeInTheDocument()
    expect(document.title).toBe('About us — Karshi International University | KIU')
  })

  it("/en/news/:id — dinamik yo'l ham ishlaydi", async () => {
    renderAt('/en/news/abc')
    expect(await screen.findByText('NEWS-DETAIL')).toBeInTheDocument()
    expect(document.title).toBe('Karshi International University | KIU')
  })

  it("/en/admin → o'zbekcha admin (login'ga yo'naltiriladi), inglizcha emas", async () => {
    renderAt('/en/admin')
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
  })

  it("/en da layout (Navbar + Footer) inglizcha", async () => {
    renderAt('/en')
    await screen.findByText('HOME')
    expect(screen.getAllByRole('link', { name: 'Programs' }).length).toBeGreaterThan(0)
    expect(screen.getByText('All rights reserved.', { exact: false })).toBeInTheDocument()
  })

  it("navbar'dagi EN havolasi bosilganda sahifa inglizchaga o'tadi, UZ bosilganda qaytadi", async () => {
    const user = userEvent.setup()
    renderAt('/about')
    await screen.findByText('ABOUT')
    expect(document.documentElement.lang).toBe('uz')

    const header = screen.getAllByRole('navigation')[0]
    await user.click(within(header).getAllByRole('link', { name: 'English' })[0])
    expect(await screen.findByText('ABOUT')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe('About us — Karshi International University | KIU')

    await user.click(within(header).getAllByRole('link', { name: "O'zbekcha" })[0])
    expect(document.documentElement.lang).toBe('uz')
    expect(document.title).toBe('Biz haqimizda — Qarshi Xalqaro Universiteti | KIU')
  })
})

describe('SEO: hreflang / canonical / robots', () => {
  it("tarjima qilingan sahifa (/): uz, en va x-default hreflang'lar", async () => {
    renderAt('/')
    await screen.findByText('HOME')
    expect(hreflangs()).toEqual({ uz: `${SITE}/`, en: `${SITE}/en`, 'x-default': `${SITE}/` })
    expect(robots()).toBe('index, follow')
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${SITE}/`)
  })

  it("/en da ham xuddi shu hreflang to'plami, canonical o'zi (/en), indekslanadi", async () => {
    renderAt('/en')
    await screen.findByText('HOME')
    expect(hreflangs()).toEqual({ uz: `${SITE}/`, en: `${SITE}/en`, 'x-default': `${SITE}/` })
    expect(robots()).toBe('index, follow')
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${SITE}/en`)
  })

  it("/en/ (oxirida slash) canonical'da /en ga keltiriladi", async () => {
    renderAt('/en/')
    await screen.findByText('HOME')
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${SITE}/en`)
  })

  it("tarjima qilingan /en/about: indekslanadi, hreflang juftligi to'liq", async () => {
    renderAt('/en/about')
    await screen.findByText('ABOUT')
    expect(robots()).toBe('index, follow')
    expect(hreflangs()).toEqual({ uz: `${SITE}/about`, en: `${SITE}/en/about`, 'x-default': `${SITE}/about` })
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${SITE}/en/about`)
  })

  it("o'zbekcha /about ham xuddi shu hreflang to'plamiga ega", async () => {
    renderAt('/about')
    await screen.findByText('ABOUT')
    expect(robots()).toBe('index, follow')
    expect(hreflangs()).toEqual({ uz: `${SITE}/about`, en: `${SITE}/en/about`, 'x-default': `${SITE}/about` })
  })

  it("hali tarjima qilinmagan /en/news: noindex va hreflang yo'q", async () => {
    renderAt('/en/news')
    await screen.findByText('NEWS')
    expect(robots()).toBe('noindex, follow')
    expect(hreflangs()).toEqual({})
  })

  it("o'zbekcha /news: indekslanadi, hreflang yo'q (hali inglizcha varianti yo'q)", async () => {
    renderAt('/news')
    await screen.findByText('NEWS')
    expect(robots()).toBe('index, follow')
    expect(hreflangs()).toEqual({})
  })

  it("til almashganda hreflang teglari ko'payib ketmaydi", async () => {
    const user = userEvent.setup()
    renderAt('/')
    await screen.findByText('HOME')
    const header = screen.getAllByRole('navigation')[0]
    await user.click(within(header).getAllByRole('link', { name: 'English' })[0])
    await user.click(within(header).getAllByRole('link', { name: "O'zbekcha" })[0])
    expect(document.head.querySelectorAll('link[rel="alternate"][hreflang]')).toHaveLength(3)
  })
})
