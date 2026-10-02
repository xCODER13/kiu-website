import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// Og'ir sahifalar va layout — bu testlarda faqat routing/guard mantig'i tekshiriladi
vi.mock('./pages/admin/Dashboard', () => ({ default: () => <div>DASHBOARD</div> }))
vi.mock('./pages/admin/Login', () => ({ default: () => <div>LOGIN</div> }))
vi.mock('./pages/Home', () => ({ default: () => <div>HOME</div> }))
vi.mock('./pages/About', () => ({ default: () => <div>ABOUT</div> }))
vi.mock('./components/Navbar', () => ({ default: ({ dark, setDark }) => <button onClick={() => setDark(!dark)}>toggle-theme</button> }))
vi.mock('./components/Footer', () => ({ default: () => <footer>FOOTER</footer> }))
vi.mock('./components/ApplyModal', () => ({ default: () => <div>APPLY</div> }))

const renderAt = path => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)

// Imzosiz, faqat payload — backend tekshiradi; frontend ham exp ni tekshirishi KERAK
const jwt = payload => `x.${btoa(JSON.stringify(payload))}.y`

describe('PrivateRoute (/admin)', () => {
  it('token yo\'q — login sahifasiga yo\'naltiradi', async () => {
    renderAt('/admin')
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument()
  })

  it('token bor — dashboard ko\'rinadi', async () => {
    localStorage.setItem('kiu_token', jwt({ exp: Math.floor(Date.now() / 1000) + 3600 }))
    renderAt('/admin')
    expect(await screen.findByText('DASHBOARD')).toBeInTheDocument()
  })

  it('/admin/login — token bo\'lmasa ham ochiladi', async () => {
    renderAt('/admin/login')
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
  })

  it('bo\'sh string token — himoyalangan (falsy)', async () => {
    localStorage.setItem('kiu_token', '')
    renderAt('/admin')
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
  })

  it('muddati o\'tgan JWT — loginga yo\'naltiriladi va token o\'chiriladi', async () => {
    localStorage.setItem('kiu_token', jwt({ exp: Math.floor(Date.now() / 1000) - 60 }))
    renderAt('/admin')
    expect(await screen.findByText('LOGIN')).toBeInTheDocument()
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument()
    expect(localStorage.getItem('kiu_token')).toBeNull()
  })

  it.each(['abc', 'a.b', 'a.b.c', `x.${btoa('null')}.y`, `x.${btoa('{}')}.y`, `x.${btoa('{"exp":"9999999999"}')}.y`])(
    'yaroqsiz token %j — himoyalangan', async t => {
      localStorage.setItem('kiu_token', t)
      renderAt('/admin')
      expect(await screen.findByText('LOGIN')).toBeInTheDocument()
    })
})

describe('ommaviy layout', () => {
  it('bosh sahifa layout ichida', async () => {
    renderAt('/')
    expect(await screen.findByText('HOME')).toBeInTheDocument()
    expect(screen.getByText('FOOTER')).toBeInTheDocument()
  })
})

describe('SEO', () => {
  it('sahifaga mos title', async () => {
    renderAt('/about')
    await screen.findByText('ABOUT')
    expect(document.title).toBe('Biz haqimizda — Qarshi Xalqaro Universiteti | KIU')
  })
  it('noma\'lum yo\'l — 404 sarlavhasi (sayt nomi bilan)', async () => {
    renderAt('/yoq-sahifa')
    expect(document.title).toBe('Sahifa topilmadi — Qarshi Xalqaro Universiteti | KIU')
  })
  it('meta va canonical teglar yangilanadi', async () => {
    document.head.innerHTML = '<meta name="description" content=""><meta property="og:title" content=""><link rel="canonical" href="">'
    renderAt('/about')
    await screen.findByText('ABOUT')
    expect(document.querySelector('meta[name="description"]').content).toMatch(/KIU tarixi/)
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://kiu-university.vercel.app/about')
    expect(document.querySelector('meta[property="og:title"]').content).toMatch(/^Biz haqimizda/)
    document.head.innerHTML = ''
  })
})

describe('tema', () => {
  it('standart — tizim sozlamasi (light); tanlov toggle\'gacha saqlanmaydi', async () => {
    renderAt('/')
    await screen.findByText('HOME')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('theme')).toBeNull()
  })
  it('tizim dark bo\'lsa va tanlov yo\'q — dark', async () => {
    const original = window.matchMedia
    window.matchMedia = (query) => ({ matches: query.includes('dark'), media: query, addEventListener() {}, removeEventListener() {} })
    try {
      renderAt('/')
      await screen.findByText('HOME')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    } finally {
      window.matchMedia = original
    }
  })
  it('theme-init.js qo\'ygan atribut saqlangan tanlovdan oldin o\'qiladi', async () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    renderAt('/')
    await screen.findByText('HOME')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
  it('saqlangan dark tema qayta tiklanadi', async () => {
    localStorage.setItem('theme', 'dark')
    renderAt('/')
    await screen.findByText('HOME')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
  it('toggle temani almashtiradi', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    renderAt('/')
    await userEvent.click(await screen.findByText('toggle-theme'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
