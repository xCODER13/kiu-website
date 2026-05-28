import { useState, useEffect } from 'react'
import TelegramPanel from '../components/TelegramPanel'

const CATEGORIES = {
  all:        { uz: 'Barchasi',   color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  science:    { uz: 'Ilm-fan',    color: '#2563eb', bg: 'rgba(37,99,235,0.1)'   },
  sport:      { uz: 'Sport',      color: '#059669', bg: 'rgba(5,150,105,0.1)'   },
  culture:    { uz: 'Madaniyat',  color: '#d97706', bg: 'rgba(217,119,6,0.1)'   },
  admission:  { uz: 'Qabul',      color: '#7c3aed', bg: 'rgba(124,58,237,0.1)'  },
  intl:       { uz: 'Xalqaro',    color: '#0088cc', bg: 'rgba(0,136,204,0.1)'   },
  achievement:{ uz: 'Yutuq',      color: '#db2777', bg: 'rgba(219,39,119,0.1)'  },
}

const FALLBACK_NEWS = [
  {
    _id: 1, createdAt: '2026-03-18',
    title: "Professor-o'qituvchilar Malayziya universitetida stajirovkada",
    content: "KIU ning 5 nafar professor-o'qituvchisi INTI International University da malaka oshirish stajirovkasini muvaffaqiyatli yakunladi.",
    category: 'intl',
    image: null,
  },
  {
    _id: 2, createdAt: '2026-03-15',
    title: "'Rektor kubogi' uchun 'Zakovat' intellektual o'yini bo'lib o'tdi",
    content: "Universitetimizda an'anaviy 'Zakovat' intellektual o'yini o'tkazildi. Musobaqa 12 ta jamoa ishtirokida bo'lib o'tdi.",
    category: 'culture',
    image: null,
  },
  {
    _id: 3, createdAt: '2026-03-13',
    title: "'Millatim faxri' jamoasi hududiy bosqichda 1-o'rinni egalladi",
    content: "KIU talabalaridan tashkil topgan 'Millatim faxri' jamoasi viloyat bosqichida birinchi o'rinni qo'lga kiritdi.",
    category: 'achievement',
    image: null,
  },
  {
    _id: 4, createdAt: '2026-03-10',
    title: "Mehr va e'tibor — eng katta qadriyat",
    content: "Universitetimizda 'Mehr va e'tibor kuni' tadbirida talabalar va o'qituvchilar birgalikda qatnashdi.",
    category: 'culture',
    image: null,
  },
  {
    _id: 5, createdAt: '2026-03-08',
    title: "Navro'z sayli — milliy qadriyatlar va quvonch uyg'unligi",
    content: "KIU da Navro'z milliy bayrami keng nishonlandi. Talabalar milliy kiyimlarda kelishib, an'anaviy o'yinlarda qatnashdi.",
    category: 'culture',
    image: null,
  },
  {
    _id: 6, createdAt: '2026-02-28',
    title: "KIU talabasi dasturlash olimpiadasida g'olib bo'ldi",
    content: "Dasturiy injiniring yo'nalishi talabasi respublika dasturlash olimpiadasida 2-o'rinni qo'lga kiritdi.",
    category: 'achievement',
    image: null,
  },
  {
    _id: 7, createdAt: '2026-02-20',
    title: "2026-yil qabul jarayoni haqida ma'lumot",
    content: "Qarshi Xalqaro Universiteti 2026-2027 o'quv yili uchun qabul 1-iyuldan boshlanadi. Barcha yo'nalishlarda o'rinlar mavjud.",
    category: 'admission',
    image: null,
  },
  {
    _id: 8, createdAt: '2026-02-15',
    title: "Futbol bo'yicha universitetlararo musobaqa yakunlandi",
    content: "KIU futbol jamoasi viloyat universitetlari o'rtasidagi musobaqada ikkinchi o'rinni egalladi.",
    category: 'sport',
    image: null,
  },
  {
    _id: 9, createdAt: '2026-02-10',
    title: "INTI University bilan yangi hamkorlik dasturi imzolandi",
    content: "KIU va Malayziyaning INTI International University o'rtasida talabalar almashinuvi dasturi kengaytirildi.",
    category: 'intl',
    image: null,
  },
]

const FALLBACK_SHORTS = [
  { id: 1, videoId: '_yP1fg90bbI', title: "Yashil makon — kelajak uchun qadam!" },
  { id: 2, videoId: 'EDGxUFxpAXQ', title: "Rektor kubogi doirasida muhim bosqich!" },
  { id: 3, videoId: 't9e1ByXgwgA', title: '"Rahbar va yoshlar" mavzusida ochiq muloqot' },
  { id: 4, videoId: 'rkIqa6NmaWE', title: "Kelajagingiz uchun poydevor bo'ladigan master-klass!" },
  { id: 5, videoId: '9JHHXep0k3c', title: "KIU hafta ichida.." },
  { id: 6, videoId: '_ERFZ7KUD_k', title: "5 Reason to choose KIU" },
]

// Category label
function CatBadge({ cat }) {
  const c = CATEGORIES[cat] || CATEGORIES.all
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color: c.color, background: c.bg, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.02em' }}>
      {c.uz}
    </span>
  )
}

