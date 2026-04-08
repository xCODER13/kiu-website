import config from '../config'

export default function Map() {
  const campus1 = "Qarshi+sh+Bahodir+Sherqulov+ko'chasi+7"
  const campus2 = "Qarshi+sh+Mustaqillik+ko'chasi+71"

  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Kampus xaritasi</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU kampuslari joylashuvi</p>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="card reveal" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, fontSize: 16, fontWeight: 700 }}>1</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>1-kampus</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{config.contact.address1}</div>
              </div>
            </div>
            <div className="card reveal reveal-delay-1" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5, #0088cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, fontSize: 16, fontWeight: 700 }}>2</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>2-kampus</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{config.contact.address2}</div>
              </div>
            </div>
          </div>

          <div className="reveal" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            <iframe
              title="1-kampus"
              src={`https://maps.google.com/maps?q=${campus1}&output=embed&z=15`}
              width="100%"
              height="350"
              style={{ border: 'none', display: 'block' }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div className="reveal" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <iframe
              title="2-kampus"
              src={`https://maps.google.com/maps?q=${campus2}&output=embed&z=15`}
              width="100%"
              height="350"
              style={{ border: 'none', display: 'block' }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  )
}