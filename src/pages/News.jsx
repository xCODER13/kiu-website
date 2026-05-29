import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TelegramPanel from '../components/TelegramPanel'
import useApi from '../hooks/useApi'

const API = import.meta.env.VITE_API_URL

const CAT_COLORS = {
  umumiy:    '#d7bb04',
  talim:     '#0ea5e9',
  sport:     '#16a34a',
  madaniyat: '#dc2626',
  xalqaro:   '#d97706',
  fan:       '#0891b2',
}

const CAT_LABELS = {
  umumiy: 'Umumiy', talim: "Ta'lim", sport: 'Sport',
  madaniyat: 'Madaniyat', xalqaro: 'Xalqaro', fan: 'Fan',
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
  const navigate = useNavigate()

  const next = useCallback(() => setIdx(i => (i + 1) % items.length), [items.length])
  const prev = () => setIdx(i => (i - 1 + items.length) % items.length)

  useEffect(() => {
    if (paused || items.length < 2) return
    timer.current = setInterval(next, 4000)
    return () => clearInterval(timer.current)
  }, [paused, next, items.length])

  if (!items.length) return null
  const item = items[idx]
  const catColor = CAT_COLORS[item.category] || '#7c3aed'

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 480,
        overflow: 'hidden',
        background: '#13102b',
        borderRadius: 20,
        margin: '1.5rem 0',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div
        key={idx}
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: item.image
            ? `url(${item.image})`
            : `linear-gradient(135deg, #1e1545 0%, #13102b 60%, #0d0b1e 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'carouselFadeIn .6s ease',
          transition: 'background .4s ease',
        }}
      />

      {/* Overlay gradients */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.4) 50%, rgba(0,0,0,.15) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${catColor}40, transparent 65%)` }} />

      {/* Slide counter top-right */}
      <div style={{
        position: 'absolute', top: 24, right: 24,
        fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)',
        letterSpacing: '.1em', fontFamily: 'var(--font-body)',
      }}>
        {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
      </div>

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '2.5rem 3rem',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Category badge */}
        {item.category && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
              color: '#fff', textTransform: 'uppercase',
              background: catColor,
              padding: '4px 12px', borderRadius: 20,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,.7)', display: 'inline-block' }} />
              {CAT_LABELS[item.category] || item.category}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-body)' }}>
              {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 style={{
          fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
          fontWeight: 800, color: '#fff', lineHeight: 1.3,
          fontFamily: 'var(--font-body)', maxWidth: 700,
          textShadow: '0 2px 20px rgba(0,0,0,.5)',
        }}>
          {item.title}
        </h2>

        {/* Excerpt */}
        {item.content && (
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,.7)',
            lineHeight: 1.6, maxWidth: 560,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {item.content}
          </p>
        )}

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {item.views}
          </span>
          <button
            onClick={() => navigate(`/news/${item._id}`)}
            style={{
              padding: '7px 18px',
              background: 'rgba(255,255,255,.15)',
              border: '1px solid rgba(255,255,255,.3)',
              borderRadius: 8, color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              backdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-body)',
              transition: 'background .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
          >
            Batafsil →
          </button>
        </div>
      </div>

      {/* Prev / Next buttons */}
      {items.length > 1 && (<>
        <button onClick={prev} style={{
          position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
          width: 42, height: 42, borderRadius: '50%',
          background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', transition: 'background .2s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={next} style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          width: 42, height: 42, borderRadius: '50%',
          background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', transition: 'background .2s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 24, right: 28, display: 'flex', gap: 6 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 24 : 6, height: 6, borderRadius: 10, padding: 0,
              background: i === idx ? '#fff' : 'rgba(255,255,255,.3)',
              border: 'none', cursor: 'pointer', transition: 'all .3s ease',
            }} />
          ))}
        </div>
      </>)}
    </div>
  )
}

// ── TELEGRAM BANNER ──
function TelegramBanner() {
  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, #0088cc, #006aa3)',
      padding: '0',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 2rem',
      }}>
        <TelegramPanel bannerMode />
      </div>
    </div>
  )
}

