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
    <div
      className="card"
      style={{ padding: 0, overflow: 'hidden', transition: 'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}
    >
      {item.image
        ? <img src={parseImages(item.image)[0]} alt={item.title} loading="lazy" style={{ width: '100%', height: 160, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
        : <div style={{
            width: '100%', height: 160,
            background: `linear-gradient(135deg, ${catColor}22, ${catColor}11)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={`${catColor}66`} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
      }
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          {item.category && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: catColor,
              background: `${catColor}18`, padding: '2px 8px', borderRadius: 20,
            }}>
              {getCategoryLabel(item.category, t)}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(item.createdAt).toLocaleDateString(t('meta.dateLocale'))}</span>
        </div>
        <h3 lang="uz" style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5, marginBottom: 6,
          fontFamily: 'var(--font-body)', display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{item.title}</h3>
        {item.content && (
          <p lang="uz" style={{
            fontSize: 12, color: 'var(--muted)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{item.content}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {item.views}
          </span>
          <button
            onClick={() => navigate(`/news/${item._id}`)}
            style={{
              padding: '5px 14px',
              background: 'var(--gradient-brand)',
              color: 'var(--color-on-brand)', border: 'none', borderRadius: 7,
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'opacity .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {t('news.more')}
          </button>
        </div>
      </div>
    </div>
  )
}