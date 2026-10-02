import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ApplyModal from './components/ApplyModal'
import { isTokenValid } from './utils/auth'
import useAnalytics from './hooks/useAnalytics'
import useTheme from './hooks/useTheme'
import LocaleProvider from './i18n/LocaleProvider'
import { DEFAULT_LANG, PREFIXED_LANGS, isTranslated, translatedLangs, localizePath, stripLangPrefix } from './i18n/locale'

// Sahifalar endi alohida chunk sifatida, faqat kerak bo'lganda yuklanadi
const Home            = lazy(() => import('./pages/Home'))
const Faculty         = lazy(() => import('./pages/Faculty'))
const Admission       = lazy(() => import('./pages/Admission'))
const News            = lazy(() => import('./pages/News'))
const NewsDetail      = lazy(() => import('./pages/NewsDetail'))
const Contact         = lazy(() => import('./pages/Contact'))
const FAQ             = lazy(() => import('./pages/FAQ'))
const Events          = lazy(() => import('./pages/Events'))
const Testimonials    = lazy(() => import('./pages/Testimonials'))
const Achievements    = lazy(() => import('./pages/Achievements'))
const QRCode          = lazy(() => import('./pages/QRCode'))
const Teachers        = lazy(() => import('./pages/Teachers'))
const Gallery         = lazy(() => import('./pages/Gallery'))
const Map             = lazy(() => import('./pages/Map'))
const Login           = lazy(() => import('./pages/admin/Login'))
const Dashboard       = lazy(() => import('./pages/admin/Dashboard'))
const About           = lazy(() => import('./pages/About'))
const Hemis           = lazy(() => import('./pages/Hemis'))
const International   = lazy(() => import('./pages/International'))
const Documents       = lazy(() => import('./pages/Documents'))
const Vacancies       = lazy(() => import('./pages/Vacancies'))
const SortingHat      = lazy(() => import('./pages/SortingHat'))
const NotFound        = lazy(() => import('./pages/NotFound'))

function PrivateRoute({ children }) {
  const token = localStorage.getItem('kiu_token')
  if (!isTokenValid(token)) {
    // Muddati o'tgan / yaroqsiz tokenni saqlab qo'yish ma'nosiz
    if (token) localStorage.removeItem('kiu_token')
    return <Navigate to="/admin/login" replace />
  }
  return children
}

// Yo'l → seo.pages.<kalit> (matnlar i18n/locales/*.json'da)
const SEO_KEYS = {
  '/': 'home',
  '/about': 'about',
  '/faculty': 'faculty',
  '/admission': 'admission',
  '/news': 'news',
  '/events': 'events',
  '/teachers': 'teachers',
  '/gallery': 'gallery',
  '/contact': 'contact',
  '/faq': 'faq',
  '/documents': 'documents',
  '/vacancies': 'vacancies',
  '/international': 'international',
  '/hemis': 'hemis',
  '/achievements': 'achievements',
  '/testimonials': 'testimonials',
  '/map': 'map',
  '/sorting-hat': 'sortingHat',
  '/qrcode': 'qrcode',
}

const SITE_URL = "https://kiu-university.vercel.app"

// og:locale qiymatlari
const OG_LOCALES = { uz: 'uz_UZ', en: 'en_US', ru: 'ru_RU' }

// Tarjima kerak bo'lmagan dinamik yo'llar (SEO_KEYS'da yo'q, lekin mavjud sahifa)
const DYNAMIC_PATH = /^\/news\/[^/]+$/

// <head>dagi meta/link teglarini topadi yoki yaratadi
function ensureHeadTag(selector, create) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

function useSeo() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  useEffect(() => {
    const path = stripLangPrefix(pathname)
    // Tanilmagan yo'l = 404 sahifa: noindex + o'z sarlavhasi
    const isAdmin = /^\/admin(\/|$)/.test(path)
    const isNotFound = !isAdmin && !Object.hasOwn(SEO_KEYS, path) && !DYNAMIC_PATH.test(path)
    const key = isNotFound ? 'notFound' : SEO_KEYS[path]
    const siteName = t('seo.siteName')
    const title = key ? t(`seo.pages.${key}.title`) : ''
    const desc = key ? t(`seo.pages.${key}.desc`) : ''

    document.documentElement.lang = lang
    document.title = title ? `${title} — ${siteName}` : siteName

    const descTag = document.querySelector('meta[name="description"]')
    if (descTag && desc) descTag.setAttribute('content', desc)

    const ogTitleTag = document.querySelector('meta[property="og:title"]')
    if (ogTitleTag && title) ogTitleTag.setAttribute('content', `${title} — ${siteName}`)

    const ogDescTag = document.querySelector('meta[property="og:description"]')
    if (ogDescTag && desc) ogDescTag.setAttribute('content', desc)

    // Oxiridagi "/" olib tashlanadi ("/en/" va "/en" bitta URL bo'lsin)
    const canonicalPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const canonicalUrl = `${SITE_URL}${canonicalPath}`
    const canonicalTag = document.querySelector('link[rel="canonical"]')
    if (canonicalTag) canonicalTag.setAttribute('href', canonicalUrl)

    // Ijtimoiy tarmoqlarda ulashilganda sahifa/til bo'yicha to'g'ri ko'rinishi uchun
    // og:url, og:locale, twitter:* va keywords ham har sahifa/tilga qarab yangilanadi.
    const setMeta = (attr, name, value) => {
      if (!value) return
      const tag = ensureHeadTag(`meta[${attr}="${name}"]`, () => {
        const m = document.createElement('meta')
        m.setAttribute(attr, name)
        return m
      })
      tag.setAttribute('content', value)
    }
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:locale', OG_LOCALES[lang])
    setMeta('name', 'twitter:title', title ? `${title} — ${siteName}` : siteName)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'keywords', t('seo.keywords'))

    // hreflang: faqat shu tilda to'liq tayyor sahifalar uchun (isTranslated). To'plam
    // barcha tillardagi variantlarda bir xil (Google o'zaro havolalarni talab qiladi).
    // Tarjima qilinmagan /en/*, /ru/* sahifalar o'zbekcha matn ko'rsatadi — ularni "ingliz/rus"
    // sahifa deb indekslatmaslik uchun noindex beriladi.
    document.head.querySelectorAll('link[data-hreflang]').forEach(el => el.remove())
    const translated = isTranslated(path, lang)
    const pageLangs = translatedLangs(path)
    // Faqat o'zbekchada mavjud sahifaga (masalan /news/:id, 404) hreflang kerak emas
    if (translated && pageLangs.length > 1) {
      const alternates = [...pageLangs.map(code => [code, code]), ['x-default', DEFAULT_LANG]]
      alternates.forEach(([hreflang, code]) => {
        const link = document.createElement('link')
        link.rel = 'alternate'
        link.setAttribute('hreflang', hreflang)
        link.setAttribute('data-hreflang', '')
        link.href = `${SITE_URL}${localizePath(path, code)}`
        document.head.appendChild(link)
      })
    }
    const robotsTag = ensureHeadTag('meta[name="robots"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'robots')
      return m
    })
    const hideFromIndex = isNotFound || isAdmin || (lang !== DEFAULT_LANG && !translated)
    robotsTag.setAttribute('content', hideFromIndex ? 'noindex, follow' : 'index, follow')
  }, [pathname, lang, t])
}

