const SOCIALS = [
  {
    name: 'Telegram',
    username: '@kiu_uz',
    url: 'https://t.me/kiu_uz',
    color: '#0088cc',
    gradient: 'linear-gradient(135deg, #0088cc, #0055aa)',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>,
    desc: 'Rasmiy Telegram kanal',
  },
  {
    name: 'Instagram',
    username: '@kiu_university_uz',
    url: 'https://instagram.com/kiu_university_uz',
    color: '#e1306c',
    gradient: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
    desc: 'Rasmiy Instagram sahifasi',
  },
  {
    name: 'YouTube',
    username: '@kiu_university_uz',
    url: 'https://youtube.com/@kiu_uz',
    color: '#ff0000',
    gradient: 'linear-gradient(135deg, #ff0000, #cc0000)',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    desc: 'Rasmiy YouTube kanali',
  },
  {
    name: 'Facebook',
    username: 'KIU Uzbekistan',
    url: 'https://facebook.com/kiuuzofficial',
    color: '#1877f2',
    gradient: 'linear-gradient(135deg, #1877f2, #0d5dbf)',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    desc: 'Rasmiy Facebook sahifasi',
  },
]

export default function QRCode() {
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>QR Kodlar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU rasmiy ijtimoiy tarmoqlari — telefon kamerasi bilan skanerlang</p>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 10 }}>
            {SOCIALS.map((s, i) => (
              <div key={i} className="card reveal" style={{ minWidth: 220, flex: '0 0 220px', textAlign: 'center', padding: '1.5rem', overflow: 'hidden', position: 'relative' }}>
                {/* Top gradient strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.gradient }} />

                {/* Icon */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff' }}>
                  {s.icon}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2, fontFamily: 'var(--font-body)' }}>{s.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1.25rem' }}>{s.desc}</p>

                {/* QR Code */}
                <div style={{ width: 160, height: 160, borderRadius: 12, overflow: 'hidden', margin: '0 auto 1.25rem', border: `2px solid ${s.color}30`, padding: 8, background: '#fff' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(s.url)}&color=${s.color.replace('#','')}&bgcolor=ffffff&qzone=1`}
                    alt={`${s.name} QR`}
                    style={{ width: '100%', height: '100%', borderRadius: 6 }}
                  />
                </div>

                {/* Username */}
                <div style={{ fontSize: 12, fontWeight: 600, color: s.color, marginBottom: '1rem', background: `${s.color}12`, padding: '4px 12px', borderRadius: 20, display: 'inline-block' }}>
                  {s.username}
                </div>

                {/* Button */}
                <a href={s.url} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: s.gradient, color: '#fff', fontSize: 12, fontWeight: 600, padding: '9px 18px', borderRadius: 9, textDecoration: 'none', transition: 'opacity .2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  {s.icon}
                  {s.name} ga o'tish
                </a>
              </div>
            ))}
          </div>

          {/* Info banner */}
          <div className="reveal" style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                <path d="M14 14h3v3"/><path d="M17 17h4"/><path d="M14 17v4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>Qanday foydalanish kerak?</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
                Telefon kamerangizni QR kodga yo'naltiring → Avtomatik havola ochiladi → Obuna bo'ling va yangiliklar olish boshlang!
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}