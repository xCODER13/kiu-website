import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { IC } from './Icons.jsx'
import { fmt } from './utils'

/* ── Modal ─────────────────────────────────────────────────── */
export default function FacultyModal({ f, degree, onClose }) {
  const closeBtnRef = useRef(null)

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

  // YAXSHILASH (accessibility): modal ochiq turganda orqa fondagi
  // #root'ni `inert` qilib qo'yamiz — bu klaviatura/screen reader uchun
  // fon interaktiv bo'lib qolishining oldini oladi (qo'lda focus-trap
  // yozishga hojat yo'q, brauzer buni o'zi bajaradi). Modal yopilganda
  // diqqat oldingi elementga qaytariladi.
  useEffect(() => {
    const root = document.getElementById('root')
    const previouslyFocused = document.activeElement
    if (root) root.inert = true
    closeBtnRef.current?.focus()
    return () => {
      if (root) root.inert = false
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [])

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="faculty-modal-title"
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
          ref={closeBtnRef}
          onClick={onClose}
          title="Yopish (Esc)"
          aria-label="Modalni yopish"
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
          <h2 id="faculty-modal-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, paddingTop: 6 }}>
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
          <Link
            to="/admission"
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
          </Link>
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
