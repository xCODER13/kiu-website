import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IC, BAKALAVR } from '../data/facultyData'

/* ── Price formatter: 12850000 -> "12 850 000" ─────────────── */
const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/* ── MAGISTRATURA data ─────────────────────────────────────── */
const MAGISTRATURA = [
  {
    name: 'Lingvistika (Ingliz tili)',
    price: 18000000,
    duration: '2 yil',
    lang: "O'zbek / Ingliz",
    studyForm: 'Kunduzgi',
    icon: 'globe',
    color: '#2563eb',
    desc: "Ingliz tili lingvistikasi sohasida ilmiy-tadqiqot va pedagogik faoliyat olib boruvchi yuqori malakali mutaxassislar tayyorlash. Xalqaro ilmiy hamkorlik imkoniyatlari.",
    subjects: ['Ingliz tilshunoslik nazariyasi', 'Qiyosiy tilshunoslik', 'Ilmiy tadqiqot metodologiyasi', 'Tarjima nazariyasi', 'Lingvokulturologiya', 'Diskurs tahlili'],
    career: ["Oliy o'quv yurti o'qituvchisi", 'Ilmiy tadqiqotchi', 'Tarjimon', 'Lingvistika mutaxassisi', 'Xalqaro tashkilot mutaxassisi'],
  },
  {
    name: 'Lingvistika (Rus tili)',
    price: 18000000,
    duration: '2 yil',
    lang: "O'zbek / Rus",
    studyForm: 'Kunduzgi',
    icon: 'book',
    color: '#ae0895',
    desc: "Rus tili lingvistikasi sohasida ilmiy-tadqiqot va pedagogik faoliyatga tayyorlangan chuqur bilimli mutaxassislar yetishtirish. Kognitiv va qiyosiy tilshunoslik.",
    subjects: ['Rus tilshunoslik nazariyasi', 'Qiyosiy grammatika', 'Ilmiy tadqiqot metodologiyasi', 'Nutq madaniyati', 'Stilistika', 'Kognitiv tilshunoslik'],
    career: ["Oliy o'quv yurti o'qituvchisi", 'Tarjimon', 'Ilmiy tadqiqotchi', 'Muharrir', 'Diplomat'],
  },
  {
    name: 'Iqtisodiyot',
    price: 18000000,
    duration: '2 yil',
    lang: "O'zbek / Ingliz",
    studyForm: 'Kunduzgi',
    icon: 'dollar',
    color: '#416c2a',
    desc: "Iqtisodiy siyosat, tahlil va boshqaruv sohasida chuqur ilmiy bilimga ega mutaxassislar tayyorlash. Xalqaro iqtisodiyot va raqamli iqtisod ixtisoslashuvi.",
    subjects: ['Makroiqtisodiy tahlil', 'Tadqiqot metodologiyasi', 'Raqamli iqtisodiyot', 'Xalqaro iqtisodiyot', 'Iqtisodiy siyosat', 'Ekonometrika'],
    career: ['Iqtisodchi-tahlilchi', 'Davlat boshqaruv mutaxassisi', 'Konsultant', 'Ilmiy tadqiqotchi', 'Xalqaro tashkilotlar mutaxassisi'],
  },
]

