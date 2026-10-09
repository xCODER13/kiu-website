import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ContentLangNote from '../i18n/ContentLangNote'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import ThumbImg from '../components/ThumbImg'
import ItemsBrowser from './gallery/ItemsBrowser'
import Lightbox from './gallery/Lightbox'
import SectionModal from './gallery/SectionModal'

const API = import.meta.env.VITE_API_URL

// «Talabalar hayoti» bo'limlari (backend `utils/studentLifeSections.js` bilan bir xil kalitlar; ketma-ketlik — chiplardagi tartib)
const SECTION_KEYS = ['club', 'sport', 'campus']

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
)

// Rasmsiz karta uchun yangiliklar kartasidagi bilan bir xil placeholder
const Placeholder = () => (
  <div className="news-card-ph">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
  </div>
)

// Kartaning o'zi ham bosiladi (sichqoncha qulayligi); klaviatura va ekran o'quvchi uchun haqiqiy `<button>` bor (bosish karta handleriga ko'tariladi).
// Sana va ko'rishlar soni yo'q: bo'lim elementlarida sana ma'nosiz (tartibni admin `order` bilan boshqaradi).
function SectionCard({ item, label, onOpen }) {
  const { t } = useTranslation()
  return (
    <div className="card card-link news-card news-card--click" data-section={item.section} onClick={() => onOpen(item)}>
      {item.image
        ? <ThumbImg src={item.image} alt="" loading="lazy" className="news-card-img" onError={e => { e.currentTarget.dataset.broken = 'true' }} />
        : <Placeholder />}
      <div className="news-card-body">
        <div className="news-card-meta">
          <span className="news-card-cat">
            <span className="cat-dot" aria-hidden="true" />
            {label}
          </span>
        </div>
        <h2 lang="uz" className="news-card-title">{item.title}</h2>
        {item.desc && <p lang="uz" className="news-card-text">{item.desc}</p>}
        <div className="news-card-foot news-card-foot--end">
          <button type="button" className="btn btn-primary btn-sm news-card-btn" aria-label={`${t('gallery.more')}: ${item.title}`}>
            {t('gallery.more')}
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function PhotoCard({ photo, onOpen }) {
  const { t } = useTranslation()
  return (
    <div className="card card-link news-card news-card--click" data-section="photo" onClick={onOpen}>
      <ThumbImg src={photo.img} alt={photo.title} loading="lazy" className="news-card-img" onError={e => { e.currentTarget.dataset.broken = 'true' }} />
      <div className="news-card-body">
        <h2 lang="uz" className="news-card-title">{photo.title}</h2>
        {photo.desc && <p lang="uz" className="news-card-text">{photo.desc}</p>}
        <div className="news-card-foot news-card-foot--end">
          <button type="button" className="btn btn-primary btn-sm news-card-btn" aria-label={`${t('gallery.view')}: ${photo.title}`}>
            {t('gallery.view')}
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
      <p className="empty-state-title">{text}</p>
    </div>
  )
}

export default function Gallery() {
  const { t } = useTranslation()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sections, setSections] = useState([])        // admin boshqaradigan klub / sport / kampus elementlari
  const [sectionsLoading, setSectionsLoading] = useState(true)
  const [tab, setTab] = useState(null)                // null = hali tanlanmagan (avtomatik)
  const [openSection, setOpenSection] = useState(null) // modalda ochilgan bo'lim elementi
  const [lightbox, setLightbox] = useState(null)       // { list, index } — filtrlangan rasmlar ichida

  useEffect(() => {
    fetch(`${API}/api/gallery`)
      .then(r => r.json())
      .then(d => setAlbums(Array.isArray(d) ? d : []))
      .catch(err => { console.error('Galereya yuklashda xatolik:', err); setError(true) })
      .finally(() => setLoading(false))
  }, [])

  // Bo'limlar ixtiyoriy: yuklanmasa yoki bo'sh bo'lsa sahifa «Fotogalereya» tabini ochadi, xato banner chiqmaydi.
  // Javob massiv bo'lmasa yoki element noma'lum bo'limga tegishli bo'lsa e'tiborga olinmaydi.
  useEffect(() => {
    fetch(`${API}/api/student-life`)
      .then(r => r.json())
      .then(d => setSections(Array.isArray(d)
        ? d.filter(i => i && SECTION_KEYS.includes(i.section) && typeof i.title === 'string' && i.title).map(i => ({ ...i, group: i.section }))
        : []))
      .catch(err => console.error("Talabalar hayoti bo'limlarini yuklashda xatolik:", err))
      .finally(() => setSectionsLoading(false))
  }, [])

  // Har bir albom (title+desc+bir nechta rasm) har bir rasmga "yoyiladi": sarlavha/tavsif albomdan meros qilinadi,
  // chip — albom (`group` = albom id).
  const photos = useMemo(() => albums.flatMap(album =>
    (album.images || []).map((img, i) => ({ id: `${album._id}_${i}`, group: album._id, title: album.title, desc: album.desc, img }))
  ), [albums])

  const sectionGroups = useMemo(
    () => SECTION_KEYS.filter(key => sections.some(i => i.section === key)).map(key => ({ key, section: key, label: t(`gallery.sections.${key}`) })),
    [sections, t],
  )
  const albumGroups = useMemo(
    () => albums.filter(a => photos.some(p => p.group === a._id)).map(a => ({ key: a._id, label: a.title })),
    [albums, photos],
  )
  // Bo'limlar chiplar tartibida (klub → sport → kampus), har birida admin `order` tartibi (backend allaqachon shunday beradi)
  const orderedSections = useMemo(
    () => SECTION_KEYS.flatMap(key => sections.filter(i => i.section === key)),
    [sections],
  )

  const pending = loading || sectionsLoading
  // Bo'limlar bo'sh bo'lsa sahifa o'zi «Fotogalereya» tabini ochadi; foydalanuvchi tanlasa — uning tanlovi
  const activeTab = tab ?? (sections.length > 0 ? 'sections' : 'photos')

  const total = lightbox ? lightbox.list.length : 0
  const closeLightbox = () => setLightbox(null)
  const prev = () => setLightbox(l => ({ ...l, index: (l.index - 1 + l.list.length) % l.list.length }))
  const next = () => setLightbox(l => ({ ...l, index: (l.index + 1) % l.list.length }))

  const lightboxOpen = lightbox !== null
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = e => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(l => ({ ...l, index: (l.index + 1) % l.list.length }))
      if (e.key === 'ArrowLeft') setLightbox(l => ({ ...l, index: (l.index - 1 + l.list.length) % l.list.length }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  const tabs = [
    { key: 'sections', label: t('gallery.tabs.sections'), count: sections.length, icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></> },
    { key: 'photos', label: t('gallery.photos'), count: photos.length, icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></> },
  ]

  const showSectionsEmpty = !pending && activeTab === 'sections' && sections.length === 0
  const showPhotosEmpty = !pending && activeTab === 'photos' && photos.length === 0 && !error
  // Tab bo'sh bo'lsa sahifa pastga cho'zilmasin (footer ko'tarilib ketmasin): avvalgi `page-body--error|empty` qoidasi
  const tabEmpty = activeTab === 'sections' ? sections.length === 0 : photos.length === 0
  const bodyMod = !pending && tabEmpty ? (error ? ' page-body--error' : ' page-body--empty') : ''

  return (
    <div className="fade-up">
      <PageHero title={t('gallery.title')} sub={t('gallery.subtitle')} note={<ContentLangNote />}>
        <div className="kiu-tab-wrap">
          {tabs.map(tb => (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className="kiu-tab-btn"
              data-active={activeTab === tb.key}
              aria-pressed={activeTab === tb.key}
            >
              <span className="kiu-tab-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{tb.icon}</svg>
              </span>
              {tb.label}
              {tb.count > 0 && <span className="kiu-tab-badge">{tb.count}</span>}
            </button>
          ))}
        </div>
      </PageHero>

      <section className={`page-body${bodyMod}`}>
        <div className="container news-flow">
          {pending && (
            <div className="page-loading">
              <div className="spinner" />
              {t('common.loading')}
            </div>
          )}

          {!pending && error && (
            <div className="notice-banner" data-tone="danger" role="alert">
              <Icon size={20}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>
              <span>{t('gallery.error')}</span>
            </div>
          )}

          {showSectionsEmpty && <EmptyState text={t('gallery.sectionsEmpty')} />}
          {showPhotosEmpty && <EmptyState text={t('gallery.empty')} />}

          {!pending && activeTab === 'sections' && sections.length > 0 && (
            <ItemsBrowser
              key="sections"
              items={orderedSections}
              groups={sectionGroups}
              renderCard={it => (
                <SectionCard key={it._id} item={it} label={t(`gallery.sections.${it.section}`)} onOpen={setOpenSection} />
              )}
            />
          )}

          {!pending && activeTab === 'photos' && photos.length > 0 && (
            <ItemsBrowser
              key="photos"
              items={photos}
              groups={albumGroups}
              renderCard={(p, i, list) => (
                <PhotoCard key={p.id} photo={p} onOpen={() => setLightbox({ list, index: i })} />
              )}
            />
          )}
        </div>
      </section>

      {openSection && (
        <SectionModal item={openSection} label={t(`gallery.sections.${openSection.section}`)} onClose={() => setOpenSection(null)} />
      )}
      {lightbox && lightbox.list[lightbox.index] && (
        <Lightbox photo={lightbox.list[lightbox.index]} index={lightbox.index} total={total} onClose={closeLightbox} onPrev={prev} onNext={next} />
      )}
    </div>
  )
}
