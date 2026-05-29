import { useState, useEffect, useRef, useCallback } from 'react'
import TelegramPanel from '../components/TelegramPanel'
import useApi from '../hooks/useApi'

const API = import.meta.env.VITE_API_URL

const CAT_LABELS = {
  umumiy: 'Umumiy', talim: "Ta'lim", tadbirlar: 'Tadbirlar',
  sport: 'Sport', elon: "E'lonlar", xalqaro: 'Xalqaro', fan: 'Fan',
}

const FALLBACK_SHORTS = [
  { id: 1, videoId: '_yP1fg90bbI', title: "Yashil makon — kelajak uchun qadam!" },
  { id: 2, videoId: 'EDGxUFxpAXQ', title: "Rektor kubogi doirasida yana bir muhim bosqich!" },
  { id: 3, videoId: 't9e1ByXgwgA', title: "Universitetda ochiq muloqot tashkil etildi" },
  { id: 4, videoId: 'rkIqa6NmaWE', title: "Kelajagingiz uchun poydevor bo'ladigan master-klass!" },
  { id: 5, videoId: '9JHHXep0k3c', title: "KIU hafta ichida.." },
  { id: 6, videoId: '_ERFZ7KUD_k', title: "5 Reason to choose KIU" },
]

// ── FEATURED CAROUSEL ──
function FeaturedCarousel({ items }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef(null)

  const next = useCallback(() => setIdx(i => (i + 1) % items.length), [items.length])
  const prev = () => setIdx(i => (i - 1 + items.length) % items.length)

  useEffect(() => {
    if (paused || items.length < 2) return
    timer.current = setInterval(next, 4000)
    return () => clearInterval(timer.current)
  }, [paused, next, items.length])

  if (!items.length) return null
  const item = items[idx]

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: '2rem', background: '#1a1a2e', aspectRatio: '16/7', minHeight: 220 }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

      {/* Background image */}
      <div key={idx} style={{ position: 'absolute', inset: 0, backgroundImage: item.image ? `url(${item.image})` : 'linear-gradient(135deg,#7c3aed,#4f46e5)', backgroundSize: 'cover', backgroundPosition: 'center', animation: 'fadeIn .5s ease' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.3) 60%, transparent 100%)' }} />

      {/* Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
        {item.category && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#7c3aed', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, display: 'inline-block' }}>
            {CAT_LABELS[item.category] || item.category}
          </span>
        )}
        <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 8, fontFamily: 'var(--font-body)' }}>{item.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(255,255,255,.7)' }}>
          <span>{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</span>
          {item.views > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {item.views}
            </span>
          )}
        </div>
      </div>

      {/* Prev / Next */}
      {items.length > 1 && (<>
        <button onClick={prev} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={next} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 12, right: 16, display: 'flex', gap: 5 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 10, background: i === idx ? '#fff' : 'rgba(255,255,255,.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .3s' }} />
          ))}
        </div>
      </>)}
    </div>
  )
}

