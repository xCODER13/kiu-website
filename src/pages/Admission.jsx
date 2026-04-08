import config from '../config'

const STEPS = [
  { n: '1-qadam', title: 'Hujjatlar', desc: 'Pasport, attestat, 3×4 surat', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { n: '2-qadam', title: 'Ariza',     desc: 'Online yoki shaxsan topshirish', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { n: '3-qadam', title: 'Imtihon',   desc: 'DTM natijalari yoki KIU testi', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { n: '4-qadam', title: 'Natija',    desc: "Qabul ro'yxati e'lon qilinadi", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg> },
]

export default function Admission({ onApply }) {
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Qabul — {config.admission.year}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Hujjat topshirish tartibi va shartlar</p>
      </section>
      <section className="section">
        <div className="container">
          <div className="reveal" style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: 16, padding: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '.35rem' }}>Hujjatlar qabul qilinmoqda</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>Muddati: {config.admission.deadline}</p>
            </div>
            <button onClick={onApply} className="btn btn-primary">
              Ariza topshirish
            </button>
          </div>
          <div className="grid-auto">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`card reveal reveal-delay-${i + 1}`}>
                <div className="step-icon" style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: '#7c3aed' }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 9px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>{s.n}</span>
                <h3 style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 3 }}>{s.title}</h3>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}