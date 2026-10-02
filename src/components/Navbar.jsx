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
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, flexShrink: 0 }}>
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
      <nav ref={navRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 2rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'color-mix(in srgb, var(--color-bg) 97%, transparent)', backdropFilter: 'blur(10px)', zIndex: 100 }}>

        {/* Logo */}
        {/* Xatolik: mobil menyu ochiq holda logotipga bosilsa, sahifa
            almashsa ham menyu ochiq qolib qolar edi — onClick qo'shildi */}
        <NavLink to="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo height={36} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{t('university.name')}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t('nav.subtitle', { website: config.university.website })}</div>
          </div>
        </NavLink>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="desktop-nav">
          {topLinks.map(l => (
            <NavLink key={l.to} to={l.to} end
              style={({ isActive }) => ({
                fontSize: 11,
                color: isActive ? 'var(--color-brand)' : 'var(--color-text)',
                borderBottom: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
                paddingBottom: 3,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s'
              })}>
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
                  style={{
                    display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 11, padding: 0, paddingBottom: 3,
                    color: isActive ? 'var(--color-brand)' : 'var(--color-text)',
                    fontWeight: isActive ? 600 : 400,
                    borderBottom: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
                  }}
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
            <NavLink key={l.to} to={l.to} end
              style={({ isActive }) => ({
                fontSize: 11,
                color: isActive ? 'var(--color-brand)' : 'var(--color-text)',
                borderBottom: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
                paddingBottom: 3,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s'
              })}>
              {t(`nav.${l.label}`)}
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search />
          <LanguageSwitcher className="desktop-nav" />
          <button onClick={() => setDark(!dark)} aria-label={dark ? t('nav.switchToLight') : t('nav.switchToDark')} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button onClick={onApply} className="btn btn-primary desktop-nav" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
            {t('nav.apply')}
          </button>
          <button className="mobile-nav" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text)', fontSize: 20, lineHeight: 1 }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-nav" style={{ position: 'fixed', top: navHeight, left: 0, right: 0, bottom: 0, background: 'var(--bg)', zIndex: 99, display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem', gap: 4, borderTop: '1px solid var(--border)', overflowY: 'auto' }}>
          <LanguageSwitcher className="lang-switch--menu" onNavigate={() => setMenuOpen(false)} />
          {topLinks.map(l => (
            <NavLink key={l.to} to={l.to} end onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                fontSize: 18, fontWeight: 600,
                color: isActive ? 'var(--color-brand)' : 'var(--text)',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border)',
              })}>
              {t(`nav.${l.label}`)}
            </NavLink>
          ))}

          {/* Har bir guruh — <details> orqali ochiladi/yopiladi, qo'shimcha JS holat kerak emas */}
          {navGroups.map(group => (
            <details key={group.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 18, fontWeight: 600, color: 'var(--text)', padding: '0.75rem 0', cursor: 'pointer', listStyle: 'none' }}>
                {t(`nav.groups.${group.id}`)}
                <ChevronIcon />
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 8 }}>
                {group.items.map(item => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                    style={({ isActive }) => ({
                      fontSize: 15,
                      color: isActive ? 'var(--color-brand)' : 'var(--muted)',
                      fontWeight: isActive ? 600 : 400,
                      padding: '0.5rem 0 0.5rem 0.75rem',
                    })}>
                    {t(`nav.items.${item.item}`)}
                  </NavLink>
                ))}
              </div>
            </details>
          ))}

          {endLinks.map(l => (
            <NavLink key={l.to} to={l.to} end onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                fontSize: 18, fontWeight: 600,
                color: isActive ? 'var(--color-brand)' : 'var(--text)',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border)',
              })}>
              {t(`nav.${l.label}`)}
            </NavLink>
          ))}

          <button onClick={() => { onApply(); setMenuOpen(false) }} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '1rem' }}>
            {t('nav.apply')}
          </button>
        </div>
      )}
    </>
  )
}