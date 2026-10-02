import { useTranslation } from 'react-i18next'
import TelegramPanel from '../../components/TelegramPanel'
import { getCategoryColor, getCategoryLabel, categoryMatches } from '../../utils/newsCategories'
import FeaturedCarousel from './FeaturedCarousel'
import NewsCard from './NewsCard'

// "NEWS TAB" bo'limi — News.jsx'dan o'zgarishsiz ko'chirilgan, faqat kerakli
// qiymatlar endi orkestrator (News.jsx)dan prop sifatida keladi.
export default function NewsTab({
  loading, error, articles, featured, categories,
  activeCategory, setActiveCategory, search, setSearch,
  visibleCount, setVisibleCount, filtered,
}) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--muted)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--color-brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        {t('common.loading')}
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--muted)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: .3, marginBottom: 12 }}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <p style={{ fontSize: 14 }}>{t('news.empty')}</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>{t('news.emptyHint')}</p>
      </div>
    )
  }

  return (
    <>
      {/* FEATURED CAROUSEL — rounded corners, inside container */}
      {featured.length > 0 && (
        <div className="container">
          <FeaturedCarousel items={featured} />
        </div>
      )}

      {/* TELEGRAM BANNER — rounded, below carousel */}
      <div className="container" style={{ marginBottom: '0.5rem' }}>
        <div style={{ borderRadius: 20, overflow: 'hidden' }}>
          <TelegramPanel />
        </div>
        <a href="https://t.me/kiu_uz" target="_blank" rel="noreferrer"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand)', marginTop: '0.75rem', display: 'inline-block' }}>
          {t('news.allNews')}
        </a>
      </div>

      {/* NEWS GRID SECTION */}
      <section className="section">
        <div className="container">
          {error && (
            <div style={{
              textAlign: 'center', padding: '0.75rem', marginBottom: '1rem',
              background: 'color-mix(in srgb, var(--color-brand) 6%, transparent)', borderRadius: 10, fontSize: 13,
              color: 'var(--muted)', border: '1px solid var(--border)',
            }}>
              {t('news.offline')}
            </div>
          )}

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setVisibleCount(6) }}
              placeholder={t('news.searchPh')}
              style={{
                width: '100%', padding: '10px 14px 10px 36px',
                border: '1px solid var(--border)', borderRadius: 10, fontSize: 13,
                background: 'var(--bg)', color: 'var(--text)', outline: 'none',
                fontFamily: 'var(--font-body)', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category filter */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {categories.map(cat => {
                const color = cat === 'all' ? '#7c3aed' : getCategoryColor(cat)
                const isActive = activeCategory === cat
                return (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setVisibleCount(6) }} style={{
                    fontSize: 12, padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
                    transition: 'all .2s', fontWeight: isActive ? 600 : 400,
                    border: `1px solid ${isActive ? color : 'var(--border)'}`,
                    background: isActive ? `${color}18` : 'transparent',
                    color: isActive ? color : 'var(--muted)',
                  }}>
                    {cat === 'all' ? t('news.all') : getCategoryLabel(cat, t)}
                    <span style={{ marginLeft: 5, fontSize: 10 }}>
                      {cat === 'all' ? articles.length : articles.filter(n => categoryMatches(n.category, cat)).length}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* News grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 13 }}>
              {t('news.noResults', { query: search })}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: '1.5rem' }}>
                {filtered.slice(0, visibleCount).map(n => (
                  <NewsCard key={n._id} item={n} />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => setVisibleCount(v => v + 6)} style={{
                    padding: '10px 28px',
                    background: 'var(--gradient-brand)',
                    color: 'var(--color-on-brand)', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {t('news.loadMore', { count: filtered.length - visibleCount })}
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </section>
    </>
  )
}