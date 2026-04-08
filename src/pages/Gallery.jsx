import { useState, useEffect, useMemo } from 'react'

const STATIC_PHOTOS = [
  { id: 's2', title: "2-kampus", desc: "2-kampus binosi", img: '/gallery/2-kampus.png', color: '#4f46e5' },
]

const COLORS = ['#7c3aed', '#4f46e5', '#0088cc', '#059669', '#d97706', '#db2777']

export default function Gallery() {
  const [adminPhotos, setAdminPhotos] = useState([])
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kiu_gallery') || '[]')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminPhotos(saved)
    } catch { /* ignore */ }
  }, [])

  const photos = useMemo(() => [
    ...adminPhotos.map(p => ({ ...p, img: p.src })),
    ...STATIC_PHOTOS,
  ], [adminPhotos])

  useEffect(() => {
    if (!lightbox) return
    const onKey = e => {
      const all = photos
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(lb => { const i = (lb.index + 1) % all.length; return { ...all[i], index: i } })
      if (e.key === 'ArrowLeft')  setLightbox(lb => { const i = (lb.index - 1 + all.length) % all.length; return { ...all[i], index: i } })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, photos])

  function prev() {
    setLightbox(lb => {
      const all = photos
      const i = (lb.index - 1 + all.length) % all.length
      return { ...all[i], index: i }
    })
  }

  function next() {
    setLightbox(lb => {
      const all = photos
      const i = (lb.index + 1) % all.length
      return { ...all[i], index: i }
    })
  }

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Fotogalerеya</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU hayotidan lavhalar</p>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {photos.map((p, i) => {
              const color = p.color || COLORS[i % COLORS.length]
              return (
                <div
                  key={p.id}
                  className={`card reveal reveal-delay-${(i % 4) + 1}`}
                  style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setLightbox({ ...p, index: i })}
                >
                  <div style={{ height: 160, background: `linear-gradient(135deg, ${color}22, ${color}44)`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.img
                      ? <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
                      : <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    }
                    <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(255,255,255,0.9)', borderRadius: 6, padding: '3px 8px', fontSize: 10, color, fontWeight: 600 }}>KIU</div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3, fontFamily: 'var(--font-body)' }}>{p.title}</h3>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>{p.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="reveal" style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', border: '1px dashed var(--border)', borderRadius: 14 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Haqiqiy rasmlar tez orada qo'shiladi</p>
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          {/* Close */}
          <button onClick={() => setLightbox(null)} style={{ position: 'fixed', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
          {/* Prev */}
          <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 26, lineHeight: 1 }}>‹</button>
          {/* Next */}
          <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 26, lineHeight: 1 }}>›</button>

          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: '90vw', maxHeight: '90vh' }}>
            {lightbox.img
              ? <img src={lightbox.img} alt={lightbox.title} style={{ maxWidth: '85vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }} />
              : <div style={{ width: 360, height: 260, background: '#1a1a2e', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>Rasm mavjud emas</div>
            }
            <div style={{ color: '#fff', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{lightbox.title}</div>
              {lightbox.desc && <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>{lightbox.desc}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
