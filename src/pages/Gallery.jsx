import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import ContentLangNote from '../i18n/ContentLangNote'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import ThumbImg from '../components/ThumbImg'
import useModalA11y from '../hooks/useModalA11y'

const API = import.meta.env.VITE_API_URL

// «Talabalar hayoti» bo'limlari (backend `utils/studentLifeSections.js` bilan bir xil kalitlar; ketma-ketlik — sahifadagi tartib)
const SECTION_KEYS = ['club', 'sport', 'campus']
// Havola `<a href>` ga tushadi: backend ham tekshiradi, bu yerda ikkinchi qatlam (faqat https://, bo'shliq/qo'shtirnoqsiz)
const SAFE_LINK = /^https:\/\/[^\s<>"'`\\]+$/i

// Katta rasm oynasi: fokus tuzog'i, Esc, scroll qulfi va fokusni qaytarish — `useModalA11y` (ApplyModal bilan bir xil).
// Strelka tugmalari va ← → klaviaturasi Gallery'da (window'da) boshqariladi.
function Lightbox({ photo, index, total, onClose, onPrev, onNext }) {
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

export default function Gallery() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)   // lightbox'da ko'rsatilayotgan rasm tartib raqami
  const [sections, setSections] = useState([])        // admin boshqaradigan klub / sport / kampus elementlari
  const [sectionsLoading, setSectionsLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/gallery`)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(err => { console.error('Galereya yuklashda xatolik:', err); setError(true) })
      .finally(() => setLoading(false))
  }, [])

  // Bo'limlar ixtiyoriy: yuklanmasa yoki bo'sh bo'lsa sahifa avvalgidek (faqat fotogalereya) ishlaydi, xato banner chiqmaydi.
  // Javob massiv bo'lmasa yoki element noma'lum bo'limga tegishli bo'lsa e'tiborga olinmaydi.
  useEffect(() => {
    fetch(`${API}/api/student-life`)
      .then(r => r.json())
      .then(d => setSections(Array.isArray(d) ? d.filter(i => i && SECTION_KEYS.includes(i.section) && typeof i.title === 'string' && i.title) : []))
      .catch(err => console.error("Talabalar hayoti bo'limlarini yuklashda xatolik:", err))
      .finally(() => setSectionsLoading(false))
  }, [])

  const groups = useMemo(
    () => SECTION_KEYS.map(key => ({ key, rows: sections.filter(i => i.section === key) })).filter(g => g.rows.length > 0),
    [sections],
  )

  // Har bir albom (title+desc+bir nechta rasm) grid'da alohida panelka
  // sifatida ko'rsatiladigan har bir rasmga "yoyiladi" — sarlavha/tavsif
  // albomdan meros qiladi, lightbox barcha rasmlar orasida ketma-ket o'tadi.
  const photos = useMemo(() => items.flatMap(item =>
    (item.images || []).map((img, i) => ({
      id: `${item._id}_${i}`,
      title: item.title,
      desc: item.desc,
      img,
    }))
  ), [items])

  const total = photos.length
  const pending = loading || sectionsLoading
  const hasSections = groups.length > 0
  const prev = () => setOpenIndex(i => (i - 1 + total) % total)
  const next = () => setOpenIndex(i => (i + 1) % total)

  useEffect(() => {
    if (openIndex === null) return
    const onKey = e => {
      if (e.key === 'Escape') setOpenIndex(null)
      if (e.key === 'ArrowRight') setOpenIndex(i => (i + 1) % total)
      if (e.key === 'ArrowLeft') setOpenIndex(i => (i - 1 + total) % total)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex, total])

  const open = i => setOpenIndex(i)

  return (
    <div className="fade-up">
      <PageHero title={t('gallery.title')} sub={t('gallery.subtitle')} note={<ContentLangNote />} />

      <section className={`page-body${!pending && error && !hasSections ? ' page-body--error' : ''}${!pending && !error && photos.length === 0 && !hasSections ? ' page-body--empty' : ''}`}>
        <div className={`container ${!pending && error && !hasSections ? 'container--920' : 'container-wide'}`}>
          {pending && (
            <div className="page-loading">
              <div className="spinner" />
              {t('common.loading')}
            </div>
          )}

          {!pending && hasSections && groups.map((g, gi) => (
            <div key={g.key} className="student-life-section">
              <h2 className={`section-title${gi > 0 ? ' page-block' : ''}`}>{t(`gallery.sections.${g.key}`)}</h2>
              <div className="cards-3">
                {g.rows.map((it, i) => (
                  <div key={it._id} className={`rv-item reveal reveal-delay-${(i % 3) + 1}`}>
                    <article className="card photo-card photo-card--static" data-slot={i % 6}>
                      <div className="photo-card__media">
                        {it.image && <ThumbImg src={it.image} alt="" loading="lazy" onError={e => { e.currentTarget.dataset.broken = 'true' }} />}
                      </div>
                      <div className="photo-card__body">
                        <h3 className="photo-card__title" lang="uz">{it.title}</h3>
                        {it.desc && <p className="photo-card__desc" lang="uz">{it.desc}</p>}
                        {it.link && SAFE_LINK.test(it.link) && (
                          <a
                            href={it.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm photo-card__link"
                            aria-label={`${t('gallery.more')}: ${it.title}`}
                          >
                            {t('gallery.more')}
                          </a>
                        )}
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!pending && hasSections && !error && photos.length > 0 && (
            <h2 className="section-title page-block">{t('gallery.photos')}</h2>
          )}

          {!pending && error && (
            <div className="notice-banner" data-tone="danger" role="alert">
              <Icon size={20}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>
              <span>{t('gallery.error')}</span>
            </div>
          )}

          {!pending && !error && photos.length === 0 && !hasSections && (
            <div className="photo-empty reveal">
              <div className="tile tile--64">
                <Icon size={30}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></Icon>
              </div>
              <p>{t('gallery.empty')}</p>
            </div>
          )}

          {!pending && !error && photos.length > 0 && (
            <div className="cards-3">
              {photos.map((p, i) => (
                <div key={p.id} className={`rv-item reveal reveal-delay-${(i % 3) + 1}`}>
                  {/* Kartalar klaviatura bilan ochiladi (Enter/Space) */}
                  <div
                    className="card card--lift photo-card"
                    data-slot={i % 6}
                    role="button"
                    tabIndex={0}
                    onClick={() => open(i)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i) } }}
                  >
                    <div className="photo-card__media">
                      <ThumbImg src={p.img} alt={p.title} loading="lazy" onError={e => { e.currentTarget.dataset.broken = 'true' }} />
                      <span className="photo-card__badge" aria-hidden="true">KIU</span>
                      <span className="photo-card__zoom" aria-hidden="true">
                        <Icon size={22}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></Icon>
                      </span>
                    </div>
                    <div className="photo-card__body">
                      <h2 className="photo-card__title" lang="uz">{p.title}</h2>
                      <p className="photo-card__desc" lang="uz">{p.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {openIndex !== null && photos[openIndex] && (
        <Lightbox photo={photos[openIndex]} index={openIndex} total={total} onClose={() => setOpenIndex(null)} onPrev={prev} onNext={next} />
      )}
    </div>
  )
}
