import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../../components/Icon'
import useModalA11y from '../../hooks/useModalA11y'

// O'qituvchi modali: yo'nalish modali (`.fac-modal*`) bilan bir xil qobiq, tarkibi — bazadagi mavjud maydonlar
// (rasm/avatar, ism, lavozim, kafedra, kafedradagi o'qituvchilar soni). Email ataylab yo'q (shaxsiy ma'lumot, DESIGN.md qaror 51).
// Portal: sahifa o'rami `fade-up` (transform) ichida `position: fixed` viewport'ga emas, o'ramga nisbatan bo'lib qolardi.
export default function TeacherModal({ teacher, colleagues, onClose }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)
  const titleId = useId()
  useModalA11y(dialogRef, onClose)

  return createPortal(
    <div className="fac-modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="fac-modal t-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={e => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} title={t('teachers.modal.close')} aria-label={t('teachers.modal.closeLabel')} className="fac-modal__close">
          <Icon size={16} strokeWidth={2.2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
        </button>

        <div className="t-modal__head">
          {/* Rasm yuklanmasa yoki bo'lmasa — bosh harflar ko'rinib turadi (rasm ustida yotadi) */}
          <div className="avatar-wine teacher-card__avatar t-modal__avatar">
            <span aria-hidden="true">{teacher.avatar || teacher.name?.slice(0, 2).toUpperCase()}</span>
            {teacher.image && (
              <img src={teacher.image} alt="" onError={ev => { ev.currentTarget.dataset.broken = 'true' }} />
            )}
          </div>
          <h2 id={titleId} className="fac-modal__title t-modal__name" lang="uz">{teacher.name}</h2>
          <div className="pill-brand teacher-card__role t-modal__role" lang="uz">{teacher.role}</div>
        </div>

        <div className="fac-info t-modal__info">
          <div className="fac-info__item">
            <div className="fac-info__icon">
              <Icon size={20}><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /></Icon>
            </div>
            <div className="fac-info__label">{t('teachers.modal.department')}</div>
            <div className="fac-info__value" lang="uz">{teacher.dept}</div>
          </div>
          <div className="fac-info__item">
            <div className="fac-info__icon">
              <Icon size={20}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>
            </div>
            <div className="fac-info__label">{t('teachers.modal.colleagues')}</div>
            <div className="fac-info__value">{t('teachers.count', { count: colleagues })}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
