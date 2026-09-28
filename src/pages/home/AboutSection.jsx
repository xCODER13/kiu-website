import { NavLink } from 'react-router-dom'

// "Biz haqimizda" bo'limi — Home.jsx'dan o'zgarishsiz ko'chirilgan
// (matn + kampus rasmi + afzalliklar qatori). Afzalliklar ro'yxati asl
// faylda ham shu joyning o'zida inline massiv sifatida e'lon qilingan edi.
export default function AboutSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
          {/* Chap — matn */}
          <div>
            <div className="reveal section-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,.1)', padding: '5px 14px', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(124,58,237,.2)' }}>
              2022 yildan buyon
            </div>
            <h2 className="reveal reveal-delay-1" style={{ fontSize: '1.6rem', color: '#1a1a2e', marginBottom: '1rem' }}>
              Qarshi Xalqaro Universiteti haqida
            </h2>
            <p className="reveal reveal-delay-2" style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
              Qarshi Xalqaro Universiteti (KIU) 2022-yilda Qashqadaryo viloyati Qarshi shahrida tashkil topgan. O'zbekiston Respublikasidagi zamonaviy oliy ta'lim markazlaridan biri.
            </p>
            <p className="reveal reveal-delay-3" style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Bizning maqsad — talabalarga sifatli ta'lim va soft skills berib, ularni hayotga tayyorlash. Xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish imkoniyatlarini yaratish.
            </p>
            <div className="reveal reveal-delay-4" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <NavLink to="/about">
                <button className="btn btn-primary">Batafsil ma'lumot</button>
              </NavLink>
            </div>
          </div>

          {/* O'ng — 2-kampus rasmi (xuddi shu aspect-ratio tuzatmasi bilan) */}
          <div className="reveal reveal-delay-2" style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,.1)', aspectRatio: '3 / 2' }}>
            <img
              src="/gallery/2-kampus.png"
              alt="KIU 2-kampus"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(26,26,46,.75)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              2-kampus
            </div>
          </div>
        </div>

        {/* Afzalliklar — to'liq kenglikda gorizontal qator */}
        <div className="reveal reveal-delay-3 grid-auto" style={{ marginTop: '2.5rem' }}>
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, title: "Grant asosida o'qish", desc: "Rektor va ta'sischilar stipendiyasi mavjud" },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: "Xalqaro hamkorlik", desc: "6+ xorijiy universitetlar bilan aloqa" },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: "Bepul avtobus xizmati", desc: "Talabalar uchun transport kafolatlangan" },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: "Zamonaviy yotoqxona", desc: "Qulay va arzon talabalar turar joyi" },
          ].map((item, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div className="fac-icon" style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#7c3aed' }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}