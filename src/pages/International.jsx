const PARTNERS = [
  { name: 'INTI International University', country: 'Malayziya', code: 'MY', type: 'Akademik almashinuv' },
  { name: 'Turiba University', country: 'Latviya', code: 'LV', type: 'Hamkorlik shartnomasi' },
  { name: 'ICAFAI University', country: 'Hindiston', code: 'IN', type: 'Ilmiy tadqiqot' },
  { name: 'Italia universiteti', country: 'Italiya', code: 'IT', type: "Ta'lim almashinuvi" },
  { name: 'Moscow State University', country: 'Rossiya', code: 'RU', type: 'Hamkorlik' },
  { name: 'Indian University', country: 'Hindiston', code: 'IN', type: 'Amaliyot dasturi' },
]

const OPPORTUNITIES = [
  {
    title: 'Akademik mobillik',
    desc: "Talabalar uchun almashinuv dasturlarida ishtirok etish va xorijiy universitetlarda tahsil olish imkoniyatlari.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
  },
  {
    title: "Ilg'or dasturlar",
    desc: "Qo'shma bakalavriat, magistratura va PhD dasturlarini ishlab chiqish.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  },
  {
    title: 'Ilmiy almashinuv',
    desc: "Professor-o'qituvchilar va tadqiqotchilar uchun akademik almashinuvlarda qatnashish hamda xalqaro nashrlarda o'z hissalarini qo'shish.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
  },
  {
    title: 'Tadqiqot grantlari',
    desc: "Xalqaro grantlar va moliyalashtiriladigan ilmiy loyihalarni amalga oshirish.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  },
  {
    title: 'Innovatsion metodlar',
    desc: "Zamonaviy ta'lim texnologiyalari va innovatsion o'qitish usullarini joriy etish.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
  },
]

export default function International() {
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Xalqaro hamkorlik</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>KIU ning xalqaro sheriklar bilan munosabatlari</p>
      </section>

      <section className="section">
        <div className="container">

          {/* Banner */}
          <div className="reveal" style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: 16, padding: '2.5rem', marginBottom: '2.5rem', textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '.75rem' }}>Xalqarolashtirish strategiyasi</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8, maxWidth: 600, margin: '0 auto 1.5rem' }}>
              KIU dunyoning nufuzli universitetlari bilan hamkorlik o'rnatib, talabalarimizga xalqaro ta'lim va amaliyot imkoniyatlarini taqdim etmoqda.
            </p>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[{ n: '7', l: 'Xalqaro hamkor' }, { n: '5', l: 'Davlatlar' }, { n: '11', l: 'Xalqaro dasturlar' }, { n: '2', l: "Ta'lim formatlari" }].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#c4b5fd' }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <h2 className="reveal" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>Xalqaro hamkorlik imkoniyatlari</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
            {OPPORTUNITIES.map((item, i) => (
              <div key={i} className={`card reveal reveal-delay-${(i % 4) + 1}`}>
                <div className="achieve-icon" style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: '#7c3aed' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Partners */}
          <h2 className="reveal" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>Hamkor universitetlar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
            {PARTNERS.map((p, i) => (
              <div key={i} className={`card reveal reveal-delay-${(i % 4) + 1}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{p.code}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{p.country}</div>
                  <span style={{ fontSize: 11, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 8px', borderRadius: 20 }}>{p.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Academic exchange */}
          <h2 className="reveal" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#1a1a2e' }}>Akademik almashinuv dasturi</h2>
          <div className="grid-2">
            {[
              {
                title: 'Talabalar uchun',
                desc: "Xorijiy universitetlarda 1 semestr yoki 1 yil o'qish imkoniyati. Stipendiya va turar joy bilan ta'minlanadi.",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              },
              {
                title: "O'qituvchilar uchun",
                desc: "Xorijiy universitetlarda ilmiy stajirovka, tajriba almashinuv va konferensiyalarda ishtirok etish.",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              },
            ].map((item, i) => (
              <div key={i} className={`card reveal reveal-delay-${i + 1}`}>
                <div className="achieve-icon" style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: '#7c3aed' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}