import { useTranslation } from 'react-i18next'
import useNavigate from '../../i18n/useLocalizedNavigate'
import { getCategoryToken, getCategoryLabel } from '../../utils/newsCategories'
import { parseImages } from './utils'
import { formatDate } from '../../utils/formatDate'
import ThumbImg from '../../components/ThumbImg'

// ── NEWS CARD ── (6.11: kategoriya rangi `--cat` orqali, hover/fokus CSS da)
export default function NewsCard({ item }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // Toifa rangi ma'lumotdan keladi → kartada yagona dinamik qiymat: `--cat` (4.4 palitrasi tokeni)
  return (
    <div className="card card-link news-card" style={{ '--cat': getCategoryToken(item.category) }}>
      {item.image
        // Yuklanmagan rasm yashiriladi: `data-broken` (CSS), inline stil yozilmaydi
        ? <ThumbImg src={parseImages(item.image)[0]} alt={item.title} loading="lazy" className="news-card-img" onError={e => { e.currentTarget.dataset.broken = 'true' }} />
        : <div className="news-card-ph">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
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
          <span className="news-card-date">{formatDate(item.createdAt)}</span>
        </div>
        <h3 lang="uz" className="news-card-title">{item.title}</h3>
        {item.content && (
          <p lang="uz" className="news-card-text">{item.content}</p>
        )}
        <div className="news-card-foot">
          <span className="news-card-views">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {item.views}
          </span>
          <button type="button" onClick={() => navigate(`/news/${item._id}`)} className="btn btn-primary btn-sm news-card-btn">
            {t('news.more')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
