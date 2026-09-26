import { IcQuestion, IcBolt, IcTarget, IcSparkle, IcBulb, IcPlay } from './Icons.jsx'
import { QUESTIONS } from './Data.jsx'

/* ── Intro Stage ───────────────────────────────────────────── */
export default function IntroStage({ onStart }) {
  return (
    <div>
      {/* info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 12, marginBottom: '1.75rem' }}>
        {[
          { icon: <IcQuestion />,   title: `${QUESTIONS.length} ta savol`, desc: 'Oddiy va qiziqarli' },
          { icon: <IcBolt />,        title: '3 daqiqa',        desc: 'Tez va aniq'       },
          { icon: <IcTarget />,      title: 'Top 3 tavsiya',   desc: "Mos yo'nalishlar"  },
          { icon: <IcSparkle />,     title: 'Shaxsiy tahlil',  desc: 'Faqat siz uchun'   },
        ].map((c, i) => (
          <div key={i} className="card" style={{ padding: '1.15rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{c.title}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* how it works */}
      <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(124,58,237,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
          <IcBulb s={20} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>Qanday ishlaydi?</h3>
        </div>
        {[
          { n: '1', t: 'Savolga javob bering',  d: "Har bir savolda o'zingizga eng mos variantni tanlang" },
          { n: '2', t: 'Tizim tahlil qiladi',   d: 'Javoblaringiz asosida kuchli tomonlaringiz aniqlanadi' },
          { n: '3', t: 'Tavsiya olasiz',         d: "Top 3 ta mos yo'nalish va karyera imkoniyatlari ko'rsatiladi" },
          { n: '4', t: "Qaror o'z qo'lingizda",  d: "Shlyapa maslahat beradi — yakuniy tanlov siz bilan!" },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 3 ? '0.7rem' : 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.t}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={onStart}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 36px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 20px rgba(124,58,237,.4)', transition: 'transform .2s' }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
          <IcPlay s={18} /> Testni boshlash
        </button>
      </div>
    </div>
  )
}