// ── NEWS CARD ──
function NewsCard({ item, onView }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      onClick={() => onView(item._id)}>
      {item.image
        ? <img src={item.image} alt={item.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
        : <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg,rgba(124,58,237,.15),rgba(79,70,229,.15))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,.4)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
      }
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          {item.category && (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 8px', borderRadius: 20 }}>
              {CAT_LABELS[item.category] || item.category}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</span>
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5, marginBottom: 6, fontFamily: 'var(--font-body)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
        {item.content && <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
          {item.views > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {item.views}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN ──
export default function News() {
  const { data: news, loading, error } = useApi(`${API}/api/news`, [])
  const [activeTab, setActiveTab]         = useState('news')
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch]               = useState('')
  const [visibleCount, setVisibleCount]   = useState(6)

  const articles = news.filter(n => !n.videoId)
  const shorts   = news.filter(n => n.videoId)

  const featured = articles.filter(n => n.image).slice(0, 5)
  const categories = ['all', ...new Set(articles.map(n => n.category).filter(Boolean))]

  const filtered = articles.filter(n => {
    const matchCat    = activeCategory === 'all' || n.category === activeCategory
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  async function handleView(id) {
    try { await fetch(`${API}/api/news/${id}/view`, { method: 'PUT' }) } catch (e) { console.log('View error:', e.message) }
  }

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Yangiliklar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU hayotidan so'nggi xabarlar</p>
      </section>

      <section className="section">
        <div className="container">
          {error && (
            <div style={{ textAlign: 'center', padding: '0.75rem', marginBottom: '1rem', background: 'rgba(124,58,237,.06)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', border: '1px solid var(--border)' }}>
              Serverga ulanib bo'lmadi
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            {[{ key: 'news', label: 'Yangiliklar' }, { key: 'shorts', label: 'YouTube Shorts' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab.key ? '#7c3aed' : 'var(--muted)', borderBottom: activeTab === tab.key ? '2px solid #7c3aed' : '2px solid transparent', marginBottom: -1, fontFamily: 'var(--font-body)', transition: 'all .2s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* NEWS TAB */}
          {activeTab === 'news' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                Yuklanmoqda...
              </div>
            ) : articles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: .3, marginBottom: 12 }}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <p style={{ fontSize: 14 }}>Hozircha yangiliklar yo'q</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Admin panel orqali yangilik qo'shing</p>
              </div>
            ) : (
              <div className="grid-2">
                <div>
                  {/* Featured carousel */}
                  {featured.length > 0 && <FeaturedCarousel items={featured} />}

                  {/* Search */}
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input value={search} onChange={e => { setSearch(e.target.value); setVisibleCount(6) }}
                      placeholder="Yangiliklar ichida qidiring..."
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} />
                  </div>

                  {/* Category filter */}
                  {categories.length > 1 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      {categories.map(cat => (
                        <button key={cat} onClick={() => { setActiveCategory(cat); setVisibleCount(6) }}
                          style={{ fontSize: 12, padding: '5px 14px', borderRadius: 20, border: '1px solid', cursor: 'pointer', transition: 'all .2s', borderColor: activeCategory === cat ? '#7c3aed' : 'var(--border)', background: activeCategory === cat ? 'rgba(124,58,237,.1)' : 'transparent', color: activeCategory === cat ? '#7c3aed' : 'var(--muted)', fontWeight: activeCategory === cat ? 600 : 400 }}>
                          {cat === 'all' ? 'Hammasi' : CAT_LABELS[cat] || cat}
                          <span style={{ marginLeft: 5, fontSize: 10 }}>
                            {cat === 'all' ? articles.length : articles.filter(n => n.category === cat).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* News grid */}
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: 13 }}>
                      "{search}" bo'yicha hech narsa topilmadi
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: '1.5rem' }}>
                        {filtered.slice(0, visibleCount).map(n => (
                          <NewsCard key={n._id} item={n} onView={handleView} />
                        ))}
                      </div>
                      {visibleCount < filtered.length && (
                        <div style={{ textAlign: 'center' }}>
                          <button onClick={() => setVisibleCount(v => v + 6)}
                            style={{ padding: '10px 28px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                            Ko'proq yuklash ({filtered.length - visibleCount} ta qoldi)
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  <a href="https://t.me/kiu_uz" target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', paddingTop: '1rem', display: 'inline-block' }}>
                    Barcha yangiliklar (@kiu_uz) →
                  </a>
                </div>
                <div><TelegramPanel /></div>
              </div>
            )
          )}

          {/* SHORTS TAB */}
          {activeTab === 'shorts' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,0,0,0.05)', borderRadius: 12, border: '1px solid rgba(255,0,0,0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>KIU YouTube kanali</div>
                  <a href="https://youtube.com/@kiu_uz" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#ff0000' }}>Kanalga o'tish →</a>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {(shorts.length > 0 ? shorts : FALLBACK_SHORTS).map(s => (
                  <div key={s._id || s.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '177.77%', background: '#000', overflow: 'hidden' }}>
                      <iframe src={`https://www.youtube.com/embed/${s.videoId}?rel=0&modestbranding=1`} title={s.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                    </div>
                    <div style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.title}</p>
                      <a href={`https://youtube.com/shorts/${s.videoId}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#ff0000', marginTop: 4, display: 'inline-block' }}>YouTube da ko'rish →</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  )
}