import { useState, useEffect } from 'react'
import TelegramPanel from '../components/TelegramPanel'

const FALLBACK_NEWS = [
  { _id: 1, createdAt: new Date('2026-03-18'), title: "Professor-o'qituvchilar Malayziya universitetida stajirovkada" },
  { _id: 2, createdAt: new Date('2026-03-15'), title: "'Rektor kubogi' uchun 'Zakovat' intellektual o'yini bo'lib o'tdi" },
  { _id: 3, createdAt: new Date('2026-03-13'), title: "'Millatim faxri' jamoasi hududiy bosqichda 1-o'rinni egalladi" },
  { _id: 4, createdAt: new Date('2026-03-10'), title: "Mehr va e'tibor — eng katta qadriyat" },
  { _id: 5, createdAt: new Date('2026-03-08'), title: "Navro'z sayli — milliy qadriyatlar va quvonch uyg'unligi" },
]

const FALLBACK_SHORTS = [
  { id: 1, videoId: '_yP1fg90bbI', title: "Yashil makon — kelajak uchun qadam!" },
  { id: 2, videoId: 'EDGxUFxpAXQ', title: "Rektor kubogi doirasida yana bir muhim bosqich!" },
  { id: 3, videoId: 't9e1ByXgwgA', title: "Universitetda “Rahbar va yoshlar” mavzusida ochiq muloqot tashkil etildi " },
  { id: 4, videoId: 'rkIqa6NmaWE', title: "Kelajagingiz uchun poydevor boʻladigan master-klass!"},
  { id: 5, videoId: '9JHHXep0k3c', title: "KIU hafta ichida.." },
  { id: 6, videoId: '_ERFZ7KUD_k', title: "5 Reason to choose KIU" }
]

export default function News() {
  const [activeTab, setActiveTab] = useState('news')
  const [news, setNews] = useState(FALLBACK_NEWS)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/news')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setNews(data) })
      .catch(() => {})
  }, [])

  const articles = news.filter(n => !n.videoId)
  const shorts = news.filter(n => n.videoId)

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Yangiliklar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU hayotidan so'nggi xabarlar</p>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            {[{ key: 'news', label: 'Yangiliklar' }, { key: 'shorts', label: 'YouTube Shorts' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab.key ? '#7c3aed' : 'var(--muted)', borderBottom: activeTab === tab.key ? '2px solid #7c3aed' : '2px solid transparent', marginBottom: -1, fontFamily: 'var(--font-body)', transition: 'all .2s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'news' && (
            <div className="grid-2">
              <div>
                {articles.map((n) => (
                  <div key={n._id} style={{ padding: '.85rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(n.createdAt).toLocaleDateString('uz-UZ')}</span>
                      {n.category && <span style={{ fontSize: 10, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '1px 6px', borderRadius: 20 }}>{n.category}</span>}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5, color: 'var(--text)', transition: 'color .2s' }}
                      onMouseEnter={e => e.target.style.color = '#7c3aed'}
                      onMouseLeave={e => e.target.style.color = 'var(--text)'}
                    >{n.title}</p>
                    {n.content && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>{n.content?.slice(0, 100)}{n.content?.length > 100 ? '...' : ''}</p>}
                    {n.image && <img src={n.image} alt={n.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} onError={e => e.target.style.display='none'} />}
                  </div>
                ))}
                <a href="https://t.me/kiu_uz" target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', paddingTop: '.75rem', display: 'inline-block' }}>
                  Barcha yangiliklar (@kiu_uz) →
                </a>
              </div>
              <div><TelegramPanel /></div>
            </div>
          )}

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
    </div>
  )
}