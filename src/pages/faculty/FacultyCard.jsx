import { useTranslation } from 'react-i18next'
import { IC } from './Icons.jsx'
import { fmt, localizeProgram } from './utils'

/* ── Faculty Card ──────────────────────────────────────────── */
export default function FacultyCard({ f: program, index, onClick }) {
  const { t } = useTranslation()
  const f = localizeProgram(program, t)

  // Xatolik: karta faqat sichqoncha uchun ochiladigan div edi — klaviatura
  // (Tab + Enter/Space) yoki screen reader orqali fokus qilib bo'lmas va
  // modalni ochib bo'lmas edi. role/tabIndex/onKeyDown qo'shildi.
  return (
    <div
      className="card faculty-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      // Faqat dinamik qiymat: kirish animatsiyasi kechikishi. Rang endi hamma yo'nalishda bitta (brand) —
      // `color` maydoni data.js da qoladi, lekin stilga qo'yilmaydi (6.11, 10.4 CSS injection qoidasi)
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="fac-icon">{IC[f.icon](24)}</div>

      <h2 className="fac-name">{f.name}</h2>

      <div className="fac-meta">
        <span className="fac-meta__sun">{IC.sun(14)}</span>
        {f.studyFormLabel}
        <span className="fac-meta__sep" aria-hidden="true">·</span>
        <span className="fac-meta__item">{IC.clock(13)}{f.duration}</span>
      </div>

      <div className="fac-price">
        {IC.tag(12)}
        <span>{t('faculty.pricePerYear', { price: fmt(f.price, t('meta.thousandsSep')) })}</span>
      </div>

      <div className="fac-more">
        {t('faculty.card.details')}
        {IC.arrowRight(14)}
      </div>
    </div>
  )
}
