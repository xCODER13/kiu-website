import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import ContentLangNote from '../../i18n/ContentLangNote'
import HomeNewsCarousel from './NewsCarousel'
import HomeNewsCard from './NewsCard'

// "Yangiliklar" bo'limi — Home.jsx'dan o'zgarishsiz ko'chirilgan
// (yuklanish skeleton'i, karusel + so'nggi 3 ta karta, xato/bo'sh holat).
export default function NewsSection({ newsLoading, articles, newsError, featured, latest3 }) {
  const { t } = useTranslation()
  return (
    <section className="section" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <div className="reveal section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
            {t('home.news.badge')}
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '.5rem' }}>{t('home.news.title')}</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('home.news.subtitle')}</p>
          <ContentLangNote />
        </div>

        {newsLoading ? (
          // ── Yuklanmoqda: skeleton — layout sakramasligi uchun ──
          <>
            <div style={{
              width: '100%', height: 380, borderRadius: 20,
              background: 'linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%)',
              backgroundSize: '200% 100%', animation: 'homeSkelShimmer 1.4s ease-in-out infinite',
              marginBottom: '1.75rem',
            }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  height: 220, borderRadius: 14,
                  background: 'linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%)',
                  backgroundSize: '200% 100%', animation: `homeSkelShimmer 1.4s ease-in-out infinite ${i * 0.1}s`,
                }} />
              ))}
            </div>
          </>
        ) : articles.length > 0 ? (
          // ── Muvaffaqiyatli yuklandi ──
          <>
            <div style={{ marginBottom: '1.75rem' }}>
              <HomeNewsCarousel items={featured} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {latest3.map((n, i) => <HomeNewsCard key={n._id} item={n} index={i} />)}
            </div>
          </>
        ) : (
          // ── Xato yoki bo'sh natija ──
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 14 }}>
            {newsError ? t('home.news.error') : t('home.news.empty')}
          </div>
        )}

        <div className="reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <NavLink to="/news"><button className="btn btn-primary">{t('home.news.all')}</button></NavLink>
        </div>
      </div>
    </section>
  )
}