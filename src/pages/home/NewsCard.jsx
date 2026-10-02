import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import { getCategoryToken, getCategoryLabel } from '../../utils/newsCategories'
import { parseImages } from './utils'

// Home uchun ixcham yangilik kartasi (6.11c5): butun karta — bitta havola; tashqi ko'rinish Yangiliklar sahifasi kartasi
// bilan umumiy (`.card.news-card`, `.cat-dot`). Dinamik qiymatlar: toifa rangi `--cat` (4.4 palitrasi tokeni) va
// kirish animatsiyasi kechikishi `--i`; qolgani CSS da.
export default function HomeNewsCard({ item, index }) {
  const { t } = useTranslation()
  const img = parseImages(item.image)[0]
  return (
    <NavLink
      to={`/news/${item._id}`}
      className="card card-link news-card home-news-card"
      style={{ '--cat': getCategoryToken(item.category), '--i': index }}
    >
      {img
        // Rasm sarlavha bilan bir havola ichida — `alt=""` (dekorativ): havola nomi ikki marta o'qilmasin.
        // Yuklanmagan rasm yashiriladi: `data-broken` (CSS)
        ? <img src={img} alt="" loading="lazy" className="news-card-img" onError={e => { e.currentTarget.dataset.broken = 'true' }} />
        : <div className="news-card-ph">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
      }
      <div className="news-card-body">
        <div className="news-card-meta">
          {item.category && (
            <span className="news-card-cat">
              <span className="cat-dot" aria-hidden="true" />
              {getCategoryLabel(item.category, t)}
            </span>
          )}
          <span className="news-card-date">{new Date(item.createdAt).toLocaleDateString(t('meta.dateLocale'))}</span>
        </div>
        <h3 lang="uz" className="news-card-title">{item.title}</h3>
      </div>
    </NavLink>
  )
}
