import { useEffect, useMemo, useRef, useState } from 'react'
import { API, H, HF, errorMessage } from './shared/api'
import { Ic } from './shared/Icons.jsx'
import { markBroken, formatCount } from './shared/helpers'
import { useSingleImageUpload } from './shared/useImageUpload'
import { useApiGet } from './shared/useApiGet'
import { ErrorBanner, ErrorPanel, EmptyState } from './shared/StateViews.jsx'
import ConfirmDialog from './shared/ConfirmDialog.jsx'
import ThumbImg from '../../components/ThumbImg'
import { STUDENT_LIFE_SECTIONS, SL_ORDER_MAX } from './shared/constants'
import SectionForm from './SectionForm.jsx'

const EMPTY = { section: 'club', title: '', desc: '', link: '', order: '0' }
const KEPT = "kiritilgan ma'lumotlar saqlanib turibdi, qayta urinib ko'ring."
const SECTION_LABEL = Object.fromEntries(STUDENT_LIFE_SECTIONS.map(s => [s.value, s.label]))
const SECTION_RANK = Object.fromEntries(STUDENT_LIFE_SECTIONS.map((s, i) => [s.value, i]))
const SAFE_LINK = /^https:\/\/[^\s<>"'`\\]+$/i

// Backend tartibi bilan bir xil (bo'lim → tartib raqami → yangisi oldin); bo'limlar ro'yxatdagi (sayt) ketma-ketlikda
function sortItems(list) {
  return [...list].sort((a, b) =>
    (SECTION_RANK[a.section] ?? 99) - (SECTION_RANK[b.section] ?? 99) ||
    (a.order ?? 0) - (b.order ?? 0) ||
    String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

function posterErrorText({ kind, file }) {
  if (kind === 'type') return 'Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP, GIF).'
  return `${file.name} — 5 MB dan katta. Boshqa rasm tanlang.`
}

function SectionsSkeleton() {
  return (
    <ul className="adm-items adm-skel-list" aria-busy="true" role="status">
      <li className="adm-sr-only">Yuklanmoqda...</li>
      {[0, 1, 2].map(i => (
        <li key={i} className="adm-card adm-item" aria-hidden="true">
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

function SectionRow({ item, onEdit, onDelete }) {
  return (
    <li className="adm-card adm-item">
      {item.image && (
        <div className="adm-item-poster" aria-hidden="true">
          <ThumbImg className="adm-item-poster-img" src={item.image} alt="" loading="lazy" onError={markBroken} />
        </div>
      )}
      <div className="adm-item-main">
        <div className="adm-item-meta">
          <span className="adm-meta" title="Tartib raqami"><span className="adm-sr-only">Tartib raqami: </span>№ {item.order ?? 0}</span>
          {item.link && <span className="adm-meta">{Ic.link}<span className="adm-sr-only">Havola bor</span></span>}
        </div>
        <h4 className="adm-item-title">{item.title}</h4>
        {item.desc && <p className="adm-item-text">{item.desc}</p>}
      </div>
      <div className="adm-item-actions">
        <button type="button" className="btn btn-secondary btn-sm adm-item-edit" aria-label={`Tahrirlash: ${item.title}`} onClick={() => onEdit(item)}>
          {Ic.edit}Tahrirlash
        </button>
        <button type="button" className="btn btn-danger adm-icon-btn" aria-label={`O'chirish: ${item.title}`} onClick={() => onDelete(item)}>
          {Ic.trash}
        </button>
      </div>
    </li>
  )
}

export default function SectionsAdmin() {
  const res = useApiGet('/student-life', "Bo'limlarni yuklash")
  const failed = res.error || (!res.loading && !Array.isArray(res.data))
  const items = useMemo(() => (Array.isArray(res.data) ? sortItems(res.data) : []), [res.data])

  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [values, setValues] = useState(EMPTY)
  const [initial, setInitial] = useState({ values: EMPTY, image: '' })
  const [errors, setErrors] = useState({})
  const [posterError, setPosterError] = useState('')
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const [leave, setLeave] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')
  const [focusKey, setFocusKey] = useState(0)
  const [refocus, setRefocus] = useState(0)
  const titleRef = useRef(null)
  const headingRef = useRef(null)

  const poster = useSingleImageUpload({ onError: e => setPosterError(posterErrorText(e)) })

  useEffect(() => { if (focusKey > 0) titleRef.current?.focus() }, [focusKey])
  useEffect(() => { if (refocus > 0) headingRef.current?.focus() }, [refocus])

  const dirty = open && (
    Object.keys(EMPTY).some(k => values[k] !== initial.values[k]) ||
    !!poster.imageFile ||
    (poster.imagePreview || '') !== initial.image
  )

  const counts = useMemo(() => {
    const c = { all: items.length }
    for (const s of STUDENT_LIFE_SECTIONS) c[s.value] = items.filter(i => i.section === s.value).length
    return c
  }, [items])

  function resetFeedback() { setErrors({}); setPosterError(''); setServerError('') }

  function openNew() {
    // Filtr tanlangan bo'lsa yangi element shu bo'limga tushadi
    const v = { ...EMPTY, section: filter === 'all' ? EMPTY.section : filter }
    setEditing(null); setValues(v); setInitial({ values: v, image: '' })
    poster.reset(null); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function openEdit(item) {
    const v = {
      section: item.section, title: item.title, desc: item.desc || '', link: item.link || '', order: String(item.order ?? 0),
    }
    setEditing(item._id); setValues(v); setInitial({ values: v, image: item.image || '' })
    poster.reset(item.image || null); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function closeForm() {
    setOpen(false); setEditing(null); setValues(EMPTY); setInitial({ values: EMPTY, image: '' })
    poster.reset(null); resetFeedback(); setRefocus(k => k + 1)
  }

  function requestNew() {
    if (!open) return openNew()
    if (!editing) return titleRef.current?.focus()
    if (dirty) return setLeave({ type: 'new' })
    openNew()
  }
  function requestEdit(item) {
    if (editing === item._id) return titleRef.current?.focus()
    if (open && dirty) return setLeave({ type: 'edit', item })
    openEdit(item)
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

  function onFile(file) {
    setPosterError('')
    poster.addFile(file)
  }

  function validate() {
    const e = {}
    if (!values.title.trim()) e.title = 'Nomini kiriting.'
    const link = values.link.trim()
    if (link && !SAFE_LINK.test(link)) e.link = 'Havola https:// bilan boshlanishi kerak (masalan, https://t.me/kanal).'
    const n = Number(values.order)
    if (values.order === '' || !Number.isInteger(n) || n < 0 || n > SL_ORDER_MAX) e.order = `Tartib raqami 0 dan ${SL_ORDER_MAX} gacha butun son bo'lsin.`
    return e
  }

  async function save(e) {
    e.preventDefault()
    if (saving) return
    const errs = validate()
    setErrors(errs)
    if (errs.title) return titleRef.current?.focus()
    if (errs.link) return document.getElementById('section-link')?.focus()
    if (errs.order) return document.getElementById('section-order')?.focus()

    // Rasm backend orqali yuklanadi (Supabase kaliti serverda). Yangi fayl bo'lsa u ustun; bo'lmasa mavjud URL (`existingImage`),
    // olib tashlangan bo'lsa bo'sh satr — backend eski rasmni Storage'dan o'chiradi.
    const fd = new FormData()
    fd.append('section', values.section)
    fd.append('title', values.title.trim())
    fd.append('desc', values.desc)
    fd.append('link', values.link.trim())
    fd.append('order', String(Number(values.order)))
    fd.append('existingImage', poster.imageFile ? '' : poster.imagePreview || '')
    if (poster.imageFile) fd.append('imageFile', poster.imageFile)

    setSaving(true)
    setServerError('')
    try {
      const url = editing ? `${API}/student-life/${editing}` : `${API}/student-life`
      const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: HF(), body: fd })
      if (!r.ok) {
        const msg = await errorMessage(r, 'Saqlanmadi.')
        return setServerError(`${msg.replace(/[.!\s]+$/, '')} — ${KEPT}`)
      }
      const data = await r.json()
      const id = editing
      res.mutate(list => (Array.isArray(list) ? (id ? list.map(x => (x._id === id ? data : x)) : [data, ...list]) : list))
      closeForm()
    } catch {
      setServerError(`Saqlanmadi. Server bilan bog'lanib bo'lmadi — ${KEPT}`)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!toDelete || deleting) return
    const { _id: id } = toDelete
    setDeleting(true)
    try {
      const r = await fetch(`${API}/student-life/${id}`, { method: 'DELETE', headers: H() })
      // 404 — boshqa admin allaqachon o'chirgan: natija bir xil
      if (!r.ok && r.status !== 404) {
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

  const visible = filter === 'all' ? items : items.filter(i => i.section === filter)
  const groups = STUDENT_LIFE_SECTIONS.map(s => ({ ...s, rows: visible.filter(i => i.section === s.value) })).filter(g => g.rows.length > 0)

  return (
    <div>
      {notice && <ErrorBanner onDismiss={() => setNotice('')}>{notice}</ErrorBanner>}

      <div className="adm-page-head">
        <div className="adm-page-head-title">
          <h2 className="adm-page-title" ref={headingRef} tabIndex={-1}>Bo'limlar</h2>
          <span className="adm-count-pill"><span className="adm-sr-only">Jami: </span>{res.loading || failed ? '–' : items.length}</span>
          <span className="adm-page-head-sub">klublar, sport va kampus hayoti</span>
        </div>
        <button type="button" className="btn btn-primary" onClick={requestNew}>{Ic.add}Yangi element</button>
      </div>

      {open && (
        <SectionForm
          isEditing={!!editing}
          values={values}
          onChange={change}
          errors={errors}
          poster={poster}
          posterError={posterError}
          onFile={onFile}
          saving={saving}
          serverError={serverError}
          titleRef={titleRef}
          onSubmit={save}
          onClose={requestClose}
        />
      )}

      {res.loading ? <SectionsSkeleton /> : failed ? (
        <ErrorPanel title="Bo'limlarni yuklab bo'lmadi." onRetry={res.reload}>
          Internet aloqasini tekshiring yoki birozdan keyin qayta urinib ko'ring.
        </ErrorPanel>
      ) : (
        <>
          {items.length > 0 && (
            <div className="adm-filters adm-filters--spaced" role="group" aria-label="Bo'lim bo'yicha filtr">
              {[{ value: 'all', label: 'Hammasi' }, ...STUDENT_LIFE_SECTIONS].map(f => (
                <button key={f.value} type="button" className="adm-chip" data-active={filter === f.value} aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
                  {f.label}{' '}
                  <span className="adm-chip-count">{formatCount(counts[f.value])}</span>
                </button>
              ))}
            </div>
          )}

          {items.length === 0 ? (
            !open && (
              <EmptyState
                icon={Ic.gallery}
                title="Hali element yo'q"
                action={<button type="button" className="btn btn-primary adm-empty-action" onClick={openNew}>{Ic.add}Yangi element</button>}
              >
                Klub, sport yutug'i yoki kampus hayoti kartasini qo'shing — u saytning «Talabalar hayoti» sahifasida tegishli bo'limda chiqadi.
              </EmptyState>
            )
          ) : visible.length === 0 ? (
            <EmptyState icon={Ic.gallery} title="Bu bo'limda element yo'q">
              «{SECTION_LABEL[filter]}» bo'limiga hali hech narsa qo'shilmagan.
            </EmptyState>
          ) : (
            groups.map(g => (
              <section key={g.value} aria-labelledby={`sl-sec-${g.value}`} className="adm-sec">
                <div className="adm-sec-head">
                  <h3 id={`sl-sec-${g.value}`} className="adm-sec-title">{g.label}</h3>
                  <span className="adm-count-pill adm-count-pill--sm">{g.rows.length}</span>
                </div>
                <ul className="adm-items">
                  {g.rows.map(it => <SectionRow key={it._id} item={it} onEdit={requestEdit} onDelete={setToDelete} />)}
                </ul>
              </section>
            ))
          )}
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Elementni o'chirishni tasdiqlaysizmi?"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          <strong>«{toDelete.title}»</strong>{toDelete.image ? " va uning rasmi" : ''} butunlay o'chiriladi, saytdagi «Talabalar hayoti» sahifasidan ham yo'qoladi. Bu amalni qaytarib bo'lmaydi.
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
