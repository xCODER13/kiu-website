import { NavLink, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import config from '../config'
import Search from './Search'

// Guruhga kirmaydigan, doim ko'rinadigan linklar
const topLinks = [
  { to: '/', label: 'Bosh sahifa' },
]

// Qolgan 18 ta sahifa 4 ta guruhga bo'lingan (dropdown/mega-menu).
// Avval hammasi bitta qatorda edi va ko'p sahifa (About, Events, Gallery,
// Map, Teachers, QRCode, SortingHat) navbar'da umuman ko'rinmas edi.
const navGroups = [
  {
    id: 'talabalar',
    label: 'Talabalar uchun',
    items: [
      { to: '/faculty', label: "Yo'nalishlar" },
      { to: '/admission', label: 'Qabul' },
      { to: '/faq', label: 'FAQ' },
      { to: '/hemis', label: 'Elektron universitet' },
      { to: '/sorting-hat', label: 'Sehrli Shlyapa' },
    ],
  },
  {
    id: 'universitet',
    label: 'Universitet haqida',
    items: [
      { to: '/about', label: 'Biz haqimizda' },
      { to: '/achievements', label: 'Yutuqlar' },
      { to: '/international', label: 'Xalqaro hamkorlik' },
      { to: '/documents', label: 'Normativ hujjatlar' },
      { to: '/teachers', label: "Professor-o'qituvchilar" },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    items: [
      { to: '/news', label: 'Yangiliklar' },
      { to: '/events', label: 'Tadbirlar' },
      { to: '/gallery', label: 'Galereya' },
      { to: '/testimonials', label: 'Fikr-mulohazalar' },
    ],
  },
  {
    id: 'boglanish',
    label: "Bog'lanish",
    items: [
      { to: '/contact', label: "Bog'lanish" },
      { to: '/map', label: 'Xarita' },
      { to: '/vacancies', label: "Bo'sh ish o'rinlari" },
      { to: '/qrcode', label: 'QR kod' },
    ],
  },
]

// AI Yordamchi alohida, guruhlardan tashqarida qoladi (asosiy funksiya)
const chatbotLink = { to: '/chatbot', label: 'AI Yordamchi' }

function ChevronIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function Navbar({ dark, setDark, onApply }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState(null) // desktop'da qaysi dropdown ochiq
  const navRef = useRef(null)
  const location = useLocation()

  // Dropdown ochiq holda navbar tashqarisiga bosilsa — yopiladi
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenGroup(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <nav ref={navRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 2rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', zIndex: 100 }}>

        {/* Logo */}
        {/* Xatolik: mobil menyu ochiq holda logotipga bosilsa, sahifa
            almashsa ham menyu ochiq qolib qolar edi — onClick qo'shildi */}
        <NavLink to="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="KIU logo" className="nav-logo-img" style={{ width: 38, height: 38, objectFit: 'contain', }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: dark ? '#ffffff' : '#1a1a2e' }}>{config.university.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{config.university.website} — Rasmiy sayt</div>
          </div>
        </NavLink>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="desktop-nav">
          {topLinks.map(l => (
            <NavLink key={l.to} to={l.to} end
              style={({ isActive }) => ({
                fontSize: 11,
                color: isActive ? '#7c3aed' : (dark ? '#ffffff' : '#1a1a2e'),
                borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                paddingBottom: 3,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s'
              })}>
              {l.label}
            </NavLink>
          ))}

          {navGroups.map(group => {
            const isActive = group.items.some(i => location.pathname === i.to)
            const isOpen = openGroup === group.id
            return (
              <div key={group.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.id)}
                  style={{
                    display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 11, padding: 0, paddingBottom: 3,
                    color: isActive ? '#7c3aed' : (dark ? '#ffffff' : '#1a1a2e'),
                    fontWeight: isActive ? 600 : 400,
                    borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                  }}
                  aria-expanded={isOpen}
                >
                  {group.label}
                  <ChevronIcon />
                </button>

                {isOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 14px)', left: 0, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: 6, minWidth: 210, zIndex: 101 }}>
                    {group.items.map(item => (
                      <NavLink key={item.to} to={item.to} onClick={() => setOpenGroup(null)}
                        style={({ isActive }) => ({
                          display: 'block', padding: '9px 12px', borderRadius: 6, fontSize: 13,
                          color: isActive ? '#7c3aed' : 'var(--text)',
                          fontWeight: isActive ? 600 : 400,
                          background: isActive ? 'var(--purple-light)' : 'transparent',
                        })}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <NavLink to={chatbotLink.to}
            style={({ isActive }) => ({
              fontSize: 11,
              color: isActive ? '#7c3aed' : (dark ? '#ffffff' : '#1a1a2e'),
              borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
              paddingBottom: 3,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s'
            })}>
            {chatbotLink.label}
          </NavLink>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search />
          <button onClick={() => setDark(!dark)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button onClick={onApply} className="btn btn-primary desktop-nav" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
            Ariza topshirish
          </button>
          <button className="mobile-nav" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text)', fontSize: 20, lineHeight: 1 }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-nav" style={{ position: 'fixed', top: 62, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 99, display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem', gap: 4, borderTop: '1px solid var(--border)', overflowY: 'auto' }}>
          {topLinks.map(l => (
            <NavLink key={l.to} to={l.to} end onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                fontSize: 18, fontWeight: 600,
                color: isActive ? '#7c3aed' : 'var(--text)',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border)',
              })}>
              {l.label}
            </NavLink>
          ))}

          {/* Har bir guruh — <details> orqali ochiladi/yopiladi, qo'shimcha JS holat kerak emas */}
          {navGroups.map(group => (
            <details key={group.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 18, fontWeight: 600, color: 'var(--text)', padding: '0.75rem 0', cursor: 'pointer', listStyle: 'none' }}>
                {group.label}
                <ChevronIcon />
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 8 }}>
                {group.items.map(item => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                    style={({ isActive }) => ({
                      fontSize: 15,
                      color: isActive ? '#7c3aed' : 'var(--muted)',
                      fontWeight: isActive ? 600 : 400,
                      padding: '0.5rem 0 0.5rem 0.75rem',
                    })}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </details>
          ))}

          <NavLink to={chatbotLink.to} onClick={() => setMenuOpen(false)}
            style={({ isActive }) => ({
              fontSize: 18, fontWeight: 600,
              color: isActive ? '#7c3aed' : 'var(--text)',
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border)',
            })}>
            {chatbotLink.label}
          </NavLink>

          <button onClick={() => { onApply(); setMenuOpen(false) }} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '1rem' }}>
            Ariza topshirish
          </button>
        </div>
      )}
    </>
  )
}