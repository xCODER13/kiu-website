import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import useNavigate from '../i18n/useLocalizedNavigate'
import { Link } from '../i18n/router'
import Icon from '../components/Icon'

// Foydali havolalar: [kalit, yo'l, ikonka]
const LINKS = [
  ['faculty', '/faculty', <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>],
  ['admission', '/admission', <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></>],
  ['news', '/news', <><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><line x1="10" y1="6" x2="18" y2="6" /><line x1="10" y1="10" x2="18" y2="10" /><line x1="10" y1="14" x2="14" y2="14" /></>],
  ['contact', '/contact', <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>],
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
