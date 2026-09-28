import { NavLink } from 'react-router-dom'
import { getCategoryColor, getCategoryLabel } from '../../utils/newsCategories'
import { parseImages } from './utils'

// Home uchun ixcham yangilik kartasi — Home.jsx'dan o'zgarishsiz ko'chirilgan.
export default function HomeNewsCard({ item, index }) {
  const catColor = getCategoryColor(item.category)
  const img = parseImages(item.image)[0]
  return (
    <NavLink to={`/news/${item._id}`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{ padding: 0, overflow: 'hidden', height: '100%', animation: `homeSectionFadeIn .4s ease ${index * 0.06}s both` }}
      >
        {img
          ? <img src={img} alt={item.title} loading="lazy" style={{ width: '100%', height: 140, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
          : <div style={{ width: '100%', height: 140, background: `linear-gradient(135deg, ${catColor}22, ${catColor}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={`${catColor}66`} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
        }
        <div style={{ padding: '0.85rem 1rem' }}>
          {item.category && (
            <span style={{ fontSize: 10, fontWeight: 600, color: catColor, background: `${catColor}18`, padding: '2px 8px', borderRadius: 20 }}>
              {getCategoryLabel(item.category)}
            </span>
          )}
          <h4 style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.title}
          </h4>
          <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 6 }}>
            {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
          </div>
        </div>
      </div>
    </NavLink>
  )
}