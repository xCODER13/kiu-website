import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const PAGE_SIZE = 6

// Yangiliklar sahifasidagi (news/NewsTab.jsx) qidiruv + chip filtr + to'r + «Ko'proq yuklash» — «Talabalar hayoti» tablari uchun umumiy.
// `items` — `{ id, title, desc, group }`; `groups` — `{ key, label, section? }` (chip; `section` -> `data-section` rangi); karta `renderCard(item, index, ro'yxat)` da chiziladi.
// Chiplar soni qidiruvga bog'liq emas (yangiliklardagi kabi). Tab almashganda holat tozalanishi uchun chaqiruvchi `key` beradi.
export default function ItemsBrowser({ items, groups, renderCard }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(i =>
      (group === 'all' || i.group === group) &&
      (!q || i.title.toLowerCase().includes(q) || (i.desc || '').toLowerCase().includes(q)))
  }, [items, group, search])

  const counts = useMemo(() => {
    const map = {}
    items.forEach(i => { map[i.group] = (map[i.group] || 0) + 1 })
    return map
  }, [items])

  const shown = filtered.slice(0, visible)

  return (
    <>
      <div className="news-filters">
        <div className="news-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="news-search-icon" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setVisible(PAGE_SIZE) }}
            placeholder={t('gallery.searchPh')}
            aria-label={t('gallery.searchPh')}
            className="input input--form news-search-input"
          />
        </div>

        {groups.length > 1 && (
          <div className="news-cats">
            {[{ key: 'all', label: t('gallery.all') }, ...groups].map(g => {
              const isAll = g.key === 'all'
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => { setGroup(g.key); setVisible(PAGE_SIZE) }}
                  className={`news-cat${g.section ? '' : ' news-cat--plain'}`}
                  data-section={g.section}
                  data-active={group === g.key}
                  data-all={isAll}
                  aria-pressed={group === g.key}
                >
                  <span className="news-cat-dot" aria-hidden="true" />
                  {g.label}
                  <span className="news-cat-count">{isAll ? items.length : counts[g.key] || 0}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="news-noresults">{t('gallery.noResults', { query: search })}</div>
      ) : (
        <>
          <div className="news-grid">
            {shown.map((item, i) => renderCard(item, i, filtered))}
          </div>
          {visible < filtered.length && (
            <div className="news-more">
              <button type="button" onClick={() => setVisible(v => v + PAGE_SIZE)} className="btn btn-secondary news-load-more">
                {t('gallery.loadMore', { count: filtered.length - visible })}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
