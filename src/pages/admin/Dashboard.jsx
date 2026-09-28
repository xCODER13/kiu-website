import { useState, useEffect } from 'react'
import { useNavigate, NavLink, Routes, Route } from 'react-router-dom'
import { Ic } from './shared/Icons.jsx'
import { NAV } from './shared/constants'
import { installUnauthorizedHandler } from './shared/api'
import Stats from './Stats.jsx'
import NewsAdmin from './NewsAdmin.jsx'
import EventsAdmin from './EventsAdmin.jsx'
import TeachersAdmin from './TeachersAdmin.jsx'
import GalleryAdmin from './GalleryAdmin.jsx'
import ApplicationsAdmin from './ApplicationsAdmin.jsx'
import ProfileAdmin from './ProfileAdmin.jsx'

// ── MAIN ──
export default function Dashboard() {
  const navigate    = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')
  const [search, setSearch] = useState('')
  const tk = localStorage.getItem('kiu_token')

  useEffect(() => { if (!tk) navigate('/admin/login') }, [tk, navigate])
  // Sessiya tugasa (401) — loginga qaytaramiz
  useEffect(() => installUnauthorizedHandler(() => navigate('/admin/login')), [navigate])
  useEffect(() => { document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light'); localStorage.setItem('theme', dark ? 'dark' : 'light') }, [dark])

  const filteredNav = NAV.filter(n => search === '' || n.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-2)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width: collapsed ? 60 : 230, background: 'linear-gradient(180deg,#1a1a2e 0%,#16213e 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width .25s', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '1rem 0' : '1.1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 8 }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '.01em' }}>KIU Admin</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>Boshqaruv paneli</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Panelni ochish' : 'Panelni yig\'ish'}
            style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {collapsed ? Ic.menu : Ic.close}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div style={{ padding: '0.7rem 1rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)', display: 'flex' }}>{Ic.search}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bo'lim qidirish..."
                style={{ width: '100%', padding: '7px 10px 7px 28px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, fontSize: 12, color: '#fff', outline: 'none', fontFamily: 'inherit' }} />
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.4rem 0', overflowY: 'auto' }}>
          {filteredNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '11px 0' : '9px 1.25rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
                background: isActive ? 'rgba(124,58,237,.3)' : 'none',
                textDecoration: 'none', transition: 'all .15s',
                borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
              })}>
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </NavLink>
          ))}
          {filteredNav.length === 0 && !collapsed && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', padding: '1rem 1.25rem', textAlign: 'center' }}>Topilmadi</p>
          )}
        </nav>

        {/* Bottom */}
        <div style={{ padding: collapsed ? '0.5rem 0' : '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => setDark(!dark)} aria-label={dark ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,.45)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', justifyContent: collapsed ? 'center' : 'flex-start', fontFamily: 'inherit', width: '100%' }}>
            {dark ? Ic.sun : Ic.moon}
            {!collapsed && (dark ? 'Yorug\' rejim' : 'Qorong\'u rejim')}
          </button>
          <NavLink to="/" aria-label="Saytga qaytish" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,.4)', textDecoration: 'none', padding: '6px 0', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            {Ic.home}{!collapsed && 'Saytga qaytish'}
          </NavLink>
          <button onClick={() => { localStorage.removeItem('kiu_token'); navigate('/admin/login') }} aria-label="Tizimdan chiqish"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', justifyContent: collapsed ? 'center' : 'flex-start', fontFamily: 'inherit', width: '100%' }}>
            {Ic.logout}{!collapsed && 'Chiqish'}
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ padding: '0.85rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            KIU Boshqaruv tizimi · <span style={{ color: '#7c3aed', fontWeight: 600 }}>admin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>{Ic.search}</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Bo'lim qidirish..."
                style={{ padding: '7px 12px 7px 30px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, background: 'var(--bg)', color: 'var(--text)', outline: 'none', width: 180, fontFamily: 'inherit' }}
              />
            </div>
            {/* Dark mode */}
            <button onClick={() => setDark(!dark)} aria-label={dark ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
              {dark ? Ic.sun : Ic.moon}
            </button>
          </div>
        </div>

        {/* Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Routes>
            <Route index element={<Stats />} />
            <Route path="news"         element={<NewsAdmin />} />
            <Route path="events"       element={<EventsAdmin />} />
            <Route path="teachers"     element={<TeachersAdmin />} />
            <Route path="gallery"      element={<GalleryAdmin />} />
            <Route path="applications" element={<ApplicationsAdmin type="admission" />} />
            <Route path="vacancies"    element={<ApplicationsAdmin type="vacancy" />} />
            <Route path="profile"      element={<ProfileAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}