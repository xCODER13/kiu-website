import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../../components/Icon'
import useModalA11y from '../../hooks/useModalA11y'

// Katta rasm oynasi: fokus tuzog'i, Esc, scroll qulfi va fokusni qaytarish — `useModalA11y` (ApplyModal bilan bir xil).
// Strelka tugmalari va ← → klaviaturasi Gallery'da (window'da) boshqariladi.
export default function Lightbox({ photo, index, total, onClose, onPrev, onNext }) {
  const { t } = useTranslation()
  const ref = useRef(null)
  // Orqa sahifa klaviatura/ekran o'quvchi uchun yopiladi (Tadbirlar va Yo'nalish modallari bilan bir xil). Oyna `document.body` ga chiqarilgani uchun
  // `#root` ni `inert` qilish unga ta'sir qilmaydi. Effektlar tartibi muhim: yopilganda avval `inert` olinadi, keyin `useModalA11y` fokusni qaytaradi.
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.inert = true
    return () => { if (root) root.inert = false }
  }, [])
  useModalA11y(ref, onClose)

  // Portal: sahifa ildizi (`.fade-up`) `transform` animatsiyasi `position: fixed` ni o'z ichiga qamab qo'yadi
  // (oyna butun sahifa balandligiga cho'zilib, rasm viewport markazida turmaydi) — shuning uchun `document.body` ga chiqariladi.
  return createPortal(
    <div className="photo-lightbox" onClick={onClose}>
      <div ref={ref} className="photo-lightbox__dialog" role="dialog" aria-modal="true" aria-label={photo.title}>
        <button type="button" className="photo-lightbox__btn photo-lightbox__btn--close" onClick={onClose} aria-label={t('gallery.close')}>
          <Icon size={20}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
        </button>
        <button type="button" className="photo-lightbox__btn photo-lightbox__btn--prev" onClick={e => { e.stopPropagation(); onPrev() }} aria-label={t('gallery.prev')}>
          <Icon size={26}><polyline points="15 18 9 12 15 6" /></Icon>
        </button>
        <button type="button" className="photo-lightbox__btn photo-lightbox__btn--next" onClick={e => { e.stopPropagation(); onNext() }} aria-label={t('gallery.next')}>
          <Icon size={26}><polyline points="9 18 15 12 9 6" /></Icon>
        </button>

        <div className="photo-lightbox__content" onClick={e => e.stopPropagation()}>
          <img className="photo-lightbox__img" src={photo.img} alt={photo.title} />
          <div className="photo-lightbox__caption">
            <div className="photo-lightbox__title" lang="uz">{photo.title}</div>
            {photo.desc && <div className="photo-lightbox__desc" lang="uz">{photo.desc}</div>}
            <div className="photo-lightbox__count">{index + 1} / {total}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
