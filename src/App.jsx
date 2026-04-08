import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
  const [dark, setDark] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
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
            </Routes>
            {applyOpen && <ApplyModal onClose={() => setApplyOpen(false)} />}
          </PublicLayout>
        } />
      </Routes>
    </>
  )
}