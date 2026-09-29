import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import uz from './locales/uz.json'
import en from './locales/en.json'
import config from '../config'
import LocaleProvider from './LocaleProvider'
import LanguageSwitcher from './LanguageSwitcher'
import ContentLangNote from './ContentLangNote'
import { Link, NavLink, Navigate } from './router'
import useLocale from './useLocale'
import useLocalizedNavigate from './useLocalizedNavigate'
import { getCategoryLabel } from '../utils/newsCategories'

// { 'a.b.c': 'matn' } — ichma-ich JSON'ni tekis kalitlarga aylantiradi
function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
  )
}
const uzFlat = Object.fromEntries(flatten(uz))
const enFlat = Object.fromEntries(flatten(en))
const placeholders = str => (String(str).match(/\{\{\s*\w+\s*\}\}/g) || []).sort().join(',')

function LocationMarker() {
  const { pathname, search } = useLocation()
  return <div data-testid="location">{pathname + search}</div>
}

function renderAt(path, ui) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocaleProvider>{ui}</LocaleProvider>
      <LocationMarker />
    </MemoryRouter>
  )
}

describe('tarjima fayllari', () => {
  it("uz.json va en.json kalitlari to'liq mos (birida bor, ikkinchisida yo'q kalit bo'lmasin)", () => {
    const onlyUz = Object.keys(uzFlat).filter(k => !(k in enFlat))
    const onlyEn = Object.keys(enFlat).filter(k => !(k in uzFlat))
    expect(onlyUz, "en.json'da yetishmaydi").toEqual([])
    expect(onlyEn, "uz.json'da yetishmaydi").toEqual([])
  })

  it("interpolyatsiya o'zgaruvchilari ({{...}}) ikkala tilda bir xil", () => {
    for (const key of Object.keys(uzFlat)) {
      expect(placeholders(enFlat[key]), key).toBe(placeholders(uzFlat[key]))
    }
  })

  it("inglizcha qiymatlar bo'sh emas (contentInUzbek faqat o'zbekchada bo'sh)", () => {
    for (const [key, value] of Object.entries(enFlat)) {
      expect(String(value).trim(), key).not.toBe('')
    }
  })

  it("regressiya: uz.json qiymatlari config.js bilan bir xil (ikki joyda ikki xil matn bo'lib qolmasin)", () => {
    expect(uzFlat['university.name']).toBe(config.university.name)
    expect(uzFlat['university.address1']).toBe(config.contact.address1)
    expect(uzFlat['university.address2']).toBe(config.contact.address2)
    expect(uzFlat['university.workHours']).toBe(config.contact.workHours)
    const statKeys = ['students', 'teachers', 'programs', 'founded']
    config.stats.forEach((s, i) => expect(uzFlat[`home.stats.${statKeys[i]}`]).toBe(s.l))
  })

  it("SEO: 19 ta sahifa + 404 sahifaning har biri uchun ikkala tilda sarlavha va tavsif bor", () => {
    const keys = Object.keys(uz.seo.pages)
    expect(keys).toHaveLength(20) // 19 sahifa + notFound
    for (const k of keys) {
      expect(en.seo.pages[k]?.title, k).toBeTruthy()
      expect(en.seo.pages[k]?.desc, k).toBeTruthy()
    }
  })
})

