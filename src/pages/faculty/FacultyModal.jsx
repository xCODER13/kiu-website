import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Link } from '../../i18n/router'
import { IC } from './Icons.jsx'
import { fmt, localizeProgram } from './utils'

/* ── Modal ─────────────────────────────────────────────────── */
export default function FacultyModal({ f: program, degree, onClose }) {
  const { t } = useTranslation()
  const f = localizeProgram(program, t)
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
    { label: t('faculty.modal.duration'), value: f.duration,       icon: IC.clock(20)  },
    { label: t('faculty.modal.language'), value: f.lang,           icon: IC.globe(20)  },
    { label: t('faculty.modal.studyForm'), value: f.studyFormLabel, icon: IC.sun(20)   },
  ]

  const modalContent = (
    <div className="fac-modal-overlay" onClick={onClose}>
      <div
        className="fac-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="faculty-modal-title"
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          title={t('faculty.modal.close')}
          aria-label={t('faculty.modal.closeLabel')}
          className="fac-modal__close"
        >
          {IC.close(16)}
        </button>

        {/* Daraja belgisi */}
        <span className="fac-chip fac-chip--degree">
          {degree === 'bakalavr' ? IC.graduation(14) : IC.building(14)}
          {t(`faculty.degrees.${degree}`)}
        </span>

        {/* Sarlavha */}
        <div className="fac-modal__title-row">
          <div className="fac-icon fac-icon--lg">{IC[f.icon](24)}</div>
          <h2 id="faculty-modal-title" className="fac-modal__title">{f.name}</h2>
        </div>

        {/* Ma'lumot qatori */}
        <div className="fac-info">
          {infoItems.map(({ label, value, icon }) => (
            <div key={label} className="fac-info__item">
              <div className="fac-info__icon">{icon}</div>
              <div className="fac-info__label">{label}</div>
              <div className="fac-info__value">{value}</div>
            </div>
          ))}
        </div>

        {/* Narx */}
        <div className="fac-fee">
          <div className="fac-fee__icon">{IC.tag(28)}</div>
          <div>
            <div className="fac-fee__label">{t('faculty.modal.fee')}</div>
            <div className="fac-fee__value">{t('faculty.price', { price: fmt(f.price, t('meta.thousandsSep')) })}</div>
          </div>
        </div>

        <p className="fac-modal__desc">{f.desc}</p>

        {f.note && (
          <div className="fac-note">
            <span className="fac-note__icon">{IC.info(15)}</span>
            {f.note}
          </div>
        )}

        {/* Fanlar + karyera */}
        <div className="fac-cols">
          <div>
            <h4 className="fac-h4"><span className="fac-h4__icon">{IC.bookOpen(15)}</span>{t('faculty.modal.subjects')}</h4>
            <div className="fac-chips">
              {f.subjects.map(s => <span key={s} className="fac-chip">{s}</span>)}
            </div>
          </div>
          <div>
            <h4 className="fac-h4"><span className="fac-h4__icon">{IC.briefcase(15)}</span>{t('faculty.modal.career')}</h4>
            <ul className="fac-career">
              {f.career.map(c => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="fac-modal__actions">
          <Link to="/admission" className="btn btn-primary fac-modal__apply">
            {IC.pen(16)}
            {t('faculty.modal.apply')}
          </Link>
          <a href="tel:+998555009944" className="btn btn-secondary">
            {IC.phone(16)}
            +998 55 500 99 44
          </a>
        </div>

        {/* Qabul muddati */}
        <div className="fac-deadline">
          {IC.calendar(15)}
          {t('faculty.modal.deadline')}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
