import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../../components/Icon'
import useModalA11y from '../../hooks/useModalA11y'

// Plakatni to'liq (qirqilmasdan) ko'rsatadigan oyna. Galereya lightbox'i bilan bir xil sirt (`.photo-lightbox`),
// lekin strelkalarsiz: bitta rasm. Fokus tuzog'i, Esc, scroll qulfi va fokusni qaytarish — `useModalA11y`.
export default function PosterLightbox({ src, alt, title, onClose }) {
  const { t } = useTranslation()
  const ref = useRef(null)
  // Orqa sahifa klaviatura/ekran o'quvchi uchun yopiladi (Galereya Lightbox'i bilan bir xil). Effektlar tartibi muhim:
  // yopilganda avval `inert` olinadi, keyin `useModalA11y` fokusni qaytaradi.
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.inert = true
    return () => { if (root) root.inert = false }
  }, [])
  useModalA11y(ref, onClose)

  // Portal: sahifa ildizidagi `transform` animatsiyasi `position: fixed` ni qamab qo'yadi — shuning uchun `document.body` ga chiqariladi.
  return createPortal(
    <div className="photo-lightbox photo-lightbox--poster" onClick={onClose}>
      <div ref={ref} className="photo-lightbox__dialog" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="photo-lightbox__btn photo-lightbox__btn--close" onClick={onClose} aria-label={t('futureStep.close')}>
          <Icon size={20}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
        </button>
        <div className="photo-lightbox__content" onClick={e => e.stopPropagation()}>
          <img className="photo-lightbox__img" src={src} alt={alt} />
        </div>
      </div>
    </div>,
    document.body
  )
}
