import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import config from '../config'
import Search from './Search'

const links = [
  { to: '/',          label: 'Bosh sahifa' },
  { to: '/faculty',   label: 'Yo\'nalishlar' },
  { to: '/admission', label: 'Qabul' },
  { to: '/contact',   label: "Bog'lanish" },
  { to: '/hemis',   label: 'Elektron universitet' },
  { to: '/documents',   label: 'Normativ hujjatlar' },
  { to: '/international',   label: 'Xalqaro hamkorlik' },
  { to: '/news',      label: 'Yangiliklar' },
  { to: '/achievements', label: 'Yutuqlar' },
  { to: '/faq',       label: 'FAQ' },
  { to: '/vacancies',   label: "Bo'sh ish o'rinlari" },
  { to: '/chatbot',   label: 'AI Yordamchi' },
]

export default function Navbar({ dark, setDark, onApply }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 2rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', zIndex: 100 }}>

        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="KIU logo" className="nav-logo-img" style={{ width: 38, height: 38, objectFit: 'contain', }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: dark ? '#ffffff' : '#1a1a2e' }}>{config.university.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{config.university.website} — Rasmiy sayt</div>
          </div>
        </NavLink>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 12 }} className="desktop-nav">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
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
        <div className="mobile-nav" style={{ position: 'fixed', top: 62, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 99, display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem', gap: 8, borderTop: '1px solid var(--border)' }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                fontSize: 18, fontWeight: 600,
                color: isActive ? '#7c3aed' : 'var(--text)',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border)',
              })}>
              {l.label}
            </NavLink>
          ))}
          <button onClick={() => { onApply(); setMenuOpen(false) }} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '1rem' }}>
            Ariza topshirish
          </button>
        </div>
      )}
    </>
  )
}