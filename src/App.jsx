import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const SEO = {
  '/':             { title: "Bosh sahifa",            desc: "Qarshi Xalqaro Universiteti — xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish. Qarshi shahri, Qashqadaryo viloyati." },
  '/about':        { title: "Biz haqimizda",           desc: "KIU tarixi, missiyasi, qadriyatlari va rahbariyati haqida to'liq ma'lumot." },
  '/faculty':      { title: "Yo'nalishlar",            desc: "KIU da mavjud bakalavriat yo'nalishlari: iqtisodiyot, muhandislik, filologiya va boshqalar." },
  '/admission':    { title: "Qabul — 2026",            desc: "KIU ga qabul shartlari, hujjatlar ro'yxati va ariza topshirish tartibi. Muddati: 1 iyul — 20 avgust 2026." },
  '/news':         { title: "Yangiliklar",             desc: "KIU hayotidan so'nggi xabarlar, tadbirlar va e'lonlar." },
  '/events':       { title: "Tadbirlar taqvimi",       desc: "KIU dagi yaqinlashib kelayotgan tadbirlar, konferensiyalar va bayramlar." },
  '/teachers':     { title: "Professor-o'qituvchilar", desc: "KIU ning malakali professor-o'qituvchilar jamoasi bilan tanishing." },
  '/gallery':      { title: "Galereya",                desc: "KIU kampusi, tadbirlari va kundalik hayotidan foto lavhalar." },
  '/contact':      { title: "Bog'lanish",              desc: "KIU manzili, telefon raqamlari, elektron pochta va ish vaqti." },
  '/faq':          { title: "Ko'p so'raladigan savollar", desc: "KIU ga qabul, ta'lim jarayoni va boshqa mavzulardagi tez-tez beriladigan savollarga javoblar." },
  '/documents':    { title: "Normativ hujjatlar",      desc: "KIU ning rasmiy nizomlar, buyruqlar va normativ hujjatlari." },
  '/vacancies':    { title: "Bo'sh ish o'rinlari",     desc: "KIU da ochiq lavozimlar va ish o'rinlari. Jamoamizga qo'shiling!" },
  '/international':{ title: "Xalqaro hamkorlik",       desc: "KIU ning xorijiy universitetlar va xalqaro tashkilotlar bilan hamkorlik dasturlari." },
  '/hemis':        { title: "Elektron universitet",    desc: "KIU HEMIS tizimiga kirish — talabalar va o'qituvchilar uchun." },
  '/achievements': { title: "Yutuqlar",                desc: "KIU va uning talabalari, o'qituvchilarining yutuqlari va mukofotlari." },
  '/testimonials': { title: "Fikr-mulohazalar",        desc: "KIU talabalari va bitiruvchilarining universitetimiz haqidagi fikrlari." },
  '/map':          { title: "Kampus xaritasi",         desc: "KIU kampusining interaktiv xaritasi va yo'nalish ko'rsatmalari." },
  '/chatbot':      { title: "AI Yordamchi",            desc: "KIU haqida savollaringizga AI yordamchi javob beradi." },
  '/sorting-hat':  { title: "Yo'nalishni aniqlash",    desc: "KIU Sehrli Shlyapasi — bir necha savol orqali siz uchun eng mos yo'nalishni aniqlang." },
  '/qrcode':       { title: "QR Kod",                  desc: "KIU rasmiy QR kodlari va tezkor havolalar." },
}

const BASE = "Qarshi Xalqaro Universiteti | KIU"

function useSeo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const meta = SEO[pathname] || {}
    document.title = meta.title ? `${meta.title} — ${BASE}` : BASE
    const desc = document.querySelector('meta[name="description"]')
    if (desc && meta.desc) desc.setAttribute('content', meta.desc)
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle && meta.title) ogTitle.setAttribute('content', `${meta.title} — ${BASE}`)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc && meta.desc) ogDesc.setAttribute('content', meta.desc)
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute('href', `https://kiu-university.vercel.app${pathname}`)
  }, [pathname])
}
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ApplyModal from './components/ApplyModal'
import Home from './pages/Home'
import Faculty from './pages/Faculty'
import Admission from './pages/Admission'
import News from './pages/News'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Events from './pages/Events'
import Testimonials from './pages/Testimonials'
import Achievements from './pages/Achievements'
import QRCode from './pages/QRCode'
import Teachers from './pages/Teachers'
import Gallery from './pages/Gallery'
import Map from './pages/Map'
import Chatbot from './pages/Chatbot'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import About from './pages/About'
import Hemis from './pages/Hemis'
import International from './pages/International'
import Documents from './pages/Documents'
import Vacancies from './pages/Vacancies'
import SortingHat from './pages/SortingHat'

function ScrollReveal() {
  const location = useLocation()
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.15 }
    )
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    }, 100)
    return () => observer.disconnect()
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

export default function App() {
  useSeo()
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')
  const [applyOpen, setApplyOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <>
      <ScrollReveal />
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<Dashboard />} />
        <Route path="/*" element={
          <PublicLayout dark={dark} setDark={setDark} onApply={() => setApplyOpen(true)}>
            <Routes>
              <Route path="/"             element={<Home onApply={() => setApplyOpen(true)} />} />
              <Route path="/faculty"      element={<Faculty />} />
              <Route path="/admission"    element={<Admission onApply={() => setApplyOpen(true)} />} />
              <Route path="/news"         element={<News />} />
              <Route path="/contact"      element={<Contact />} />
              <Route path="/about"        element={<About />} />
              <Route path="/hemis"        element={<Hemis />} />
              <Route path="/international" element={<International />} />
              <Route path="/documents"    element={<Documents />} />
              <Route path="/vacancies"    element={<Vacancies />} />
              <Route path="/faq"          element={<FAQ />} />
              <Route path="/events"       element={<Events />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/qrcode"       element={<QRCode />} />
              <Route path="/teachers"     element={<Teachers />} />
              <Route path="/gallery"      element={<Gallery />} />
              <Route path="/map"          element={<Map />} />
              <Route path="/chatbot"      element={<Chatbot />} />
              <Route path="/sorting-hat"  element={<SortingHat />} />
            </Routes>
            {applyOpen && <ApplyModal onClose={() => setApplyOpen(false)} />}
          </PublicLayout>
        } />
      </Routes>
    </>
  )
}