// Placeholder image with gradient + initials
function NewsPlaceholder({ title, category }) {
  const colors = {
    science: ['#1d4ed8','#3b82f6'], sport: ['#065f46','#10b981'],
    culture: ['#92400e','#f59e0b'], admission: ['#4c1d95','#8b5cf6'],
    intl: ['#0c4a6e','#0ea5e9'], achievement: ['#831843','#ec4899'],
    all: ['#1e1b4b','#6366f1'],
  }
  const [c1, c2] = colors[category] || colors.all
  const letters = title?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'KI'
  return (
    <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${c1}, ${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{letters}</span>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>KIU</span>
    </div>
  )
}

// Video card with lazy iframe
function VideoCard({ video }) {
  const [active, setActive] = useState(false)
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000', cursor: 'pointer' }}
        onClick={() => setActive(true)}>
        {active ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
            title={video.title}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; encrypted-media" allowFullScreen
          />
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
              alt={video.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{ padding: '0.75rem 1rem' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.45, marginBottom: 6 }}>{video.title}</p>
        <a href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noreferrer"
          style={{ fontSize: 11, color: '#ff0000', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          YouTube da ko'rish
        </a>
      </div>
    </div>
  )
}

// Hero banner gradient by category
function heroGradient(cat) {
  const g = {
    science: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
    sport:   'linear-gradient(135deg, #064e3b, #065f46)',
    culture: 'linear-gradient(135deg, #78350f, #92400e)',
    admission:'linear-gradient(135deg, #2e1065, #4c1d95)',
    intl:    'linear-gradient(135deg, #0c4a6e, #0369a1)',
    achievement:'linear-gradient(135deg, #500724, #831843)',
  }
  return g[cat] || 'linear-gradient(135deg, #1a1a2e, #2d1b69)'
}

function HeroBanner({ item, onRead }) {
  const cat = CATEGORIES[item.category] || CATEGORIES.all
  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: '2rem', minHeight: 340, cursor: 'pointer' }}
      onClick={onRead}>
      {/* Background */}
      {item.image
        ? <>
            <img src={item.image} alt={item.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)' }} />
          </>
        : <div style={{ position: 'absolute', inset: 0, background: heroGradient(item.category) }}>
            {/* Decorative dots */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -100, right: -80 }} />
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -60, left: -40 }} />
          </div>
      }

      {/* "SO'NGI YANGILIK" label */}
      <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 12px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>So'nggi yangilik</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: cat.color, background: cat.bg, border: `1px solid ${cat.color}40`, padding: '4px 10px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
          {cat.uz}
        </span>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '5rem 2rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 340 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>
          {new Date(item.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.35, marginBottom: 12, maxWidth: 700, fontFamily: 'var(--font-body)' }}>
          {item.title}
        </h2>
        {item.content && (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 600, marginBottom: 20 }}>
            {item.content.slice(0, 160)}{item.content.length > 160 ? '...' : ''}
          </p>
        )}
        <button style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
          Batafsil o'qish
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function News() {
  const [activeTab, setActiveTab] = useState('news')
  const [news, setNews] = useState(FALLBACK_NEWS)
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(6)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/news`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setNews(data) })
      .catch(() => {})
  }, [])

  useEffect(() => { setVisible(6) }, [activeCat, search, activeTab])

  // Featured = first news OR first with featured:true
  const featured = news.find(n => n.featured) || news[0]

  const filtered = news.filter(n => {
    if (n._id === featured?._id) return false   // featured dan tashqari
    const matchCat = activeCat === 'all' || n.category === activeCat
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const shown = filtered.slice(0, visible)

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Yangiliklar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU hayotidan so'nggi xabarlar</p>
      </section>

      <section className="section">
        <div className="container">

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            {[{ key: 'news', label: 'Yangiliklar' }, { key: 'video', label: 'Video' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab.key ? '#7c3aed' : 'var(--muted)', borderBottom: activeTab === tab.key ? '2px solid #7c3aed' : '2px solid transparent', marginBottom: -1, fontFamily: 'var(--font-body)', transition: 'all .2s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* NEWS TAB */}
          {activeTab === 'news' && (
            <>
              {/* Hero Banner */}
              {featured && (
                <HeroBanner
                  item={featured}
                  onRead={() => setSelected(selected?._id === featured._id ? null : featured)}
                />
              )}
              {selected?._id === featured?._id && (
                <div className="card" style={{ marginBottom: '1.5rem', borderTop: '3px solid #7c3aed' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>{featured.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75 }}>{featured.content}</p>
                  <button onClick={() => setSelected(null)} style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Yopish</button>
                </div>
              )}
              {/* Filters + Search */}
              <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                  {Object.entries(CATEGORIES).map(([key, val]) => (
                    <button key={key} onClick={() => setActiveCat(key)}
                      style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, border: `1px solid ${activeCat === key ? val.color : 'var(--border)'}`, background: activeCat === key ? val.bg : 'none', color: activeCat === key ? val.color : 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: activeCat === key ? 600 : 400, transition: 'all .15s' }}>
                      {val.uz}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Qidirish..."
                    style={{ paddingLeft: 30, paddingRight: 10, height: 34, border: '1px solid var(--border)', borderRadius: 20, fontSize: 12, background: 'var(--bg)', color: 'var(--text)', outline: 'none', width: 160, fontFamily: 'var(--font-body)' }} />
                </div>
              </div>

              {/* Cards grid */}
              {shown.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                  <p style={{ fontSize: 14 }}>Natija topilmadi</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: '1.5rem' }}>
                  {shown.map((n, i) => (
                    <div key={n._id}
                      className={`card reveal reveal-delay-${(i % 4) + 1}`}
                      onClick={() => setSelected(selected?._id === n._id ? null : n)}
                      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>

                      {/* Image */}
                      <div style={{ height: 160, background: 'var(--border)', overflow: 'hidden', position: 'relative' }}>
                        {n.image
                          ? <img src={n.image} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                          : <NewsPlaceholder title={n.title} category={n.category} />
                        }
                        {/* Category badge on image */}
                        <div style={{ position: 'absolute', top: 10, left: 10 }}>
                          <CatBadge cat={n.category} />
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '1rem' }}>
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                          {new Date(n.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.45, marginBottom: 6, fontFamily: 'var(--font-body)' }}>
                          {n.title}
                        </h3>
                        {n.content && (
                          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                            {selected?._id === n._id ? n.content : `${n.content?.slice(0, 90)}${n.content?.length > 90 ? '...' : ''}`}
                          </p>
                        )}
                        <div style={{ marginTop: 10, fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
                          {selected?._id === n._id ? '↑ Yopish' : 'Batafsil o\'qish →'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load more */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                {visible < filtered.length && (
                  <button onClick={() => setVisible(v => v + 6)} className="btn btn-primary">
                    Yana ko'rish ({filtered.length - visible} ta qoldi)
                  </button>
                )}
                <a href="https://t.me/kiu_uz" target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: '#0088cc', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
                  Barcha yangiliklar @kiu_uz
                </a>
              </div>

              {/* Telegram panel */}
              <div style={{ marginTop: '2rem' }}>
                <TelegramPanel />
              </div>
            </>
          )}

          {/* VIDEO TAB */}
          {activeTab === 'video' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,0,0,0.05)', borderRadius: 12, border: '1px solid rgba(255,0,0,0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>KIU YouTube kanali</div>
                  <a href="https://youtube.com/@kiu_uz" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#ff0000' }}>@kiu_uz — Kanalga o'tish →</a>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {FALLBACK_SHORTS.map(s => <VideoCard key={s.id} video={s} />)}
              </div>
            </>
          )}
        </div>
      </section>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}