export default function About() {
  return (
    <div className="fade-up">
      <section style={{ padding: '3rem 2rem 1rem', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', marginBottom: '.5rem' }}>Biz haqimizda</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Qarshi Xalqaro Universiteti tarixi va missiyasi</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ marginBottom: '3rem' }}>
            <div className="reveal">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a2e' }}>Universitetimiz haqida</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                Qarshi Xalqaro Universiteti (KIU) 2022-yilda Qashqadaryo viloyati Qarshi shahrida tashkil topgan. O'zbekiston Respublikasidagi Oliy ta'lim markazlaridandir.
              </p>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                Bizning maqsad talabalarga sifatli ta'lim va soft skills berib, ularni imtihonga emas hayotga tayyorlash. Eng muhimi — o'zimizga ravo ko'rgan eng yaxshi narsani o'zgalarga ham ravo ko'ramiz!
              </p>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>
                Universitetimiz zamonaviy o'qitish uslublari, professional o'qituvchilar jamoasi va xalqaro hamkorliklar orqali talabalarni kelajak kasblarga tayyorlaydi.
              </p>
            </div>
            <div className="reveal reveal-delay-1">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { n: '6875', l: 'Talaba', color: '#7c3aed' },
                  { n: '151', l: "O'qituvchi", color: '#4f46e5' },
                  { n: '10', l: "Yo'nalish", color: '#0088cc' },
                  { n: '8', l: 'Mukofot', color: '#059669' },
                  { n: '2', l: 'Mlrd. grant', color: '#d97706' },
                  { n: '16', l: "To'garak", color: '#db2777' },
                ].map(s => (
                  <div key={s.l} style={{ padding: '1.25rem', borderRadius: 12, background: `${s.color}10`, border: `1px solid ${s.color}25`, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.n}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal" style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: 16, padding: '2.5rem', marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1rem' }}>Missiyamiz</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8 }}>
              Talabalarga faqat bilim berish bilan cheklanib qolmasdan, kerakli ko'nikma berib, ularni hayotga tayyorlash. Xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish imkoniyatlarini yaratish.
            </p>
          </div>

          <h2 className="reveal" style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: '#1a1a2e' }}>Bizdagi afzalliklar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
                title: "Grant asosida o'qish", desc: "Rektor va ta'sischilar stipendiyasi"
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
                title: 'Bepul avtobus', desc: 'Talabalar uchun transport xizmati'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
                title: 'Yotoqxona', desc: 'Zamonaviy talabalar yotoqxonasi'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
                title: 'Xorijda amaliyot', desc: '6 oylik xorijiy amaliyot imkoniyati'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: 'Xalqaro hamkorlik', desc: "Chet el universitetlari bilan aloqa"
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                title: 'Soft Skills', desc: "Kasb ko'nikmalari to'garaklari"
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M17 11a4 4 0 1 0-3.995-4.2"/><path d="M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><path d="M17 13a4 4 0 0 1 4 4v4"/></svg>,
                title: 'Creative jamoa', desc: "Ijodkor va faol talabalar hamjamiyati"
              },
            ].map((item, i) => (
              <div key={i} className={`card reveal reveal-delay-${(i % 4) + 1}`} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="achieve-icon" style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#7c3aed' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>{item.title}</h3>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="reveal" style={{ fontSize: '1.4rem', margin: '2.5rem 0 1.5rem', color: '#1a1a2e' }}>Rahbariyat</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { name: "Panjiyev Ulug'bek Rustamovich", role: 'Rektor', info: 'Kimyo fanlari PhD, dotsent', avatar: 'PU', color: '#7c3aed' },
              { name: "Norinov Faxriyor Kurbonovich", role: 'Prorektor',  avatar: 'NF', color: '#08b310' },
              { name: "Raxmanov Uchqun Toshpo'latovich", role: 'Moliyaviy direktor', info: 'Universtitet asoschisi', avatar: 'RU', color: '#0088cc' },
              { name: "Yakubov Axtam Nusratilloyevich", role: 'Qarshi Xalqaro Universtiteti Boshqaruv kengashi raisi', info: 'Toshkent davlat yuridik universitetining Xalqaro munosabatlar va uzluksiz ta’lim bo‘yicha prorektori.', avatar: 'YA', color: '#059669' },
            ].map((p, i) => (
              <div key={i} className={`card reveal reveal-delay-${i + 1}`} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff', fontSize: 18, fontWeight: 700 }}>{p.avatar}</div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{p.name}</h3>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 6 }}>{p.role}</div>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{p.info}</p>
              </div>
            ))}
          </div>

          <h2 className="reveal" style={{ fontSize: '1.4rem', margin: '2.5rem 0 1.5rem', color: '#1a1a2e' }}>KIU Infratuzilmasi</h2>
          <p className="reveal" style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.25rem', maxWidth: 520 }}>
            Raqamli va xavfsiz ta'lim muhiti — eng so'nggi texnologiyalar bilan jihozlangan innovatsion hudud.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
                title: 'Bepul Wi-Fi', desc: "Universitet hududi bo'ylab yuqori tezlikdagi internet"
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
                title: '50+ kompyuter', desc: 'Zamonaviy kompyuter markazida dasturlash va dizayn'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
                title: 'Elektron kutubxona', desc: "Kitoblar va ilmiy maqolalar bazasi — istalgan joydan kirish"
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
                title: '24/7 Videokuzatuv', desc: "Kampusning har bir nuqtasi xavfsizlik kameralari bilan qamrab olingan"
              },
            ].map((item, i) => (
              <div key={i} className={`card reveal reveal-delay-${i + 1}`} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="achieve-icon" style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#7c3aed' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>{item.title}</h3>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}