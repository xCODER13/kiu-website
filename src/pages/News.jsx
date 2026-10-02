import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useApi from '../hooks/useApi'
import { collectCategoryKeys, categoryMatches } from '../utils/newsCategories'
import NewsTab from './news/NewsTab'
import ShortsTab from './news/ShortsTab'
import ContentLangNote from '../i18n/ContentLangNote'
import PageHero from '../components/PageHero.jsx'

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
      {/* Hero: ichida pill almashtirgich (Yangiliklar / Video) — 6.11 */}
      <PageHero title={t('news.title')} sub={t('news.subtitle')} note={<ContentLangNote />}>
        <div className="kiu-tab-wrap">
          {[
            { key: 'news', label: t('news.tabs.news'), count: articles.length, icon: <path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2zM19 8h2v10a2 2 0 0 1-2 2M8 8h7M8 12h7M8 16h4" /> },
            { key: 'shorts', label: t('news.tabs.video'), count: shorts.length, icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><polygon points="10 9 15 12 10 15 10 9" /></> },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="kiu-tab-btn"
              data-active={activeTab === tab.key}
              aria-pressed={activeTab === tab.key}
            >
              <span className="kiu-tab-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{tab.icon}</svg>
              </span>
              {tab.label}
              {tab.count > 0 && <span className="kiu-tab-badge">{tab.count}</span>}
            </button>
          ))}
        </div>
      </PageHero>

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