/* ── Faculty Card ──────────────────────────────────────────── */
function FacultyCard({ f, index, onClick }) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className="card"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        padding: '1.25rem',
        animation: 'cardFadeIn .35s ease both',
        animationDelay: `${index * 0.05}s`,
        transition: 'transform .2s, box-shadow .2s, border-color .2s',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,.12)' : undefined,
        borderColor: hover ? f.color : undefined,
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: `${f.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12, color: f.color, flexShrink: 0,
      }}>
        {IC[f.icon](22)}
      </div>

      <h3 style={{
        fontSize: 13, fontWeight: 600,
        color: 'var(--text)', marginBottom: 6, lineHeight: 1.4,
        fontFamily: 'var(--font-body)', flexGrow: 1,
      }}>
        {f.name}
      </h3>

      <div style={{
        fontSize: 11, color: 'var(--muted)', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <span style={{ color: '#d97706', display: 'flex', alignItems: 'center' }}>{IC.sun(13)}</span>
        {f.studyForm}
        <span style={{ opacity: .4 }}>·</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--muted)' }}>
          {IC.clock(12)}{f.duration}
        </span>
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 20, marginBottom: 12,
        background: `${f.color}10`,
        border: `1px solid ${f.color}28`,
        alignSelf: 'flex-start',
      }}>
        <span style={{ color: f.color, display: 'flex', alignItems: 'center' }}>{IC.tag(11)}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: f.color }}>
          {fmt(f.price)} so'm/yil
        </span>
      </div>

      <div style={{
        fontSize: 12, fontWeight: 600, color: f.color,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        Batafsil
        <span style={{ display: 'flex', alignItems: 'center' }}>{IC.arrowRight(13)}</span>
      </div>
    </div>
  )
}

/* ── Modal ─────────────────────────────────────────────────── */
function FacultyModal({ f, degree, onClose }) {
  useEffect(() => {
    const scrollW = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = scrollW + 'px'
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const infoItems = [
    { label: 'Davomiyligi',   value: f.duration,   iconFn: () => IC.clock(20)  },
    { label: "O'qitish tili", value: f.lang,        iconFn: () => IC.globe(20)  },
    { label: "O'qish shakli", value: f.studyForm,   iconFn: () => IC.sun(20)    },
  ]

  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,10,30,.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0.75rem 1rem',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: 18,
          padding: '1.4rem 1.5rem',
          maxWidth: 580,
          width: '100%',
          maxHeight: 'calc(100vh - 1.5rem)',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0,0,0,.35)',
          position: 'relative',
          border: `1px solid ${f.color}30`,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          title="Yopish (Esc)"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 34, height: 34, borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)',
            transition: 'background .15s',
          }}
        >
          {IC.close(16)}
        </button>

        {/* Degree badge */}
        <div style={{ marginBottom: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 600,
            padding: '4px 12px', borderRadius: 20,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: `${f.color}18`,
            color: f.color,
            border: `1px solid ${f.color}40`,
          }}>
            {degree === 'bakalavr' ? IC.graduation(13) : IC.building(13)}
            {degree === 'bakalavr' ? 'Bakalavr' : 'Magistratura'}
          </span>
        </div>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '1rem' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: `${f.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: f.color, flexShrink: 0,
          }}>
            {IC[f.icon](22)}
          </div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, paddingTop: 6 }}>
            {f.name}
          </h2>
        </div>

        {/* Info strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
          padding: '0.75rem', background: 'var(--card)',
          borderRadius: 12, marginBottom: '1rem',
          border: `1px solid ${f.color}25`,
        }}>
          {infoItems.map(({ label, value, iconFn }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                marginBottom: 6, color: f.color,
              }}>
                {iconFn()}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Price block */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0.75rem 1rem',
          background: `${f.color}0d`,
          borderRadius: 12, marginBottom: '1rem',
          border: `1px solid ${f.color}30`,
        }}>
          <div style={{ color: f.color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {IC.tag(28)}
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: f.color, marginBottom: 2, fontWeight: 500, opacity: 0.8 }}>
              Kontrakt narxi (kunduzgi, yillik)
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: f.color, letterSpacing: '-0.5px' }}>
              {fmt(f.price)} so'm
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1rem' }}>
          {f.desc}
        </p>

        {/* Note */}
        {f.note && (
          <div style={{
            padding: '8px 14px',
            background: `${f.color}08`,
            borderRadius: 10,
            fontSize: 12, color: f.color,
            marginBottom: '1rem',
            fontWeight: 500,
            display: 'flex', alignItems: 'flex-start', gap: 7,
          }}>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', marginTop: 1 }}>
              {IC.info(14)}
            </span>
            {f.note}
          </div>
        )}

        {/* Subjects + Career */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h4 style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text)',
              marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: f.color, display: 'flex', alignItems: 'center' }}>{IC.bookOpen(14)}</span>
              O'qitiladigan fanlar
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {f.subjects.map(s => (
                <span key={s} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 20,
                  background: `${f.color}0e`,
                  color: f.color,
                  border: `1px solid ${f.color}22`,
                  fontWeight: 500,
                }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text)',
              marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: f.color, display: 'flex', alignItems: 'center' }}>{IC.briefcase(14)}</span>
              Karyera imkoniyatlari
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {f.career.map(c => (
                <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: f.color, flexShrink: 0, marginTop: 4,
                  }} />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/admission"
            style={{
              flex: 1, minWidth: 160,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 10,
              background: `linear-gradient(135deg, ${f.color}, ${f.color}cc)`,
              color: '#fff', textDecoration: 'none',
              fontWeight: 700, fontSize: 12.5,
              boxShadow: `0 4px 16px ${f.color}55`,
            }}
          >
            {IC.pen(14)}
            Ariza topshirish
          </a>
          <a
            href="tel:+998555009944"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '11px 16px', borderRadius: 10,
              border: `1.5px solid ${f.color}40`,
              background: `${f.color}08`,
              color: f.color,
              textDecoration: 'none',
              fontWeight: 600, fontSize: 12.5,
              whiteSpace: 'nowrap',
            }}
          >
            {IC.phone(15)}
            +998 55 500 99 44
          </a>
        </div>

        {/* Deadline note */}
        <div style={{
          marginTop: '0.75rem', padding: '7px 12px',
          background: 'rgba(255,183,0,.1)', borderRadius: 10,
          border: '1px solid rgba(255,183,0,.3)',
          fontSize: 11, color: '#92400e', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{IC.calendar(14)}</span>
          Qabul muddati: 1 iyul — 20 avgust 2026
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

/* ── Styles injection ──────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('faculty-styles')) {
  const s = document.createElement('style')
  s.id = 'faculty-styles'
  s.textContent = `
    @keyframes cardFadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0);    }
    }

    /* ✅ FIX 2: Mobile tab responsive styles */
    .kiu-tab-wrap {
      display: inline-flex;
      gap: 6px;
      background: var(--card);
      padding: 5px;
      border-radius: 40px;
      border: 2px solid var(--border);
      box-shadow: 0 0 0 1px rgba(124,58,237,.25);
      max-width: 100%;
    }
    .kiu-tab-btn {
      padding: 9px 22px;
      border-radius: 35px;
      cursor: pointer;
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 7px;
      transition: all .2s;
      white-space: nowrap;
      font-family: inherit;
    }
    .kiu-tab-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 20px;
    }

    /* Mobil uchun: kichik ekranda padding va font kamaytirish */
    @media (max-width: 480px) {
      .kiu-tab-btn {
        padding: 8px 13px !important;
        font-size: 11.5px !important;
        gap: 5px !important;
      }
      .kiu-tab-badge {
        padding: 1px 5px !important;
        font-size: 9px !important;
      }
    }
  `
  document.head.appendChild(s)
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function Faculty() {
  const [tab, setTab] = useState('bakalavr')
  const [modal, setModal] = useState(null)

  const list = tab === 'bakalavr' ? BAKALAVR : MAGISTRATURA

  const tabMeta = {
    bakalavr:     { count: BAKALAVR.length,    duration: '4 yil', from: '12 850 000' },
    magistratura: { count: MAGISTRATURA.length, duration: '2 yil', from: '18 000 000' },
  }

  return (
    <div className="fade-up">
      {/* Hero */}
      <section style={{
        padding: '3rem 2rem 2rem',
        background: 'linear-gradient(135deg,#faf5ff 0%,#ede9fe 40%,#e0e7ff 100%)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text)', marginBottom: '.5rem' }}>Yo'nalishlar</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: '1.75rem' }}>
          Xalqaro standartlarda yuqori sifatli ta'lim
        </p>

        {/* ✅ FIX 2: Tab switcher — markazlash wrapper + className-lar */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="kiu-tab-wrap">
            {['bakalavr', 'magistratura'].map(t => {
              const active = tab === t
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="kiu-tab-btn"
                  style={{
                    border: active ? 'none' : '1px solid rgba(124,58,237,.35)',
                    background: active ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'transparent',
                    color: active ? '#fff' : 'var(--text)',
                    boxShadow: active ? '0 3px 10px rgba(124,58,237,.35)' : 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: active ? '#fff' : '#7c3aed' }}>
                    {t === 'bakalavr' ? IC.graduation(15) : IC.building(15)}
                  </span>
                  {t === 'bakalavr' ? 'Bakalavr' : 'Magistratura'}
                  <span
                    className="kiu-tab-badge"
                    style={{
                      background: active ? 'rgba(255,255,255,.2)' : 'rgba(124,58,237,.15)',
                      color: active ? '#fff' : '#7c3aed',
                    }}
                  >
                    {tabMeta[t].count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '.9rem 2rem',
      }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'center',
          gap: '2.5rem', flexWrap: 'wrap',
        }}>
          {[
            { v: tabMeta[tab].count,           l: "Yo'nalish"    },
            { v: tabMeta[tab].duration,         l: 'Davomiyligi'  },
            { v: tabMeta[tab].from + " so'm",   l: 'Eng past narx' },
            { v: 'Kunduzgi',                    l: "O'qish shakli" },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{v}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <section className="section">
        <div className="container">
          <div className="grid-auto">
            {list.map((f, i) => (
              <FacultyCard
                key={tab + '-' + f.name}
                f={f}
                index={i}
                onClick={() => setModal({ ...f, degree: tab })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {modal && (
        <FacultyModal
          f={modal}
          degree={modal.degree}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}