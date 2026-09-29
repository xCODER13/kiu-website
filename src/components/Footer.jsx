// src/components/Footer.jsx
import { useTranslation } from 'react-i18next'
import { NavLink } from '../i18n/router'
import config from '../config'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '2.5rem 0 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', paddingBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>{t('university.name')}</h3>
          <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7, marginBottom: 16 }}>
            {t('footer.about', { year: config.university.founded })}
          </p>
          {/* Xatolik: rel="noreferrer" yolg'iz o'zi window.opener'ni kafolatlab
              bloklamaydi — barcha ijtimoiy tarmoq havolalariga noopener qo'shildi
              (tabnabbing'dan himoya, Documents.jsx/TelegramPanel.jsx bilan bir xil) */}
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={config.social.telegram} aria-label="Telegram" target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
            </a>
            <a href={config.social.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href={config.social.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
            </a>
            <a href={config.social.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#f3f4f6', marginBottom: 10 }}>{t('footer.university')}</h4>
          {[
            ['/about', 'about'],
            ['/teachers', 'teachers'],
            ['/international', 'international'],
            ['/documents', 'documents'],
            ['/vacancies', 'vacancies'],
            ['/hemis', 'hemis'],
          ].map(([to, key]) => (
            <NavLink key={to} to={to}
              style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}
              onMouseEnter={e => e.target.style.color = '#a78bfa'}
              onMouseLeave={e => e.target.style.color = '#9ca3af'}
            >{t(`footer.links.${key}`)}</NavLink>
          ))}
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#f3f4f6', marginBottom: 10 }}>{t('footer.students')}</h4>
          {[
            ['/faculty', 'faculty'],
            ['/sorting-hat', 'sortingHat'],
            ['/admission', 'admission'],
            ['/events', 'events'],
            ['/achievements', 'achievements'],
            ['/testimonials', 'testimonials'],
            ['/faq', 'faq'],
          ].map(([to, key]) => (
            <NavLink key={to} to={to}
              style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6 }}
              onMouseEnter={e => e.target.style.color = '#a78bfa'}
              onMouseLeave={e => e.target.style.color = '#9ca3af'}
            >{t(`footer.links.${key}`)}</NavLink>
          ))}
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#f3f4f6', marginBottom: 10 }}>{t('footer.contact')}</h4>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>{config.contact.phone}</p>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>{config.contact.email}</p>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>{t('university.workHours')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['/gallery', 'gallery', <svg key="g" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>],
              ['/map', 'map', <svg key="m" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 10 18 10 2 1 6"/><polygon points="14 2 14 18 23 22 23 6 14 2"/></svg>],
              ['/qrcode', 'qrcode', <svg key="q" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>],
            ].map(([to, key, icon]) => (
              <NavLink key={to} to={to}
                style={{ fontSize: 13, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 6 }}
                onMouseEnter={e => e.currentTarget.style.color = '#e9d5ff'}
                onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
              >
                {icon} {t(`footer.links.${key}`)}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{
        paddingTop: '1rem', paddingBottom: '1.25rem',
        borderTop: '1px solid rgba(255,255,255,.08)',
        display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: '#9ca3af',
        flexWrap: 'wrap', gap: 8
      }}>
        <span>{t('footer.rights', { name: t('university.name') })}</span>
      </div>
    </footer>
  )
}