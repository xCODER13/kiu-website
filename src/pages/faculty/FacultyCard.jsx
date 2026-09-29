import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IC } from './Icons.jsx'
import { fmt, localizeProgram } from './utils'

/* ── Faculty Card ──────────────────────────────────────────── */
export default function FacultyCard({ f: program, index, onClick }) {
  const { t } = useTranslation()
  const f = localizeProgram(program, t)
  const [hover, setHover] = useState(false)

  // Xatolik: karta faqat sichqoncha uchun ochiladigan div edi — klaviatura
  // (Tab + Enter/Space) yoki screen reader orqali fokus qilib bo'lmas va
  // modalni ochib bo'lmas edi. role/tabIndex/onKeyDown qo'shildi.
  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
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
        {f.studyFormLabel}
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
          {t('faculty.pricePerYear', { price: fmt(f.price, t('meta.thousandsSep')) })}
        </span>
      </div>

      <div style={{
        fontSize: 12, fontWeight: 600, color: f.color,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {t('faculty.card.details')}
        <span style={{ display: 'flex', alignItems: 'center' }}>{IC.arrowRight(13)}</span>
      </div>
    </div>
  )
}