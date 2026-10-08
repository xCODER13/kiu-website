import { useEffect, useMemo, useRef, useState } from 'react'
import { API, H, HF, errorMessage } from './shared/api'
import { Ic } from './shared/Icons.jsx'
import { markBroken, formatCount, eventDateKey, formatEventDate, eventTile, todayKey, isPastEvent } from './shared/helpers'
import { useSingleImageUpload } from './shared/useImageUpload'
import { useApiGet } from './shared/useApiGet'
import { ErrorBanner, ErrorPanel, EmptyState } from './shared/StateViews.jsx'
import ConfirmDialog from './shared/ConfirmDialog.jsx'
import { EVENT_TYPES } from './shared/constants'
import EventsForm from './EventsForm.jsx'

const EMPTY = { title: '', desc: '', eventDate: '', type: 'general' }
const KEPT = "kiritilgan ma'lumotlar saqlanib turibdi, qayta urinib ko'ring."

// Tur → chip rangi (`--chart-1…6`, 4.4); noma'lum tur — neytral (0) va o'z nomi bilan ko'rsatiladi.
const TYPE_BY_VALUE = Object.fromEntries(EVENT_TYPES.map(t => [t.value, t]))
const typeInfo = v => TYPE_BY_VALUE[v || 'general'] ?? { label: v, tone: 0 }

// Fayl xatosi (hook'dan keladi) → poster maydoni ostidagi xabar
function posterErrorText({ kind, file }) {
  if (kind === 'type') return 'Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP, GIF).'
  return `${file.name} — 5 MB dan katta. Boshqa rasm tanlang.`
}

// Yuklanmoqda: taxtadagi skelet (`aria-busy`), qatorlar bilan bir xil joylashuv — sahifa sakramaydi
function EventsSkeleton() {
  return (
    <ul className="adm-items adm-skel-list" aria-busy="true" role="status">
      <li className="adm-sr-only">Yuklanmoqda...</li>
      {[0, 1, 2].map(i => (
        <li key={i} className="adm-card adm-item" aria-hidden="true">
          <div className="adm-skel adm-skel--tile" />
          <div className="adm-skel adm-skel--poster" />
          <div className="adm-item-main adm-skel-col">
            <div className="adm-skel adm-skel--name" />
            <div className="adm-skel adm-skel--line" />
            <div className="adm-skel adm-skel--line adm-skel--short" />
          </div>
          <div className="adm-item-actions">
            <div className="adm-skel adm-skel--edit" />
            <div className="adm-skel adm-skel--icon" />
          </div>
        </li>
      ))}
    </ul>
  )
}

// Bitta qator: sana plitkasi (har doim) · ixtiyoriy poster · tur / sana (yil bilan) / ko'rishlar · sarlavha · tavsif boshi
function EventRow({ e, past, onEdit, onDelete }) {
  const tile = eventTile(e.eventDate)
  const type = typeInfo(e.type)
  return (
    <li className="adm-card adm-item">
      <div className="adm-date-tile" data-past={past ? 'true' : 'false'} aria-hidden="true">
        <span className="adm-date-day">{tile.day}</span>
        <span className="adm-date-month">{tile.month}</span>
      </div>
      {e.image && (
        <div className="adm-item-poster" aria-hidden="true">
          <img className="adm-item-poster-img" src={e.image} alt="" loading="lazy" onError={markBroken} />
        </div>
      )}
      <div className="adm-item-main">
        <div className="adm-item-meta">
          <span className="adm-cat" data-cat={type.tone}><span className="adm-cat-dot" aria-hidden="true" />{type.label}</span>
          {past && <span className="adm-badge-past">O'tgan</span>}
          <span className="adm-meta">{Ic.events}<span className="adm-sr-only">Sana: </span>{formatEventDate(e.eventDate)}</span>
          <span className="adm-meta" title="Ko'rishlar soni">{Ic.eye}<span className="adm-sr-only">Ko'rishlar: </span>{formatCount(e.views)}</span>
        </div>
        <h4 className="adm-item-title">{e.title}</h4>
        {e.desc && <p className="adm-item-text">{e.desc}</p>}
      </div>
      <div className="adm-item-actions">
        <button type="button" className="btn btn-secondary btn-sm adm-item-edit" aria-label={`Tahrirlash: ${e.title}`} onClick={() => onEdit(e)}>
          {Ic.edit}Tahrirlash
        </button>
        <button type="button" className="btn btn-danger adm-icon-btn" aria-label={`O'chirish: ${e.title}`} onClick={() => onDelete(e)}>
          {Ic.trash}
        </button>
      </div>
    </li>
  )
}

function EventsSection({ id, title, items, past, onEdit, onDelete }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby={id} className="adm-sec">
      <div className="adm-sec-head">
        <h3 id={id} className="adm-sec-title">{title}</h3>
        <span className="adm-count-pill adm-count-pill--sm">{items.length}</span>
      </div>
      <ul className="adm-items">
        {items.map(e => <EventRow key={e._id} e={e} past={past} onEdit={onEdit} onDelete={onDelete} />)}
      </ul>
    </section>
  )
}

