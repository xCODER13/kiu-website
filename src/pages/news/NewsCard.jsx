import { useTranslation } from 'react-i18next'
import useNavigate from '../../i18n/useLocalizedNavigate'
import { getCategoryColor, getCategoryLabel } from '../../utils/newsCategories'
import { parseImages } from './utils'

// ── NEWS CARD ── (News.jsx'dan o'zgarishsiz ko'chirilgan)
export default function NewsCard({ item }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const catColor = getCategoryColor(item.category)
  return (
    <div className="card card-link news-card">
      {item.image
        // onError: yuklanmagan rasmni yashirish — ish vaqtidagi holat, shuning uchun imperativ qoladi
        ? <img src={parseImages(item.image)[0]} alt={item.title} loading="lazy" className="news-card-img" onError={e => e.target.style.display = 'none'} />
        // Toifa rangi ma'lumotdan keladi — gradient va ikonka rangi inline
        : <div className="news-card-ph" style={{ background: `linear-gradient(135deg, ${catColor}22, ${catColor}11)` }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={`${catColor}66`} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
      }
      <div className="news-card-body">
        <div className="news-card-meta">
          {item.category && (
            <span className="news-card-cat" style={{ color: catColor, background: `${catColor}18` }}>
              {getCategoryLabel(item.category, t)}
            </span>
          )}
          <span className="news-card-date">{new Date(item.createdAt).toLocaleDateString(t('meta.dateLocale'))}</span>
        </div>
        <h3 lang="uz" className="news-card-title">{item.title}</h3>
        {item.content && (
          <p lang="uz" className="news-card-text">{item.content}</p>
        )}
        <div className="news-card-foot">
          <span className="news-card-views">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {item.views}
          </span>
          <button onClick={() => navigate(`/news/${item._id}`)} className="news-card-btn">
            {t('news.more')}
          </button>
        </div>
      </div>
    </div>
  )
}
