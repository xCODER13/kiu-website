import TelegramPanel from '../components/TelegramPanel'
import config from '../config'

const items = [
  { title: '1-kampus manzili', text: config.contact.address1, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
  { title: '2-kampus manzili', text: config.contact.address2, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
  { title: 'Telefon', text: config.contact.phone, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.58 4.88C1.58 3.85 2.35 3 3.39 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18v-.08z"/></svg> },
  { title: 'Email', text: config.contact.email, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { title: 'Ish vaqti', text: config.contact.workHours, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
]

export default function Contact() {
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Bog'lanish</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU bilan aloqaga chiqing</p>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item, i) => (
                <div key={item.title} className={`card reveal reveal-delay-${i + 1}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="cc-icon" style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal reveal-delay-2">
              <TelegramPanel />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}