export default function EventsAdmin() {
  const res = useApiGet('/events', 'Tadbirlarni yuklash')
  const failed = res.error || (!res.loading && !Array.isArray(res.data))
  const events = useMemo(() => (Array.isArray(res.data) ? res.data : []), [res.data])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)        // tahrirlanayotgan tadbir `_id` si
  const [values, setValues] = useState(EMPTY)
  const [initial, setInitial] = useState({ values: EMPTY, image: '' })  // «o'zgardimi?» taqqoslash uchun
  const [errors, setErrors] = useState({})
  const [posterError, setPosterError] = useState('')
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const [leave, setLeave] = useState(null)            // saqlanmagan o'zgarishlar dialogi kutayotgan amal
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')
  const [focusKey, setFocusKey] = useState(0)         // forma ochilganda sarlavhaga fokus
  const [refocus, setRefocus] = useState(0)           // forma yopilganda / o'chirilgandan keyin sahifa sarlavhasiga fokus
  const titleRef = useRef(null)
  const dateRef = useRef(null)
  const headingRef = useRef(null)

  const poster = useSingleImageUpload({ onError: e => setPosterError(posterErrorText(e)) })

  useEffect(() => { if (focusKey > 0) titleRef.current?.focus() }, [focusKey])
  useEffect(() => { if (refocus > 0) headingRef.current?.focus() }, [refocus])

  const dirty = open && (
    values.title !== initial.values.title ||
    values.desc !== initial.values.desc ||
    values.eventDate !== initial.values.eventDate ||
    values.type !== initial.values.type ||
    !!poster.imageFile ||
    (poster.imagePreview || '') !== initial.image
  )

  function resetFeedback() { setErrors({}); setPosterError(''); setServerError('') }

  function openNew() {
    setEditing(null); setValues(EMPTY); setInitial({ values: EMPTY, image: '' })
    poster.reset(null); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function openEdit(e) {
    const v = { title: e.title, desc: e.desc || '', eventDate: eventDateKey(e.eventDate), type: e.type || 'general' }
    setEditing(e._id); setValues(v); setInitial({ values: v, image: e.image || '' })
    poster.reset(e.image || null); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function closeForm() {
    setOpen(false); setEditing(null); setValues(EMPTY); setInitial({ values: EMPTY, image: '' })
    poster.reset(null); resetFeedback(); setRefocus(k => k + 1)
  }

  // Forma o'zgargan bo'lsa «Bekor», «X», boshqa tadbirni tahrirlash va «Yangi tadbir» jimgina tozalamaydi — dialog so'raydi
  function requestNew() {
    if (!open) return openNew()
    if (!editing) return titleRef.current?.focus()   // yangi forma allaqachon ochiq
    if (dirty) return setLeave({ type: 'new' })
    openNew()
  }
  function requestEdit(e) {
    if (editing === e._id) return titleRef.current?.focus()
    if (open && dirty) return setLeave({ type: 'edit', item: e })
    openEdit(e)
  }
  function requestClose() {
    if (dirty) setLeave({ type: 'close' })
    else closeForm()
  }
  function confirmLeave() {
    const action = leave
    setLeave(null)
    if (action.type === 'new') openNew()
    else if (action.type === 'edit') openEdit(action.item)
    else closeForm()
  }

  function change(field, value) {
    setValues(v => ({ ...v, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  function pickFile(file) {
    setPosterError('')
    poster.addFile(file)
  }

  async function save(e) {
    e.preventDefault()
    if (saving) return
    const title = values.title.trim()
    const next = {}
    if (!title) next.title = 'Sarlavha kiritilishi shart.'
    if (!values.eventDate) next.eventDate = 'Sanani tanlang.'
    setErrors(next)
    if (next.title) return titleRef.current?.focus()
    if (next.eventDate) return dateRef.current?.focus()

    // Poster — yangi tanlangan bo'lsa haqiqiy fayl sifatida, bo'lmasa mavjud URL (`existingImage`) yoki olib tashlangan
    // bo'lsa bo'sh satr. Yuklash backendda (service_role kalit serverda) amalga oshadi.
    const fd = new FormData()
    fd.append('title', title)
    fd.append('desc', values.desc)
    fd.append('eventDate', values.eventDate)
    fd.append('type', values.type)
    fd.append('existingImage', poster.imageFile ? '' : poster.imagePreview || '')
    if (poster.imageFile) fd.append('imageFile', poster.imageFile)

    setSaving(true)
    setServerError('')
    try {
      const url = editing ? `${API}/events/${editing}` : `${API}/events`
      const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: HF(), body: fd })
      if (!r.ok) {
        const msg = await errorMessage(r, 'Tadbir saqlanmadi.')
        return setServerError(`${msg.replace(/[.!\s]+$/, '')} — ${KEPT}`)
      }
      const data = await r.json()
      const id = editing
      res.mutate(list => (Array.isArray(list) ? (id ? list.map(x => (x._id === id ? data : x)) : [data, ...list]) : list))
      closeForm()
    } catch {
      setServerError(`Tadbir saqlanmadi. Server bilan bog'lanib bo'lmadi — ${KEPT}`)
    } finally {
      // Tarmoq xatosida ham tugma qayta faollashadi
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!toDelete || deleting) return
    const { _id: id } = toDelete
    setDeleting(true)
    try {
      const r = await fetch(`${API}/events/${id}`, { method: 'DELETE', headers: H() })
      if (!r.ok) {
        setNotice(await errorMessage(r, "O'chirib bo'lmadi."))
      } else {
        res.mutate(list => (Array.isArray(list) ? list.filter(x => x._id !== id) : list))
        if (editing === id) closeForm()
        else setRefocus(k => k + 1)
      }
    } catch {
      setNotice("Server bilan bog'lanib bo'lmadi.")
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  // Kelgusi — sana o'sish tartibida (eng yaqini tepada), o'tgan — kamayish tartibida (eng yangisi tepada).
  // Tadbir kuni (bugun) hali «kelgusi». Admin ro'yxati avval o'sish tartibida va guruhsiz edi — yangi tadbir oxirda «yo'qolardi».
  const { upcoming, past } = useMemo(() => {
    const today = todayKey()
    const key = e => eventDateKey(e.eventDate)
    const up = [], pa = []
    for (const e of events) (isPastEvent(e.eventDate, today) ? pa : up).push(e)
    up.sort((a, b) => key(a).localeCompare(key(b)))
    pa.sort((a, b) => key(b).localeCompare(key(a)))
    return { upcoming: up, past: pa }
  }, [events])

  return (
    <div>
      {notice && <ErrorBanner onDismiss={() => setNotice('')}>{notice}</ErrorBanner>}

      <div className="adm-page-head">
        <div className="adm-page-head-title">
          <h2 className="adm-page-title" ref={headingRef} tabIndex={-1}>Tadbirlar</h2>
          <span className="adm-count-pill"><span className="adm-sr-only">Jami: </span>{res.loading || failed ? '–' : events.length}</span>
        </div>
        <button type="button" className="btn btn-primary" onClick={requestNew}>{Ic.add}Yangi tadbir</button>
      </div>

      {open && (
        <EventsForm
          isEditing={!!editing}
          values={values}
          onChange={change}
          errors={errors}
          poster={poster}
          posterError={posterError}
          onFile={pickFile}
          saving={saving}
          serverError={serverError}
          titleRef={titleRef}
          dateRef={dateRef}
          onSubmit={save}
          onClose={requestClose}
        />
      )}

      {res.loading ? <EventsSkeleton /> : failed ? (
        <ErrorPanel title="Tadbirlarni yuklab bo'lmadi." onRetry={res.reload}>
          Internet aloqasini tekshiring yoki birozdan keyin qayta urinib ko'ring.
        </ErrorPanel>
      ) : events.length === 0 ? (
        !open && (
          <EmptyState
            icon={Ic.events}
            title="Hali tadbir yo'q"
            action={<button type="button" className="btn btn-primary adm-empty-action" onClick={openNew}>{Ic.add}Yangi tadbir</button>}
          >
            Birinchi tadbirni qo'shing — u saytning «Tadbirlar» sahifasida ko'rinadi.
          </EmptyState>
        )
      ) : (
        <>
          <EventsSection id="event-sec-upcoming" title="Kelgusi tadbirlar" items={upcoming} past={false} onEdit={requestEdit} onDelete={setToDelete} />
          <EventsSection id="event-sec-past" title="O'tgan tadbirlar" items={past} past onEdit={requestEdit} onDelete={setToDelete} />
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Tadbirni o'chirishni tasdiqlaysizmi?"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          <strong>«{toDelete.title}»</strong> tadbiri butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.
        </ConfirmDialog>
      )}

      {leave && (
        <ConfirmDialog
          tone="warning"
          title="Saqlanmagan o'zgarishlar bor"
          confirmLabel="Chiqish"
          cancelLabel="Tahrirlashda qolish"
          onConfirm={confirmLeave}
          onCancel={() => setLeave(null)}
        >
          O'zgarishlar saqlanmagan. Chiqsangiz, kiritilgan ma'lumotlar yo'qoladi.
        </ConfirmDialog>
      )}
    </div>
  )
}
