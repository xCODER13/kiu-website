import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from '../i18n/router'
import useLocale from '../i18n/useLocale'
import LanguageSwitcher from '../i18n/LanguageSwitcher'
import config from '../config'
import Search from './Search'
import Logo from './Logo'

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
const navGroups = [
  {
    id: 'university',
    items: [
      { to: '/about', item: 'about' },
      { to: '/achievements', item: 'achievements' },
      { to: '/international', item: 'international' },
      { to: '/documents', item: 'documents' },
      { to: '/teachers', item: 'teachers' },
    ],
  },
  {
    id: 'students',
    items: [
      { to: '/faculty', item: 'faculty' },
      { to: '/admission', item: 'admission' },
      { to: '/faq', item: 'faq' },
      { to: '/hemis', item: 'hemis' },
      { to: '/sorting-hat', item: 'sortingHat' },
    ],
  },
  {
    id: 'media',
    items: [
      { to: '/news', item: 'news' },
      { to: '/events', item: 'events' },
      { to: '/gallery', item: 'gallery' },
      { to: '/testimonials', item: 'testimonials' },
    ],
  },
  {
    id: 'contact',
    items: [
      { to: '/contact', item: 'contact' },
      { to: '/map', item: 'map' },
      { to: '/qrcode', item: 'qrcode' },
    ],
  },
]

function ChevronIcon() {
  return (
    <svg className="icon-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
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
          <div>
            <div className="nav-brand-name">{t('university.name')}</div>
            <div className="nav-brand-sub">{t('nav.subtitle', { website: config.university.website })}</div>
          </div>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button onClick={onApply} className="btn btn-primary btn-sm desktop-nav">
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
