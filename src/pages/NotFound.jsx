import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import useNavigate from '../i18n/useLocalizedNavigate'
import { Link } from '../i18n/router'
import Icon from '../components/Icon'

// Foydali havolalar: [kalit, yo'l, ikonka]
const LINKS = [
  ['faculty', '/faculty', <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>],
  ['admission', '/admission', <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>],
  ['news', '/news', <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>],
  ['contact', '/contact', <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.15a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />],
]

// Noma'lum yo'l uchun sahifa. SPA bo'lgani uchun HTTP 404 qaytmaydi — qidiruv tizimlaridan
// yashirish App.jsx'dagi useSeo'da (noindex) amalga oshiriladi.
export default function NotFound() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { key } = useLocation()
  // react-router: sahifaga bevosita (yangi tab/xatcho'p) tushilganda joriy yo'l kaliti 'default' — orqaga qaytadigan joy yo'q
  const canGoBack = key !== 'default'

  return (
    <section className="page-body notfound-body fade-up">
      <div className="container notfound">
        <div className="notfound__code" role="img" aria-label="404">
          <span className="notfound__digit" aria-hidden="true">4</span>
          <span className="notfound__tile" aria-hidden="true">
            <Icon size={60}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8.5" y1="8.5" x2="13.5" y2="13.5" /><line x1="13.5" y1="8.5" x2="8.5" y2="13.5" /></Icon>
          </span>
          <span className="notfound__digit" aria-hidden="true">4</span>
        </div>
        <div className="notfound__rule" aria-hidden="true" />
        <h1 className="notfound__title">{t('notFound.title')}</h1>
        <p className="notfound__text">{t('notFound.text')}</p>

        <div className="notfound__actions">
          <Link to="/" className="btn btn-primary btn-lg">
            <Icon size={18}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Icon>
            {t('notFound.home')}
          </Link>
          {canGoBack && (
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>
              <Icon size={18}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>
              {t('notFound.back')}
            </button>
          )}
        </div>

        <nav className="notfound__links" aria-label={t('notFound.linksTitle')}>
          <p className="notfound__links-label">{t('notFound.linksTitle')}</p>
          <ul>
            {LINKS.map(([k, to, icon]) => (
              <li key={k}>
                <Link to={to} className="pill-link">
                  <Icon size={16}>{icon}</Icon>
                  {t(`notFound.links.${k}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