describe('LocaleProvider', () => {
  function Probe() {
    const { t, i18n } = useTranslation()
    const { lang, path } = useLocale()
    return <div data-testid="probe">{`${i18n.language}|${lang}|${path}|${t('nav.home')}`}</div>
  }

  it('/ da o\'zbekcha', () => {
    renderAt('/about', <Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('uz|uz|/about|Bosh sahifa')
  })

  it("/en/... da inglizcha, birinchi render'dayoq (o'zbekchadan sakrashsiz)", () => {
    renderAt('/en/about', <Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('en|en|/about|Home')
  })

  it("/en (bosh sahifa) ham inglizcha", () => {
    renderAt('/en', <Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('en|en|/|Home')
  })

  it("tarjimasi yo'q kalit o'zbekchaga qaytadi (bo'sh emas)", () => {
    function Missing() {
      const { t } = useTranslation()
      return <div data-testid="m">{t('nav.home')}</div>
    }
    renderAt('/en', <Missing />)
    expect(screen.getByTestId('m')).not.toBeEmptyDOMElement()
  })
})

describe('router wrapperlari (Link/NavLink/Navigate/useLocalizedNavigate)', () => {
  it("/en ichida Link href'i /en prefiksini oladi; o'zbekchada olmaydi", () => {
    renderAt('/en/about', <Link to="/faq">faq</Link>)
    expect(screen.getByRole('link', { name: 'faq' })).toHaveAttribute('href', '/en/faq')
  })

  it("o'zbekchada Link prefikssiz qoladi", () => {
    renderAt('/about', <Link to="/faq">faq</Link>)
    expect(screen.getByRole('link', { name: 'faq' })).toHaveAttribute('href', '/faq')
  })

  it("Link tashqi URL va /admin'ga tegmaydi", () => {
    renderAt('/en', <><Link to="/admin">a</Link><a href="https://t.me/x">x</a></>)
    expect(screen.getByRole('link', { name: 'a' })).toHaveAttribute('href', '/admin')
  })

  it("NavLink: bosh sahifa 'end' bilan faqat aynan /en da faol", () => {
    renderAt('/en/faq', <><NavLink to="/" end>home</NavLink><NavLink to="/faq">faq</NavLink></>)
    expect(screen.getByRole('link', { name: 'home' })).not.toHaveClass('active')
    expect(screen.getByRole('link', { name: 'faq' })).toHaveClass('active')
  })

  it("NavLink: /en da bosh sahifa faol", () => {
    renderAt('/en', <NavLink to="/" end>home</NavLink>)
    expect(screen.getByRole('link', { name: 'home' })).toHaveClass('active')
  })

  it("Navigate til prefiksini saqlaydi", () => {
    render(
      <MemoryRouter initialEntries={['/en/old']}>
        <LocaleProvider>
          <Routes>
            <Route path="/en/old" element={<Navigate to="/faq" replace />} />
            <Route path="*" element={null} />
          </Routes>
        </LocaleProvider>
        <LocationMarker />
      </MemoryRouter>
    )
    expect(screen.getByTestId('location')).toHaveTextContent('/en/faq')
  })

  it("useLocalizedNavigate: /en da navigate('/contact') → /en/contact, raqam (orqaga) o'zgarishsiz", async () => {
    const user = userEvent.setup()
    function Go() {
      const navigate = useLocalizedNavigate()
      return <button onClick={() => navigate('/contact?x=1')}>go</button>
    }
    renderAt('/en/faq', <Go />)
    await user.click(screen.getByRole('button', { name: 'go' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/en/contact?x=1')
  })
})

describe('LanguageSwitcher', () => {
  it("o'zbekchada: UZ faol (havola emas), EN — /en manzilga havola", () => {
    renderAt('/faculty', <LanguageSwitcher />)
    expect(screen.getByText('UZ')).toHaveAttribute('aria-current', 'true')
    expect(screen.queryByRole('link', { name: "O'zbekcha" })).not.toBeInTheDocument()
    const enLink = screen.getByRole('link', { name: 'English' })
    expect(enLink).toHaveAttribute('href', '/en/faculty')
    expect(enLink).toHaveAttribute('hreflang', 'en')
  })

  it("inglizchada: EN faol, UZ — prefikssiz manzilga havola", () => {
    renderAt('/en/faculty', <LanguageSwitcher />)
    expect(screen.getByText('EN')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: "O'zbekcha" })).toHaveAttribute('href', '/faculty')
  })

  it("bosh sahifa: / ↔ /en", () => {
    const { unmount } = renderAt('/', <LanguageSwitcher />)
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en')
    unmount()
    renderAt('/en', <LanguageSwitcher />)
    expect(screen.getByRole('link', { name: "O'zbekcha" })).toHaveAttribute('href', '/')
  })

  it("dinamik yo'l (/news/42) va ?query saqlanadi", () => {
    renderAt('/en/news/42?ref=a', <LanguageSwitcher />)
    expect(screen.getByRole('link', { name: "O'zbekcha" })).toHaveAttribute('href', '/news/42?ref=a')
  })

  it("bosilganda navigatsiya qiladi va onNavigate chaqiriladi", async () => {
    const user = userEvent.setup()
    let called = 0
    renderAt('/about', <LanguageSwitcher onNavigate={() => { called++ }} />)
    await user.click(screen.getByRole('link', { name: 'English' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/en/about')
    expect(called).toBe(1)
    // yangi til: endi UZ havola, EN faol
    expect(screen.getByText('EN')).toHaveAttribute('aria-current', 'true')
  })
})

describe('ContentLangNote', () => {
  it("o'zbekchada hech narsa ko'rsatmaydi", () => {
    renderAt('/news', <ContentLangNote />)
    expect(screen.queryByText(/published in Uzbek/)).not.toBeInTheDocument()
  })
  it("inglizchada kontent o'zbekchada ekanini eslatadi", () => {
    renderAt('/en/news', <ContentLangNote />)
    expect(screen.getByText('This content is published in Uzbek.')).toBeInTheDocument()
  })
})

describe('getCategoryLabel', () => {
  const tEn = (k, o) => en.categories[k.split('.')[1]] ?? o?.defaultValue
  it("t berilmasa — o'zbekcha nom (eski chaqiruvlar buzilmaydi)", () => {
    expect(getCategoryLabel('umumiy')).toBe('Umumiy')
    expect(getCategoryLabel("Ta'lim")).toBe("Ta'lim")
  })
  it("t bilan — tarjima, katta-kichik harf farqi yo'q", () => {
    expect(getCategoryLabel('UMUMIY', tEn)).toBe('General')
    expect(getCategoryLabel("ta'lim", tEn)).toBe('Education')
    expect(getCategoryLabel('fan', tEn)).toBe('Science')
  })
  it("noma'lum kategoriya o'zi qaytadi", () => {
    expect(getCategoryLabel('Boshqa', tEn)).toBe('Boshqa')
    expect(getCategoryLabel(undefined, tEn)).toBeUndefined()
  })
})
