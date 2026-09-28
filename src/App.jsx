import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ApplyModal from './components/ApplyModal'
import { isTokenValid } from './utils/auth'

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

function PrivateRoute({ children }) {
  const token = localStorage.getItem('kiu_token')
  if (!isTokenValid(token)) {
    // Muddati o'tgan / yaroqsiz tokenni saqlab qo'yish ma'nosiz
    if (token) localStorage.removeItem('kiu_token')
    return <Navigate to="/admin/login" replace />
  }
  return children
}

const SEO = {
  '/':              { title: "Bosh sahifa",             desc: "Qarshi Xalqaro Universiteti — xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish. Qarshi shahri, Qashqadaryo viloyati." },
  '/about':         { title: "Biz haqimizda",           desc: "KIU tarixi, missiyasi, qadriyatlari va rahbariyati haqida to'liq ma'lumot." },
  '/faculty':       { title: "Yo'nalishlar",            desc: "KIU da mavjud bakalavriat yo'nalishlari: iqtisodiyot, muhandislik, filologiya va boshqalar." },
  '/admission':     { title: "Qabul — 2026",            desc: "KIU ga qabul shartlari, hujjatlar ro'yxati va ariza topshirish tartibi. Muddati: 1 iyul — 20 avgust 2026." },
  '/news':          { title: "Yangiliklar",             desc: "KIU hayotidan so'nggi xabarlar, tadbirlar va e'lonlar." },
  '/events':        { title: "Tadbirlar taqvimi",       desc: "KIU dagi yaqinlashib kelayotgan tadbirlar, konferensiyalar va bayramlar." },
  '/teachers':      { title: "Professor-o'qituvchilar", desc: "KIU ning malakali professor-o'qituvchilar jamoasi bilan tanishing." },
  '/gallery':       { title: "Galereya",                desc: "KIU kampusi, tadbirlari va kundalik hayotidan foto lavhalar." },
  '/contact':       { title: "Bog'lanish",              desc: "KIU manzili, telefon raqamlari, elektron pochta va ish vaqti." },
  '/faq':           { title: "Ko'p so'raladigan savollar", desc: "KIU ga qabul, ta'lim jarayoni va boshqa mavzulardagi tez-tez beriladigan savollarga javoblar." },
  '/documents':     { title: "Normativ hujjatlar",      desc: "KIU ning rasmiy nizomlar, buyruqlar va normativ hujjatlari." },
  '/vacancies':     { title: "Bo'sh ish o'rinlari",     desc: "KIU da ochiq lavozimlar va ish o'rinlari. Jamoamizga qo'shiling!" },
  '/international': { title: "Xalqaro hamkorlik",       desc: "KIU ning xorijiy universitetlar va xalqaro tashkilotlar bilan hamkorlik dasturlari." },
  '/hemis':         { title: "Elektron universitet",    desc: "KIU HEMIS tizimiga kirish — talabalar va o'qituvchilar uchun." },
  '/achievements':  { title: "Yutuqlar",                desc: "KIU va uning talabalari, o'qituvchilarining yutuqlari va mukofotlari." },
  '/testimonials':  { title: "Fikr-mulohazalar",        desc: "KIU talabalari va bitiruvchilarining universitetimiz haqidagi fikrlari." },
  '/map':           { title: "Kampus xaritasi",         desc: "KIU kampusining interaktiv xaritasi va yo'nalish ko'rsatmalari." },
  '/sorting-hat':   { title: "Yo'nalishni aniqlash",    desc: "KIU Sehrli Shlyapasi — bir necha savol orqali siz uchun eng mos yo'nalishni aniqlang." },
  '/qrcode':        { title: "QR Kod",                  desc: "KIU rasmiy QR kodlari va tezkor havolalar." },
}

const SITE_NAME = "Qarshi Xalqaro Universiteti | KIU"
const SITE_URL = "https://kiu-university.vercel.app"

function useSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = SEO[pathname] || {}

    document.title = meta.title ? `${meta.title} — ${SITE_NAME}` : SITE_NAME

    const descTag = document.querySelector('meta[name="description"]')
    if (descTag && meta.desc) descTag.setAttribute('content', meta.desc)

    const ogTitleTag = document.querySelector('meta[property="og:title"]')
    if (ogTitleTag && meta.title) ogTitleTag.setAttribute('content', `${meta.title} — ${SITE_NAME}`)

    const ogDescTag = document.querySelector('meta[property="og:description"]')
    if (ogDescTag && meta.desc) ogDescTag.setAttribute('content', meta.desc)

    const canonicalTag = document.querySelector('link[rel="canonical"]')
    if (canonicalTag) canonicalTag.setAttribute('href', `${SITE_URL}${pathname}`)
  }, [pathname])
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
  return <div className="page-loading">Yuklanmoqda...</div>
}

export default function App() {
  useSeo()

  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')
  const [applyOpen, setApplyOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const openApplyModal = () => setApplyOpen(true)
  const closeApplyModal = () => setApplyOpen(false)

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

          <Route
            path="/*"
            element={
              <PublicLayout dark={dark} setDark={setDark} onApply={openApplyModal}>
                <Routes>
                  <Route path="/" element={<Home onApply={openApplyModal} />} />
                  <Route path="/faculty" element={<Faculty />} />
                  <Route path="/admission" element={<Admission onApply={openApplyModal} />} />
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
                </Routes>
                {applyOpen && <ApplyModal onClose={closeApplyModal} />}
              </PublicLayout>
            }
          />
        </Routes>
      </Suspense>
    </>
  )
}