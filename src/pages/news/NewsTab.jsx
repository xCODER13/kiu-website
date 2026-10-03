import { useTranslation } from 'react-i18next'
import TelegramPanel from '../../components/TelegramPanel'
import { getCategoryToken, getCategoryLabel, categoryMatches } from '../../utils/newsCategories'
import FeaturedCarousel from './FeaturedCarousel'
import NewsCard from './NewsCard'
import config from '../../config'

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
      <div className="page-loading">
        <div className="spinner" />
        {t('common.loading')}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <p className="empty-state-title">{t('news.empty')}</p>
        <p className="empty-state-hint">{t('news.emptyHint')}</p>
      </div>
    )
  }

  return (
    <section className="page-body">
      <div className="container news-flow">
        {/* FEATURED CAROUSEL — rounded corners */}
        {featured.length > 0 && <FeaturedCarousel items={featured} />}

        {/* TELEGRAM PANEL + barcha yangiliklar havolasi */}
        <div className="news-telegram-box">
          <TelegramPanel />
        </div>
        <a href={config.telegram.url} target="_blank" rel="noopener noreferrer" className="news-all-link">
          {t('news.allNews')}
        </a>

        {error && (
          <div className="news-offline">
            {t('news.offline')}
          </div>
        )}

        {/* Qidiruv + toifa filtri */}
        <div className="news-filters">
          <div className="news-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="news-search-icon" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setVisibleCount(6) }}
              placeholder={t('news.searchPh')}
              className="input input--form news-search-input"
            />
          </div>

          {categories.length > 1 && (
            <div className="news-cats">
              {categories.map(cat => {
                const isActive = activeCategory === cat
                return (
                  // Toifa rangi ma'lumotdan keladi → faqat `--cat` o'zgaruvchisi (inline); faol holat `data-active` (CSS)
                  <button key={cat} type="button" onClick={() => { setActiveCategory(cat); setVisibleCount(6) }}
                    className="news-cat" data-active={isActive} data-all={cat === 'all'}
                    style={{ '--cat': cat === 'all' ? 'var(--color-brand)' : getCategoryToken(cat) }}>
                    <span className="news-cat-dot" aria-hidden="true" />
                    {cat === 'all' ? t('news.all') : getCategoryLabel(cat, t)}
                    <span className="news-cat-count">
                      {cat === 'all' ? articles.length : articles.filter(n => categoryMatches(n.category, cat)).length}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* News grid */}
        {filtered.length === 0 ? (
          <div className="news-noresults">
            {t('news.noResults', { query: search })}
          </div>
        ) : (
          <>
            <div className="news-grid">
              {filtered.slice(0, visibleCount).map(n => (
                <NewsCard key={n._id} item={n} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="news-more">
                <button type="button" onClick={() => setVisibleCount(v => v + 6)} className="btn btn-secondary news-load-more">
                  {t('news.loadMore', { count: filtered.length - visibleCount })}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