// ── NEWS CARD ──
function NewsCard({ item }) {
  const navigate = useNavigate()
  const catColor = CAT_COLORS[item.category] || '#7c3aed'
  return (
    <div
      className="card"
      style={{ padding: 0, overflow: 'hidden', transition: 'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}
    >
      {item.image
        ? <img src={item.image} alt={item.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
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
              {CAT_LABELS[item.category] || item.category}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</span>
        </div>
        <h3 style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5, marginBottom: 6,
          fontFamily: 'var(--font-body)', display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{item.title}</h3>
        {item.content && (
          <p style={{
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
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              color: '#fff', border: 'none', borderRadius: 7,
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'opacity .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Batafsil →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN ──
export default function News() {
  const { data: news, loading, error } = useApi(`${API}/api/news`, [])
  const [activeTab, setActiveTab]           = useState('news')
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch]                 = useState('')
  const [visibleCount, setVisibleCount]     = useState(6)

  const articles = news.filter(n => !n.videoId)
  const shorts   = news.filter(n => n.videoId)

  const featured   = articles.slice(0, 5)
  const categories = ['all', ...new Set(articles.map(n => n.category).filter(Boolean))]

  const filtered = articles.filter(n => {
    const matchCat    = activeCategory === 'all' || n.category === activeCategory
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="fade-up">
      {/* Hero header */}
      <section style={{
        padding: '3rem 2rem 1rem',
        background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)',
        borderBottom: '1px solid var(--border)', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Yangiliklar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU hayotidan so'nggi xabarlar</p>
      </section>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="container" style={{ display: 'flex', gap: 4 }}>
          {[{ key: 'news', label: `Yangiliklar${articles.length ? ` (${articles.length})` : ''}` }, { key: 'shorts', label: `Video${shorts.length ? ` (${shorts.length})` : ''}` }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              color: activeTab === tab.key ? '#7c3aed' : 'var(--muted)',
              borderBottom: activeTab === tab.key ? '2px solid #7c3aed' : '2px solid transparent',
              marginBottom: -1, fontFamily: 'var(--font-body)', transition: 'all .2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* NEWS TAB */}
      {activeTab === 'news' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--muted)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Yuklanmoqda...
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: .3, marginBottom: 12 }}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <p style={{ fontSize: 14 }}>Hozircha yangiliklar yo'q</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Admin panel orqali yangilik qo'shing</p>
          </div>
        ) : (
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
                style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginTop: '0.75rem', display: 'inline-block' }}>
                Barcha yangiliklar (@kiu_uz) →
              </a>
            </div>

            {/* NEWS GRID SECTION */}
            <section className="section">
              <div className="container">
                {error && (
                  <div style={{
                    textAlign: 'center', padding: '0.75rem', marginBottom: '1rem',
                    background: 'rgba(124,58,237,.06)', borderRadius: 10, fontSize: 13,
                    color: 'var(--muted)', border: '1px solid var(--border)',
                  }}>
                    Serverga ulanib bo'lmadi
                  </div>
                )}

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input value={search} onChange={e => { setSearch(e.target.value); setVisibleCount(6) }}
                    placeholder="Yangiliklar ichida qidiring..."
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
                      const color = CAT_COLORS[cat] || '#7c3aed'
                      const isActive = activeCategory === cat
                      return (
                        <button key={cat} onClick={() => { setActiveCategory(cat); setVisibleCount(6) }} style={{
                          fontSize: 12, padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
                          transition: 'all .2s', fontWeight: isActive ? 600 : 400,
                          border: `1px solid ${isActive ? color : 'var(--border)'}`,
                          background: isActive ? `${color}18` : 'transparent',
                          color: isActive ? color : 'var(--muted)',
                        }}>
                          {cat === 'all' ? 'Barchasi' : CAT_LABELS[cat] || cat}
                          <span style={{ marginLeft: 5, fontSize: 10 }}>
                            {cat === 'all' ? articles.length : articles.filter(n => n.category === cat).length}
                          </span>
                        </button>
                      )
                    })}
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
                        <NewsCard key={n._id} item={n} />
                      ))}
                    </div>
                    {visibleCount < filtered.length && (
                      <div style={{ textAlign: 'center' }}>
                        <button onClick={() => setVisibleCount(v => v + 6)} style={{
                          padding: '10px 28px',
                          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                          color: '#fff', border: 'none', borderRadius: 10,
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}>
                          Ko'proq yuklash ({filtered.length - visibleCount} ta qoldi)
                        </button>
                      </div>
                    )}
                  </>
                )}

              </div>
            </section>
          </>
        )
      )}

      {/* SHORTS TAB */}
      {activeTab === 'shorts' && (
        <section className="section">
          <div className="container">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem',
              padding: '1rem', background: 'rgba(255,0,0,0.05)',
              borderRadius: 12, border: '1px solid rgba(255,0,0,0.1)',
            }}>
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
                    <iframe
                      src={`https://www.youtube.com/embed/${s.videoId}?rel=0&modestbranding=1`}
                      title={s.title}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <div style={{ padding: '0.75rem 1rem' }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.title}</p>
                    <a href={`https://youtube.com/shorts/${s.videoId}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: '#ff0000', marginTop: 4, display: 'inline-block' }}>
                      YouTube da ko'rish →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @keyframes carouselFadeIn { from { opacity: 0; transform: scale(1.02) } to { opacity: 1; transform: scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}