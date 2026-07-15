import { AWARDS } from '../data/achievementsData'

export default function Achievements() {
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Yutuqlar va mukofotlar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU ning erishgan yutuqlari</p>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {AWARDS.map((a, i) => (
              <div key={a.id} className={`card reveal reveal-delay-${(i % 4) + 1}`} style={{ textAlign: 'center' }}>
                <div className="achieve-icon" style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#7c3aed' }}>
                  {a.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>{a.year}</span>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>{a.title}</h3>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{a.org}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}