function ScrollReveal() {
  const location = useLocation()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.15 }
    )

    const observeEl = (el) => observer.observe(el)

    const timeoutId = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(observeEl)
    }, 100)

    // Sahifa ochilgandan keyin API'dan kelgan ma'lumot asosida render bo'ladigan
    // .reveal elementlarni (masalan Gallery/News kartochkalari) ham ushlab olish
    // uchun MutationObserver. Yuqoridagi bir martalik querySelectorAll faqat
    // 100ms ichida DOM'da mavjud elementlarni ko'radi — agar fetch (masalan
    // Render sovuq ishga tushishi sabab) undan uzoqroq davom etsa, keyinroq
    // qo'shiladigan kartochkalar hech qachon kuzatilmay opacity:0'da qolib
    // ketardi (Gallery sahifasidagi bug shu edi).
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return
          if (node.classList?.contains('reveal')) observeEl(node)
          node.querySelectorAll?.('.reveal').forEach(observeEl)
        })
      }
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [location])

  return null
}

function PublicLayout({ children, dark, setDark, onApply }) {
  return (
    <>
      <Navbar dark={dark} setDark={setDark} onApply={onApply} />
      <main>{children}</main>
      <Footer />
    </>
  )
}

function PageLoader() {
  const { t } = useTranslation()
  return <div className="page-loading">{t('common.loading')}</div>
}

// Ommaviy sahifalar. Bir xil ro'yxat har til uchun ishlatiladi: /en/*, /ru/* va /* (o'zbekcha).
// Ichki <Routes> yo'llari ota-marshrut prefiksiga nisbatan hisoblanadi, shuning uchun
// "/faculty" ham "/faculty", ham "/en/faculty" ga mos keladi.
function PageRoutes({ onApply }) {
  return (
    <Routes>
      <Route path="/" element={<Home onApply={onApply} />} />
      <Route path="/faculty" element={<Faculty />} />
      <Route path="/admission" element={<Admission onApply={onApply} />} />
      <Route path="/news" element={<News />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/hemis" element={<Hemis />} />
      <Route path="/international" element={<International />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/vacancies" element={<Vacancies />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/events" element={<Events />} />
      <Route path="/testimonials" element={<Testimonials />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/qrcode" element={<QRCode />} />
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/map" element={<Map />} />
      <Route path="/sorting-hat" element={<SortingHat />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// Til URL'dan aniqlanadi (LocaleProvider): /en/* — inglizcha, /ru/* — ruscha, qolgani — o'zbekcha.
export default function App() {
  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  )
}

function AppContent() {
  useSeo()
  useAnalytics()

  const [dark, setDark] = useTheme()
  const [applyOpen, setApplyOpen] = useState(false)

  const openApplyModal = () => setApplyOpen(true)
  const closeApplyModal = () => setApplyOpen(false)

  const publicPages = (
    <PublicLayout dark={dark} setDark={setDark} onApply={openApplyModal}>
      <PageRoutes onApply={openApplyModal} />
      {applyOpen && <ApplyModal onClose={closeApplyModal} />}
    </PublicLayout>
  )

  return (
    <>
      <ScrollReveal />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin/login" element={<Login />} />

          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Admin panel faqat o'zbekcha va prefikssiz: /en/admin, /ru/admin → /admin */}
          {PREFIXED_LANGS.map(code => (
            <Route key={`${code}-admin`} path={`/${code}/admin/*`} element={<Navigate to="/admin" replace />} />
          ))}

          {PREFIXED_LANGS.map(code => (
            <Route key={code} path={`/${code}/*`} element={publicPages} />
          ))}
          <Route path="/*" element={publicPages} />
        </Routes>
      </Suspense>
    </>
  )
}
