export default function Hemis() {
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Elektron universitet</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>HEMIS axborot tizimiga kirish</p>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="grid-2">
            <div className="card reveal" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div className="achieve-icon" style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#7c3aed' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '.5rem' }}>Talabalar uchun</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>Dars jadvali, baholar, to'lov ma'lumotlari va boshqa xizmatlar</p>
              <a href="https://student.kiu.uz/dashboard/login" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%', padding: '12px' }}>
                HEMIS Student
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>

            <div className="card reveal reveal-delay-1" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div className="achieve-icon" style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#7c3aed' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '.5rem' }}>O'qituvchilar uchun</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>Dars jadvali, baholar kiritish, hisobotlar va boshqa xizmatlar</p>
              <a href="https://hemis.kiu.uz/dashboard/login" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%', padding: '12px' }}>
                HEMIS OTM
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>

          <div className="card reveal" style={{ marginTop: '1.5rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="achieve-icon" style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>Yordam kerakmi?</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>HEMIS tizimiga kirish bo'yicha muammolar uchun: +998 55 500 99 44 yoki @kiu_uz</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}