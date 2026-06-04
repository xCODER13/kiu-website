import { NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import useReveal from '../hooks/useReveal'
import config from '../config'

/* ── Mock data ── */
const NEWS = [
  {
    tag: 'Yangilik', tagColor: '#7c3aed', date: '28-May 2026', emoji: '🎓',
    title: "KIU talabalariga xalqaro grant dasturlari e'lon qilindi",
    desc: "Yevropa universitetlari bilan hamkorlikda yangi grant imkoniyatlari ochildi.",
  },
  {
    tag: 'Tadbir', tagColor: '#0891b2', date: '15-May 2026', emoji: '🔬',
    title: 'Ilmiy konferensiya: "Raqamli iqtisodiyot va ta\'lim"',
    desc: "2026-yil 20-iyun kuni KIU da xalqaro ilmiy anjuman bo'lib o'tadi.",
  },
  {
    tag: "E'lon", tagColor: '#059669', date: '01-May 2026', emoji: '📋',
    title: "2026–2027 o'quv yili qabul jarayoni boshlandi",
    desc: "Bakalavr va magistratura bo'yicha ariza qabul qilish rasmiy boshlandi.",
  },
]

const DOCS = [
  "Universitetning Nizomi",
  "Litsenziya va Akkreditatsiya",
  "O'quv rejalari 2025–2026",
  "Ichki tartib qoidalari",
  "Qabul qoidalari 2026",
  "Talabalar shartnomasi namunasi",
]

const FEATURES = [
  {
    title: "Grant asosida o'qish", desc: "Rektor va ta'sischilar stipendiyasi mavjud",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  },
  {
    title: "Xalqaro hamkorlik", desc: "6+ xorijiy universitetlar bilan aloqa",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
  {
    title: "Bepul avtobus xizmati", desc: "Talabalar uchun transport kafolatlangan",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    title: "Zamonaviy yotoqxona", desc: "Qulay va arzon talabalar turar joyi",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
]

export default function Home() {
  useReveal()

  useEffect(() => {
    /* inject fonts once */
    if (!document.getElementById('kiu-gfonts')) {
      const l = document.createElement('link')
      l.id = 'kiu-gfonts'
      l.rel = 'stylesheet'
      l.href = 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap'
      document.head.appendChild(l)
    }

    /* counter animation */
    config.stats.forEach((s, i) => {
      const el = document.getElementById(`stat-${i}`)
      if (!el) return
      const target = parseInt(s.n.replace(/\D/g, ''))
      const suffix = s.n.replace(/[0-9]/g, '')
      let cur = 0
      const step = Math.ceil(target / 80)
      const timer = setInterval(() => {
        cur += step
        if (cur >= target) { cur = target; clearInterval(timer) }
        el.textContent = cur + suffix
      }, 22)
    })
  }, [])

  return (
    <div className="fade-up">

      {/* ══ HERO ══ */}
      <section style={{
        padding: 'clamp(4.5rem,8vw,6.5rem) 2rem clamp(3rem,6vw,5rem)',
        background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 40%, #e0e7ff 100%)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* subtle dot texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(#7c3aed 1px, transparent 1px)', backgroundSize:'28px 28px', opacity:.04, pointerEvents:'none' }} />
        {/* soft blobs */}
        <div style={{ position:'absolute', width:340, height:340, borderRadius:'50%', background:'#7c3aed', opacity:.05, top:-120, left:-80, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'#4f46e5', opacity:.05, bottom:-60, right:-50, pointerEvents:'none' }} />
        {/* thin top line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, transparent, #7c3aed 35%, #a855f7 65%, transparent)', pointerEvents:'none' }} />

        {/* two-column layout */}
        <div style={{ position:'relative', zIndex:2, maxWidth:1100, margin:'0 auto', display:'flex', gap:'3rem', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>

          {/* left: text */}
          <div style={{ flex:'1 1 420px', maxWidth:560 }}>
            <div className="reveal" style={{
              display:'inline-flex', alignItems:'center', gap:7,
              fontSize:'0.69rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase',
              color:'#7c3aed', background:'rgba(124,58,237,.12)',
              padding:'5px 16px', borderRadius:20, marginBottom:'1.5rem',
              border:'1px solid rgba(124,58,237,.22)',
            }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#7c3aed', animation:'kiuPulse 2s infinite' }} />
              {config.admission.year}–{parseInt(config.admission.year)+1} · Qabul ochiq
            </div>

            <h1 className="reveal reveal-delay-1" style={{
              fontFamily:"'Libre Baskerville', Georgia, serif",
              fontSize:'clamp(1.9rem, 4vw, 3rem)',
              fontWeight:700, color:'#1e1b4b',
              lineHeight:1.18, marginBottom:'1.1rem',
              letterSpacing:'-.02em',
            }}>
              {config.university.name}
            </h1>

            <p className="reveal reveal-delay-2" style={{
              fontSize:'0.92rem', color:'var(--muted)',
              maxWidth:420, lineHeight:1.8, marginBottom:'2rem',
            }}>
              Xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish — Qashqadaryo qalbida.
            </p>

            <div className="reveal reveal-delay-3" style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:'2rem' }}>
              <NavLink to="/admission">
                <button className="btn btn-primary"
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(124,58,237,.45)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
                  style={{ transition:'transform .15s, box-shadow .15s' }}
                >Qabul haqida</button>
              </NavLink>
              <NavLink to="/faculty">
                <button style={{
                  fontWeight:500, fontSize:14, padding:'10px 20px', borderRadius:8,
                  cursor:'pointer', background:'rgba(124,58,237,.08)',
                  color:'#7c3aed', border:'1px solid rgba(124,58,237,.22)',
                  transition:'background .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,.15)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(124,58,237,.08)'}
                >
                  Yo'nalishlar →
                </button>
              </NavLink>
            </div>

            {/* trust pills */}
            <div className="reveal reveal-delay-4" style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', fontSize:11, color:'var(--muted)' }}>
              {['🎓 Davlat litsenziyasi', '🌐 6+ xorijiy hamkor', '🏛️ 2022-yildan'].flatMap((t,i) =>
                i === 0
                  ? [<span key={t}>{t}</span>]
                  : [<span key={`d${i}`} style={{ width:3, height:3, borderRadius:'50%', background:'rgba(124,58,237,.3)', display:'inline-block' }} />, <span key={t}>{t}</span>]
              )}
            </div>
          </div>

          {/* right: info card */}
          <div className="reveal reveal-delay-2" style={{ flex:'0 0 auto' }}>
            <div style={{
              background:'rgba(255,255,255,.65)',
              border:'1px solid rgba(124,58,237,.18)',
              borderRadius:16, padding:'1.5rem', width:212,
              backdropFilter:'blur(12px)',
              boxShadow:'0 16px 48px rgba(124,58,237,.1), 0 2px 8px rgba(0,0,0,.06)',
            }}>
              {/* header */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1rem' }}>
                <div style={{
                  width:36, height:36, borderRadius:9,
                  background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:"'Libre Baskerville', Georgia, serif",
                  fontSize:13, fontWeight:700, color:'#fff',
                }}>KI<span style={{ color:'#c4b5fd' }}>U</span></div>
                <div>
                  <div style={{ fontSize:10, fontWeight:600, color:'#7c3aed', letterSpacing:'.06em', textTransform:'uppercase' }}>Qarshi</div>
                  <div style={{ fontSize:9, color:'var(--muted)' }}>Xalqaro Universiteti</div>
                </div>
              </div>

              <div style={{ height:1, background:'rgba(124,58,237,.12)', marginBottom:'1rem' }} />

              {/* mini stats 2×2 */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:'1rem' }}>
                {config.stats.slice(0,4).map((s,i) => (
                  <div key={i} style={{
                    textAlign:'center', padding:'7px 4px',
                    background:'rgba(124,58,237,.06)', borderRadius:8,
                    border:'1px solid rgba(124,58,237,.12)',
                  }}>
                    <div style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:14, fontWeight:700, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{s.n}</div>
                    <div style={{ fontSize:8, color:'var(--muted)', marginTop:2 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ height:1, background:'rgba(124,58,237,.12)', marginBottom:'1rem' }} />

              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:'1rem' }}>
                {['Bakalavr','Magistratura','Online','Grant'].map(b => (
                  <span key={b} style={{
                    fontSize:9, fontWeight:600, padding:'3px 9px', borderRadius:12,
                    background:'rgba(124,58,237,.08)', color:'#7c3aed',
                    border:'1px solid rgba(124,58,237,.2)',
                  }}>{b}</span>
                ))}
              </div>

              <div style={{ fontSize:9, color:'var(--muted)', textAlign:'center' }}>kiu.uz · Rasmiy sayt</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS STRIP ══ */}
      <section style={{ background:'#fff', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 2rem' }}>
          <div style={{
            display:'grid',
            gridTemplateColumns:`repeat(${config.stats.length},1fr)`,
            borderLeft:'1px solid var(--border)',
          }}>
            {config.stats.map((s,i) => (
              <div key={s.l} className="reveal" style={{
                padding:'1.75rem 1rem', textAlign:'center',
                borderRight:'1px solid var(--border)',
              }}>
                <div id={`stat-${i}`} style={{
                  fontSize:'2rem', fontWeight:700,
                  fontFamily:"'Libre Baskerville',Georgia,serif",
                  background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                }}>0</div>
                <div style={{ fontSize:11, color:'var(--muted)', marginTop:4, letterSpacing:'.03em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BIZ HAQIMIZDA ══ */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems:'center', gap:'3.5rem' }}>
            <div>
              <div className="reveal" style={{
                display:'inline-block', fontSize:'0.69rem', fontWeight:600,
                letterSpacing:'.09em', textTransform:'uppercase',
                color:'#7c3aed', background:'rgba(124,58,237,.07)',
                padding:'4px 13px', borderRadius:20, marginBottom:'1rem',
                border:'1px solid rgba(124,58,237,.18)',
              }}>2022 yildan buyon</div>

              <h2 className="reveal reveal-delay-1" style={{
                fontFamily:"'Libre Baskerville',Georgia,serif",
                fontSize:'clamp(1.35rem,2.5vw,1.75rem)',
                color:'#1e1b4b', marginBottom:'1rem',
                lineHeight:1.35, letterSpacing:'-.01em',
              }}>
                Qarshi Xalqaro Universiteti haqida
              </h2>

              <p className="reveal reveal-delay-2" style={{ fontSize:14, color:'var(--muted)', lineHeight:1.88, marginBottom:'.9rem' }}>
                Qarshi Xalqaro Universiteti (KIU) 2022-yilda Qashqadaryo viloyati Qarshi shahrida tashkil topgan. O'zbekiston Respublikasidagi zamonaviy oliy ta'lim markazlaridan biri.
              </p>
              <p className="reveal reveal-delay-3" style={{ fontSize:14, color:'var(--muted)', lineHeight:1.88, marginBottom:'1.8rem' }}>
                Bizning maqsad — talabalarga sifatli ta'lim va soft skills berib, ularni hayotga tayyorlash. Xalqaro standartlarda ta'lim, ilmiy tadqiqot va professional rivojlanish imkoniyatlarini yaratish.
              </p>
              <NavLink to="/about">
                <button className="reveal reveal-delay-4 btn btn-primary"
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 22px rgba(124,58,237,.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
                  style={{ transition:'transform .15s, box-shadow .15s' }}
                >Batafsil ma'lumot</button>
              </NavLink>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {FEATURES.map((item,i) => (
                <div key={i} className={`card reveal reveal-delay-${i+1}`}
                  style={{ display:'flex', gap:12, alignItems:'center', padding:'1rem 1.25rem' }}
                >
                  <div style={{
                    width:42, height:42, borderRadius:10, flexShrink:0,
                    background:'linear-gradient(135deg,#faf5ff,#ede9fe)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'#7c3aed',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{item.title}</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ YANGILIKLAR ══ */}
      <section className="section" style={{ background:'#f8f7ff', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div className="reveal" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2rem', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:'0.69rem', fontWeight:600, letterSpacing:'.09em', textTransform:'uppercase', color:'#7c3aed', marginBottom:6 }}>
                So'nggi yangiliklar
              </div>
              <h2 style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:'clamp(1.3rem,2.5vw,1.65rem)', color:'#1e1b4b', margin:0, letterSpacing:'-.01em' }}>
                Yangiliklar &amp; Tadbirlar
              </h2>
            </div>
            <NavLink to="/news" style={{ fontSize:13, color:'#7c3aed', fontWeight:600, textDecoration:'none' }}>
              Barchasi →
            </NavLink>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px,1fr))', gap:18 }}>
            {NEWS.map((n,i) => (
              <div key={i} className={`card reveal reveal-delay-${i+1}`}
                style={{ overflow:'hidden', padding:0, cursor:'pointer', transition:'transform .2s, box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(124,58,237,.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
              >
                <div style={{
                  height:120, fontSize:42,
                  background:`linear-gradient(135deg,${n.tagColor}10 0%,${n.tagColor}1e 100%)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  borderBottom:`1px solid ${n.tagColor}22`,
                }}>
                  {n.emoji}
                </div>
                <div style={{ padding:'1rem 1.2rem 1.25rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{
                      fontSize:9, fontWeight:700, padding:'2px 10px', borderRadius:12,
                      background:`${n.tagColor}12`, color:n.tagColor,
                      border:`1px solid ${n.tagColor}28`, letterSpacing:'.04em', textTransform:'uppercase',
                    }}>{n.tag}</span>
                    <span style={{ fontSize:10, color:'var(--muted)' }}>{n.date}</span>
                  </div>
                  <h3 style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:13.5, color:'#1e1b4b', marginBottom:6, lineHeight:1.45, fontWeight:700 }}>
                    {n.title}
                  </h3>
                  <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.65, marginBottom:10 }}>{n.desc}</p>
                  <span style={{ fontSize:12, color:'#7c3aed', fontWeight:600 }}>Batafsil o'qish →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NORMATIV HUJJATLAR ══ */}
      <section className="section">
        <div className="container">
          <div className="reveal" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2rem', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:'0.69rem', fontWeight:600, letterSpacing:'.09em', textTransform:'uppercase', color:'#7c3aed', marginBottom:6 }}>
                Rasmiy hujjatlar
              </div>
              <h2 style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:'clamp(1.3rem,2.5vw,1.65rem)', color:'#1e1b4b', margin:0, letterSpacing:'-.01em' }}>
                Normativ Hujjatlar
              </h2>
            </div>
            <NavLink to="/documents" style={{ fontSize:13, color:'#7c3aed', fontWeight:600, textDecoration:'none' }}>
              Hammasi →
            </NavLink>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:10 }}>
            {DOCS.map((doc,i) => (
              <div key={i} className={`card reveal reveal-delay-${(i%3)+1}`}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'.95rem 1.2rem', cursor:'pointer', transition:'transform .15s, box-shadow .15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(124,58,237,.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
              >
                <div style={{
                  width:40, height:40, borderRadius:8, flexShrink:0,
                  background:'#fff5f5', border:'1px solid #fecaca',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:9, fontWeight:800, color:'#ef4444', letterSpacing:'.06em',
                }}>PDF</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc}</div>
                  <div style={{ fontSize:10, color:'var(--muted)' }}>Rasmiy hujjat · PDF</div>
                </div>
                <button
                  style={{
                    width:32, height:32, borderRadius:8, flexShrink:0,
                    background:'rgba(124,58,237,.07)', border:'1px solid rgba(124,58,237,.15)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', color:'#7c3aed', transition:'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,.16)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(124,58,237,.07)'}
                  title="Yuklab olish"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes kiuPulse {
          0%, 100% { opacity:1; transform:scale(1); }
          50%       { opacity:.4; transform:scale(.75); }
        }
      `}</style>
    </div>
  )
}