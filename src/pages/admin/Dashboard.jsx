import { useState, useEffect } from 'react'
import { useNavigate, NavLink, Routes, Route } from 'react-router-dom'
import { Ic } from './shared/Icons.jsx'
import Logo from '../../components/Logo'
import { NAV } from './shared/constants'
import { installUnauthorizedHandler } from './shared/api'
import useTheme from '../../hooks/useTheme'
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
  const [dark, setDark] = useTheme()
  const [search, setSearch] = useState('')
  const tk = localStorage.getItem('kiu_token')

  useEffect(() => { if (!tk) navigate('/admin/login') }, [tk, navigate])
  // Sessiya tugasa (401) — loginga qaytaramiz
  useEffect(() => installUnauthorizedHandler(() => navigate('/admin/login')), [navigate])

  const filteredNav = NAV.filter(n => search === '' || n.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="adm-shell" data-collapsed={collapsed}>

      {/* ── SIDEBAR ── */}
      <div className="adm-sidebar">

        {/* Logo */}
        <div className="adm-sidebar-head">
          <div className="adm-brand">
            <Logo height={collapsed ? 22 : 36} className="adm-logo adm-logo--side" />
            {!collapsed && (
              <div>
                <div className="adm-brand-title">Admin</div>
                <div className="adm-brand-sub">Boshqaruv paneli</div>
              </div>
            )}
          </div>
          <button className="adm-collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Panelni ochish' : 'Panelni yig\'ish'}>
            {collapsed ? Ic.menu : Ic.close}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="adm-side-search">
            <div className="adm-side-search-field">
              <span className="adm-side-search-icon">{Ic.search}</span>
              <input className="adm-side-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Bo'lim qidirish..." />
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="adm-nav">
          {filteredNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'} className="adm-nav-link"
              aria-label={item.label} title={collapsed ? item.label : undefined}>
              <span className="adm-nav-icon">{item.icon}</span>
              {!collapsed && <span className="adm-nav-label">{item.label}</span>}
            </NavLink>
          ))}
          {filteredNav.length === 0 && !collapsed && (
            <p className="adm-nav-empty">Topilmadi</p>
          )}
        </nav>

        {/* Bottom */}
        <div className="adm-sidebar-foot">
          <button className="adm-side-action" onClick={() => setDark(!dark)} aria-label={dark ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}>
            {dark ? Ic.sun : Ic.moon}
            {!collapsed && (dark ? 'Yorug\' rejim' : 'Qorong\'u rejim')}
          </button>
          <NavLink to="/" className="adm-side-action" aria-label="Saytga qaytish">
            {Ic.home}{!collapsed && 'Saytga qaytish'}
          </NavLink>
          <button className="adm-side-action is-danger" onClick={() => { localStorage.removeItem('kiu_token'); navigate('/admin/login') }} aria-label="Tizimdan chiqish">
            {Ic.logout}{!collapsed && 'Chiqish'}
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="adm-main">

        {/* Topbar */}
        <div className="adm-topbar">
          <div className="adm-topbar-title">
            <Logo height={22} className="adm-logo adm-logo--top" decorative />
            KIU Boshqaruv tizimi · <span className="adm-topbar-accent">admin</span>
          </div>
          <div className="adm-topbar-tools">
            {/* Dark mode */}
            <button className="adm-theme-btn" onClick={() => setDark(!dark)} aria-label={dark ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}>
              {dark ? Ic.sun : Ic.moon}
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="adm-content">
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