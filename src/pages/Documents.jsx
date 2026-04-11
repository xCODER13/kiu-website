const DOCS = [
  { 
    title: "Litsenziya 1", 
    desc: "Ta'lim faoliyatini yuritish litsenziyasi", 
    url: '/docs/Litsenziya-KIU-1.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> 
  },
  { 
    title: "Litsenziya 2", 
    desc: "Ta'lim faoliyatini yuritish litsenziyasi", 
    url: '/docs/Litsenziya-KIU-2.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> 
  },
  { 
    title: "Guvohnoma", 
    desc: "Davlat akkreditatsiyasi guvohnomasi", 
    url: '/docs/Guvohnoma.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg> 
  },
  { 
    title: "Jamoa shartnomasi", 
    desc: "KIU Jamoa shartnomasi 2026", 
    url: '/docs/KIU-Jamoa-shartnomasi-2026-2026.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 
  },
  { 
    title: "Ichki mehnat tartibi", 
    desc: "Ichki mehnat tartib qoidalari 2026", 
    url: '/docs/Ichki-mehnat-tartib-qoidalari-2026.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> 
  },
  { 
    title: "Odob-axloq kodeksi", 
    desc: "Universitet odob-axloq kodeksi", 
    url: '/docs/Odob-axloq-kodeksi.pdf', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> 
  },
  
]
export default function Documents() {
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Normativ hujjatlar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Rasmiy hujjatlar va normativ bazalar</p>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {DOCS.map((doc, i) => (
              <a key={i} 
  href={doc.url}
  target="_blank"
  rel="noreferrer"
  style={{ textDecoration: 'none' }}>
                <div className={`card reveal reveal-delay-${(i % 4) + 1}`} style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
                  <div className="doc-icon" style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(124,58,237,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
                    {doc.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{doc.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{doc.desc}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
  