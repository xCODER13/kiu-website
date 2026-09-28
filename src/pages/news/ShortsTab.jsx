import { FALLBACK_SHORTS } from './data'

// "SHORTS TAB" bo'limi — News.jsx'dan o'zgarishsiz ko'chirilgan.
export default function ShortsTab({ shorts }) {
  return (
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
  )
}