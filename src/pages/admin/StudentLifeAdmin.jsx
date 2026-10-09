import { useRef, useState } from 'react'
import GalleryAdmin from './GalleryAdmin.jsx'
import SectionsAdmin from './SectionsAdmin.jsx'

const TABS = [
  { id: 'albums', label: 'Albomlar' },
  { id: 'sections', label: "Bo'limlar" },
]

// «Talabalar hayoti» admin sahifasi: ikki tab. Ikkalasi ham bir marta ochilgach DOM'da qoladi (faqat yashiriladi):
// tab almashganda yuklangan ro'yxat va yarim to'ldirilgan forma yo'qolmaydi. «Bo'limlar» birinchi ochilganda yuklanadi.
export default function StudentLifeAdmin() {
  const [tab, setTab] = useState('albums')
  const [visited, setVisited] = useState({ albums: true })
  const refs = useRef({})

  function select(id) {
    setTab(id)
    setVisited(v => (v[id] ? v : { ...v, [id]: true }))
  }

  // Klaviatura (WAI-ARIA tabs): ←/→ aylanma, Home/End
  function onKeyDown(e) {
    const i = TABS.findIndex(t => t.id === tab)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    if (next < 0) return
    e.preventDefault()
    select(TABS[next].id)
    refs.current[TABS[next].id]?.focus()
  }

  return (
    <div>
      <div className="adm-filters adm-tabs" role="tablist" aria-label="Talabalar hayoti bo'limlari" onKeyDown={onKeyDown}>
        {TABS.map(t => (
          <button
            key={t.id}
            ref={el => { refs.current[t.id] = el }}
            type="button"
            role="tab"
            id={`sl-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`sl-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className="adm-chip"
            data-active={tab === t.id}
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="sl-panel-albums" aria-labelledby="sl-tab-albums" hidden={tab !== 'albums'}>
        {visited.albums && <GalleryAdmin />}
      </div>
      <div role="tabpanel" id="sl-panel-sections" aria-labelledby="sl-tab-sections" hidden={tab !== 'sections'}>
        {visited.sections && <SectionsAdmin />}
      </div>
    </div>
  )
}
