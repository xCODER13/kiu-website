import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useApi from '../hooks/useApi'
import { collectCategoryKeys, categoryMatches } from '../utils/newsCategories'
import NewsTab from './news/NewsTab'
import ShortsTab from './news/ShortsTab'
import ContentLangNote from '../i18n/ContentLangNote'

const API = import.meta.env.VITE_API_URL

// ── MAIN ── (endi yupqa orkestrator — UI blok va state, real render
// mantig'i news/NewsTab.jsx va news/ShortsTab.jsx'ga bo'lingan)
export default function News() {
  const { t } = useTranslation()
  const { data: news, loading, error } = useApi(`${API}/api/news`, [])
  const [activeTab, setActiveTab]           = useState('news')
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch]                 = useState('')
  const [visibleCount, setVisibleCount]     = useState(6)

  const articles = news.filter(n => !n.videoId)
  const shorts   = news.filter(n => n.videoId)

  const featured   = articles.slice(0, 5)
  const categories = ['all', ...collectCategoryKeys(articles)]

  const filtered = articles.filter(n => {
    const matchCat    = activeCategory === 'all' || categoryMatches(n.category, activeCategory)
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="fade-up">
      {/* Hero header */}
      <section style={{
        padding: '3rem 2rem 1rem',
        background: 'var(--gradient-hero)',
        borderBottom: '1px solid var(--border)', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-text)', marginBottom: '.5rem' }}>{t('news.title')}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>{t('news.subtitle')}</p>
        <ContentLangNote />
      </section>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="container" style={{ display: 'flex', gap: 4 }}>
          {[{ key: 'news', label: `${t('news.tabs.news')}${articles.length ? ` (${articles.length})` : ''}` }, { key: 'shorts', label: `${t('news.tabs.video')}${shorts.length ? ` (${shorts.length})` : ''}` }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              color: activeTab === tab.key ? 'var(--color-brand)' : 'var(--muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-brand)' : '2px solid transparent',
              marginBottom: -1, fontFamily: 'var(--font-body)', transition: 'all .2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'news' && (
        <NewsTab
          loading={loading} error={error} articles={articles} featured={featured}
          categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          search={search} setSearch={setSearch}
          visibleCount={visibleCount} setVisibleCount={setVisibleCount}
          filtered={filtered}
        />
      )}

      {activeTab === 'shorts' && <ShortsTab shorts={shorts} />}
    </div>
  )
}