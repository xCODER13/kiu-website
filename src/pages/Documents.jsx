import { DOCS } from '../data/documentsData'

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
  