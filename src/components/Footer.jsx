// src/components/Footer.jsx
import { useTranslation } from 'react-i18next'
import { NavLink } from '../i18n/router'
import config from '../config'
import Logo from './Logo'
import Icon from './Icon'

// "Tepaga qaytish": harakat kamaytirish sozlamasi yoqilgan bo'lsa — silliq siljishsiz
function scrollToTop() {
  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

const SOCIAL = [
  { key: 'telegram', label: 'Telegram', icon: <><path d="M21 4 3 11l6 2.5L11.5 20z"/><path d="M9 13.5 21 4"/></> },
  { key: 'instagram', label: 'Instagram', icon: <><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".8" fill="currentColor"/></> },
  { key: 'youtube', label: 'YouTube', icon: <><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/></> },
  { key: 'facebook', label: 'Facebook', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
]

const MEDIA = [
  ['/map', 'map', <><path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7z"/><path d="M9 4v13M15 7v13"/></>],
  ['/qrcode', 'qrcode', <><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/></>],
]

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="site-footer">
      <div className="footer-hairline" aria-hidden="true" />
      <div className="footer-wrap footer-grid">
        <div className="footer-brand">
          <div className="footer-brandline">
            <Logo height={44} decorative className="site-logo site-logo--footer" />
            <span className="footer-brandline__sep" aria-hidden="true" />
            <h2 className="footer-title">{t('university.name')}</h2>
          </div>
          <p className="footer-about">
            {t('footer.about', { year: config.university.founded })}
          </p>
          {/* Xatolik: rel="noreferrer" yolg'iz o'zi window.opener'ni kafolatlab
              bloklamaydi — barcha ijtimoiy tarmoq havolalariga noopener qo'shildi
              (tabnabbing'dan himoya, Documents.jsx/TelegramPanel.jsx bilan bir xil) */}
          <div className="footer-social">
            {SOCIAL.map(({ key, label, icon }) => (
              <a key={key} href={config.social[key]} aria-label={label} target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <Icon size={18}>{icon}</Icon>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="footer-heading">{t('footer.university')}</h3>
          <div className="footer-links">
            {[
              ['/about', 'about'],
              ['/teachers', 'teachers'],
              ['/international', 'international'],
              ['/documents', 'documents'],
              ['/vacancies', 'vacancies'],
              ['/hemis', 'hemis'],
            ].map(([to, key]) => (
              <NavLink key={to} to={to} className="footer-link">{t(`footer.links.${key}`)}</NavLink>
            ))}
          </div>
        </div>

        <div>
          <h3 className="footer-heading">{t('footer.students')}</h3>
          <div className="footer-links">
            {[
              ['/faculty', 'faculty'],
              ['/sorting-hat', 'sortingHat'],
              ['/admission', 'admission'],
              ['/student-life', 'gallery'],
              ['/events', 'events'],
              ['/achievements', 'achievements'],
              ['/kelajakka-qadam', 'futureStep'],
              ['/faq', 'faq'],
            ].map(([to, key]) => (
              <NavLink key={to} to={to} className="footer-link">{t(`footer.links.${key}`)}</NavLink>
            ))}
          </div>
        </div>

        <div className="footer-contact">
          <h3 className="footer-heading">{t('footer.contact')}</h3>
          <div className="footer-rows">
            <p className="footer-row">
              <span className="footer-tile"><Icon size={18}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/></Icon></span>
              <span className="footer-row__text">{config.contact.phone}</span>
            </p>
            <p className="footer-row">
              <span className="footer-tile"><Icon size={18}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon></span>
              <span className="footer-row__text">{config.contact.email}</span>
            </p>
            <p className="footer-row">
              <span className="footer-tile"><Icon size={18}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon></span>
              <span className="footer-row__text">{t('university.workHours')}</span>
            </p>
          </div>
          <div className="footer-media">
            {MEDIA.map(([to, key, icon]) => (
              <NavLink key={to} to={to} className="footer-media-link">
                <span className="footer-tile footer-tile--gold"><Icon size={17}>{icon}</Icon></span>
                {t(`footer.links.${key}`)}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-wrap footer-bottom">
        <span>{t('footer.rights', { name: t('university.name') })}</span>
        <button type="button" className="footer-top" aria-label={t('footer.toTop')} onClick={scrollToTop}>
          <Icon size={18}><path d="M12 19V5M6 11l6-6 6 6"/></Icon>
        </button>
      </div>
    </footer>
  )
}
