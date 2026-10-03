import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from '../i18n/router'
import useLocale from '../i18n/useLocale'
import LanguageSwitcher from '../i18n/LanguageSwitcher'
import Search from './Search'
import Logo from './Logo'
import Icon from './Icon'

// Guruhga kirmaydigan, doim ko'rinadigan linklar — eng boshida.
// Matnlar endi i18n'da (nav.*): bu yerda faqat yo'l va kalit turadi.
const topLinks = [
  { to: '/', label: 'home' },
]

// Guruhga kirmaydigan, doim ko'rinadigan linklar — dropdown guruhlaridan
// keyin, navbar'ning eng oxirida chiqadi
const endLinks = [
  { to: '/vacancies', label: 'vacancies' },
]

// Qolgan 18 ta sahifa 4 ta guruhga bo'lingan (dropdown/mega-menu).
// Avval hammasi bitta qatorda edi va ko'p sahifa (About, Events, Gallery,
// Map, Teachers, QRCode, SortingHat) navbar'da umuman ko'rinmas edi.
// `id` — guruh kaliti (nav.groups.<id>), `item` — nav.items.<item>.
// Dropdown element ikonkalari (18 px, chiziqli) — spec 6.6: ichki path'lar `Icon` qobig'iga beriladi
const I = {
  info: <><circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.6v.01"/></>,
  award: <><circle cx="12" cy="9" r="6"/><path d="M8.5 14.2 7 22l5-3 5 3-1.5-7.8"/></>,
  globe: <><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5a14.5 14.5 0 0 1 3.8 9.5A14.5 14.5 0 0 1 12 21.5 14.5 14.5 0 0 1 8.2 12 14.5 14.5 0 0 1 12 2.5z"/></>,
  file: <><path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5z"/><path d="M14 2.5v5h5M9 13h6M9 17h6"/></>,
  users: <><path d="M16.5 20.5v-2a4 4 0 0 0-4-4h-6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7.5" r="3.8"/><path d="M21.5 20.5v-2a4 4 0 0 0-3-3.9M15.5 3.8a3.8 3.8 0 0 1 0 7.4"/></>,
  grad: <><path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12.2v5c3 3 9 3 12 0v-5M22 10v6"/></>,
  pen: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
  help: <><circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.2a3 3 0 0 1 5.8 1c0 2-3 2.6-3 4.3M12 17.6v.01"/></>,
  monitor: <><rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8 21h8M12 16.5V21"/></>,
  sparkles: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M21 5h-4M5 17v4M7 19H3"/></>,
  calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 15-5-5L5 21"/></>,
  message: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
  phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></>,
  pin: <><path d="M20.5 10c0 6-8.5 12-8.5 12S3.5 16 3.5 10a8.5 8.5 0 0 1 17 0z"/><circle cx="12" cy="10" r="3"/></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><path d="M14 14h3v3h-3zM21 14v.01M14 21h3M21 17v4"/></>,
}

const navGroups = [
  {
    id: 'university',
    items: [
      { to: '/about', item: 'about', icon: 'info' },
      { to: '/achievements', item: 'achievements', icon: 'award' },
      { to: '/international', item: 'international', icon: 'globe' },
      { to: '/documents', item: 'documents', icon: 'file' },
      { to: '/teachers', item: 'teachers', icon: 'users' },
    ],
  },
  {
    id: 'students',
    items: [
      { to: '/faculty', item: 'faculty', icon: 'grad' },
      { to: '/admission', item: 'admission', icon: 'pen' },
      { to: '/faq', item: 'faq', icon: 'help' },
      { to: '/hemis', item: 'hemis', icon: 'monitor' },
      { to: '/sorting-hat', item: 'sortingHat', icon: 'sparkles' },
    ],
  },
  {
    id: 'media',
    items: [
      { to: '/news', item: 'news', icon: 'file' },
      { to: '/events', item: 'events', icon: 'calendar' },
      { to: '/gallery', item: 'gallery', icon: 'image' },
      { to: '/testimonials', item: 'testimonials', icon: 'message' },
    ],
  },
  {
    id: 'contact',
    items: [
      { to: '/contact', item: 'contact', icon: 'phone' },
      { to: '/map', item: 'map', icon: 'pin' },
      { to: '/qrcode', item: 'qrcode', icon: 'qr' },
    ],
  },
]

