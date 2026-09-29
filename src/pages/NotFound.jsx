import { useTranslation } from 'react-i18next'
import { Link } from '../i18n/router'

// Noma'lum yo'l uchun sahifa. SPA bo'lgani uchun HTTP 404 qaytmaydi — qidiruv tizimlaridan
// yashirish App.jsx'dagi useSeo'da (noindex) amalga oshiriladi.
export default function NotFound() {
  const { t } = useTranslation()
  return (
    <section className="section fade-up">
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: 16 }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8.5" y1="8.5" x2="13.5" y2="13.5" /><line x1="13.5" y1="8.5" x2="8.5" y2="13.5" />
        </svg>
        <h1 style={{ fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '.5rem' }}>{t('notFound.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 420, margin: '0 auto 1.5rem', lineHeight: 1.7 }}>{t('notFound.text')}</p>
        <Link to="/" className="btn btn-primary">{t('notFound.home')}</Link>
      </div>
    </section>
  )
}
