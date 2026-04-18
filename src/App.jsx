import { Routes, Route, useLocation, Suspense, lazy } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ApplyModal from './components/ApplyModal'

const Home         = lazy(() => import('./pages/Home'))
const Faculty      = lazy(() => import('./pages/Faculty'))
const Admission    = lazy(() => import('./pages/Admission'))
const News         = lazy(() => import('./pages/News'))
const Contact      = lazy(() => import('./pages/Contact'))
const FAQ          = lazy(() => import('./pages/FAQ'))
const Events       = lazy(() => import('./pages/Events'))
const Testimonials = lazy(() => import('./pages/Testimonials'))
const Achievements = lazy(() => import('./pages/Achievements'))
const QRCode       = lazy(() => import('./pages/QRCode'))
const Teachers     = lazy(() => import('./pages/Teachers'))
const Gallery      = lazy(() => import('./pages/Gallery'))
const Map          = lazy(() => import('./pages/Map'))
const Chatbot      = lazy(() => import('./pages/Chatbot'))
const Login        = lazy(() => import('./pages/admin/Login'))
const Dashboard    = lazy(() => import('./pages/admin/Dashboard'))
const About        = lazy(() => import('./pages/About'))
const Hemis        = lazy(() => import('./pages/Hemis'))
const International = lazy(() => import('./pages/International'))
const Documents    = lazy(() => import('./pages/Documents'))
const Vacancies    = lazy(() => import('./pages/Vacancies'))

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
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')
  const [applyOpen, setApplyOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <>
      <ScrollReveal />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/*" element={<Dashboard />} />
          <Route path="/*" element={
            <PublicLayout dark={dark} setDark={setDark} onApply={() => setApplyOpen(true)}>
              <Routes>
                <Route path="/"              element={<Home onApply={() => setApplyOpen(true)} />} />
                <Route path="/faculty"       element={<Faculty />} />
                <Route path="/admission"     element={<Admission onApply={() => setApplyOpen(true)} />} />
                <Route path="/news"          element={<News />} />
                <Route path="/contact"       element={<Contact />} />
                <Route path="/about"         element={<About />} />
                <Route path="/hemis"         element={<Hemis />} />
                <Route path="/international" element={<International />} />
                <Route path="/documents"     element={<Documents />} />
                <Route path="/vacancies"     element={<Vacancies />} />
                <Route path="/faq"           element={<FAQ />} />
                <Route path="/events"        element={<Events />} />
                <Route path="/testimonials"  element={<Testimonials />} />
                <Route path="/achievements"  element={<Achievements />} />
                <Route path="/qrcode"        element={<QRCode />} />
                <Route path="/teachers"      element={<Teachers />} />
                <Route path="/gallery"       element={<Gallery />} />
                <Route path="/map"           element={<Map />} />
                <Route path="/chatbot"       element={<Chatbot />} />
              </Routes>
              {applyOpen && <ApplyModal onClose={() => setApplyOpen(false)} />}
            </PublicLayout>
          } />
        </Routes>
      </Suspense>
    </>
  )
}