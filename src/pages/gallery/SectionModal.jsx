import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../../components/Icon'
import useModalA11y from '../../hooks/useModalA11y'

// Havola `<a href>` ga tushadi: backend ham tekshiradi, bu yerda ikkinchi qatlam (faqat https://, bo'shliq/qo'shtirnoqsiz)
export const SAFE_LINK = /^https:\/\/[^\s<>"'`\\]+$/i

// «Bo'limlar» kartasi ochadigan modal (Tadbirlar modali bilan bir xil sirt: `ev-modal*`). Portal + `#root` inert + fokus tuzog'i/Esc/scroll qulfi
// (`useModalA11y`). Havola faqat shu yerda va faqat xavfsiz bo'lsa chiqadi: kartada `<a>` yo'q.
export default function SectionModal({ item, label, onClose }) {
  const { t } = useTranslation()
  const ref = useRef(null)
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.inert = true
    return () => { if (root) root.inert = false }
  }, [])
  useModalA11y(ref, onClose)

  return createPortal(
    <div className="ev-modal-overlay" onClick={onClose}>
      <div ref={ref} className="ev-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="student-life-modal-title">
        <button type="button" className="ev-modal__close" data-over-image={item.image ? 'true' : undefined} onClick={onClose} aria-label={t('gallery.close')}>
          <Icon size={18}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
        </button>

        {item.image && (
          <img className="ev-modal__img" src={item.image} alt="" onError={e => { e.currentTarget.dataset.broken = 'true' }} />
        )}
        <span className="news-card-cat" data-section={item.section}>
          <span className="cat-dot" aria-hidden="true" />
          {label}
        </span>
        <h2 id="student-life-modal-title" className="ev-modal__title" lang="uz">{item.title}</h2>
        {item.desc && <p className="ev-modal__desc ev-modal__desc--pre" lang="uz">{item.desc}</p>}
        {item.link && SAFE_LINK.test(item.link) && (
          <div className="ev-modal__actions">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {t('gallery.openLink')}
              <Icon size={16}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></Icon>
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