function ChevronIcon() {
  return (
    <svg className="icon-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function Navbar({ dark, setDark, onApply }) {
  const [menuOpen, setMenuOpen] = useState(false)
  // Mobil menyu header ostidan boshlanishi kerak. Header balandligi qat'iy emas:
  // sarlavha matni (masalan ruscha "Каршинский международный университет")
  // 3 qatorga o'tib, header'ni balandroq qiladi — shuning uchun 62px'ni qotirib
  // qo'ymay, haqiqiy balandlikni o'lchaymiz.
  const navRef = useRef(null)
  const [navHeight, setNavHeight] = useState(62)
  // SPA'da (to'liq sahifa qayta yuklanmagani uchun) link bosilganda sichqoncha
  // joyidan qimirlamasa, :hover holati brauzer nuqtai nazaridan haligacha
  // "to'g'ri" bo'lib qoladi — shuning uchun panel ochiq ko'rinishda qolib
  // ketardi. closedGroup shu holatni JS orqali majburan yopadi, sichqoncha
  // haqiqatan chetga chiqqanda (onMouseLeave) yana oddiy hover ishlay boshlaydi.
  const [closedGroup, setClosedGroup] = useState(null)
  const { t } = useTranslation()
  // Faol havolani aniqlash uchun prefikssiz yo'l: /en/faculty → /faculty
  const { path } = useLocale()

  useEffect(() => {
    const el = navRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => setNavHeight(Math.round(el.getBoundingClientRect().height) || 62))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <nav ref={navRef} className="site-nav">

        {/* Logo */}
        {/* Xatolik: mobil menyu ochiq holda logotipga bosilsa, sahifa
            almashsa ham menyu ochiq qolib qolar edi — onClick qo'shildi */}
        <NavLink to="/" onClick={() => setMenuOpen(false)} className="nav-brand">
          <Logo height={36} />
          <span className="nav-brand-text">
            <span className="nav-brand-divider" aria-hidden="true" />
            <span className="nav-brand-title">
              <span className="nav-brand-name">{t('university.name')}</span>
              <span className="nav-brand-sub">{t('nav.officialSite')}</span>
            </span>
          </span>
        </NavLink>

        {/* Desktop links */}
        <div className="nav-links desktop-nav">
          {topLinks.map(l => (
            <NavLink key={l.to} to={l.to} end className="nav-link">
              {t(`nav.${l.label}`)}
            </NavLink>
          ))}

          {navGroups.map(group => {
            const isActive = group.items.some(i => path === i.to)
            return (
              <div
                key={group.id}
                className={`nav-group${closedGroup === group.id ? ' force-closed' : ''}`}
                onMouseLeave={() => setClosedGroup(null)}
              >
                <button
                  onClick={(e) => e.currentTarget.blur()}
                  className="nav-group-trigger"
                  data-active={isActive}
                  aria-haspopup="true"
                >
                  {t(`nav.groups.${group.id}`)}
                  <ChevronIcon />
                </button>

                <div className="nav-group-panel">
                  <div className="nav-group-panel-inner">
                    {group.items.map(item => (
                      <NavLink key={item.to} to={item.to}
                        onClick={(e) => { e.currentTarget.blur(); setClosedGroup(group.id) }}
                        className={({ isActive }) => `nav-group-item${isActive ? ' active' : ''}`}>
                        <Icon size={18}>{I[item.icon]}</Icon>
                        {t(`nav.items.${item.item}`)}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          {endLinks.map(l => (
            <NavLink key={l.to} to={l.to} end className="nav-link">
              {t(`nav.${l.label}`)}
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <div className="nav-actions">
          <Search />
          <LanguageSwitcher className="desktop-nav" />
          <button onClick={() => setDark(!dark)} aria-label={dark ? t('nav.switchToLight') : t('nav.switchToDark')} className="nav-icon-btn">
            {dark ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>
            )}
          </button>
          <span className="nav-divider desktop-nav" aria-hidden="true" />
          <button onClick={onApply} className="btn btn-primary btn-cta btn-glow desktop-nav">
            {t('nav.apply')}
          </button>
          <button className="mobile-nav nav-icon-btn nav-icon-btn--menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu. `top` — dinamik (header balandligi), shuning uchun inline qoladi */}
      {menuOpen && (
        <div className="mobile-nav mobile-menu" style={{ top: navHeight }}>
          <LanguageSwitcher className="lang-switch--menu" onNavigate={() => setMenuOpen(false)} />
          {topLinks.map(l => (
            <NavLink key={l.to} to={l.to} end onClick={() => setMenuOpen(false)} className="mobile-menu-link">
              {t(`nav.${l.label}`)}
            </NavLink>
          ))}

          {/* Har bir guruh — <details> orqali ochiladi/yopiladi, qo'shimcha JS holat kerak emas */}
          {navGroups.map(group => (
            <details key={group.id} className="mobile-menu-group">
              <summary className="mobile-menu-summary">
                {t(`nav.groups.${group.id}`)}
                <ChevronIcon />
              </summary>
              <div className="mobile-menu-sub">
                {group.items.map(item => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="mobile-menu-sublink">
                    {t(`nav.items.${item.item}`)}
                  </NavLink>
                ))}
              </div>
            </details>
          ))}

          {endLinks.map(l => (
            <NavLink key={l.to} to={l.to} end onClick={() => setMenuOpen(false)} className="mobile-menu-link">
              {t(`nav.${l.label}`)}
            </NavLink>
          ))}

          <button onClick={() => { onApply(); setMenuOpen(false) }} className="btn btn-primary btn-block mobile-menu-apply">
            {t('nav.apply')}
          </button>
        </div>
      )}
    </>
  )
}
