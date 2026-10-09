import { useEffect, useMemo, useRef, useState } from 'react'
import { API, H, HF, errorMessage } from './shared/api'
import { Ic } from './shared/Icons.jsx'
import { formatCount } from './shared/helpers'
import { useSingleImageUpload } from './shared/useImageUpload'
import { useApiGet } from './shared/useApiGet'
import { ErrorBanner, ErrorPanel, EmptyState } from './shared/StateViews.jsx'
import ConfirmDialog from './shared/ConfirmDialog.jsx'
import Avatar from './shared/Avatar.jsx'
import { KAFEDRALAR } from './shared/constants'
import TeachersForm from './TeachersForm.jsx'

const EMPTY = { name: '', role: '', dept: '', avatar: '' }
const KEPT = "kiritilgan ma'lumotlar saqlanib turibdi, qayta urinib ko'ring."

// Fayl xatosi (hook'dan keladi) → foto ostidagi xabar
function photoErrorText({ kind, file }) {
  if (kind === 'type') return `${file?.name ? `${file.name} — ` : ''}faqat JPEG, PNG, WebP yoki GIF qabul qilinadi.`
  return `${file.name} — 5 MB dan katta. Boshqa foto tanlang.`
}

// Yuklanmoqda: taxtadagi skelet (`aria-busy`), kartalar bilan bir xil joylashuv — sahifa sakramaydi
function TeacherSkeleton() {
  return (
    <ul className="adm-teachers adm-skel-list" aria-busy="true" role="status">
      <li className="adm-sr-only">Yuklanmoqda...</li>
      {[0, 1, 2].map(i => (
        <li key={i} className="adm-card adm-teacher" aria-hidden="true">
          <div className="adm-teacher-top">
            <div className="adm-skel adm-skel--avatar-lg" />
            <div className="adm-skel-col">
              <div className="adm-skel adm-skel--name" />
              <div className="adm-skel adm-skel--date" />
            </div>
          </div>
          <div className="adm-skel adm-skel--line" />
          <div className="adm-teacher-actions">
            <div className="adm-skel adm-skel--edit" />
            <div className="adm-skel adm-skel--icon" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function TeacherCard({ item, onEdit, onDelete }) {
  return (
    <li className="adm-card adm-teacher">
      <div className="adm-teacher-top">
        <Avatar name={item.name} avatar={item.avatar} image={item.image} />
        <div className="adm-teacher-id">
          <h4 className="adm-teacher-name" title={item.name}>{item.name}</h4>
          <span className="adm-teacher-role">{item.role}</span>
        </div>
      </div>
      <p className="adm-teacher-dept">{item.dept}</p>
      <div className="adm-teacher-actions">
        <button type="button" className="btn btn-secondary btn-sm adm-item-edit" aria-label={`Tahrirlash: ${item.name}`} onClick={() => onEdit(item)}>
          {Ic.edit}Tahrirlash
        </button>
        <button type="button" className="btn btn-danger adm-icon-btn" aria-label={`O'chirish: ${item.name}`} onClick={() => onDelete(item)}>
          {Ic.trash}
        </button>
      </div>
    </li>
  )
}

export default function TeachersAdmin() {
  const res = useApiGet('/teachers', "O'qituvchilarni yuklash")
  // Ruxsat etilgan kafedralar — serverdan (YAGONA manba, 1.5). Yuklanguncha yoki xato bo'lsa `KAFEDRALAR` nusxasi ishlatiladi:
  // forma va filtr hech qachon bo'sh qolmaydi (nusxa backend ro'yxati bilan testda solishtiriladi).
  const deptRes = useApiGet('/teachers/departments', 'Kafedralarni yuklash')
  const departments = Array.isArray(deptRes.data) && deptRes.data.length && deptRes.data.every(d => typeof d === 'string')
    ? deptRes.data
    : KAFEDRALAR
  const failed = res.error || (!res.loading && !Array.isArray(res.data))
  const items = useMemo(() => (Array.isArray(res.data) ? res.data : []), [res.data])

  // Qidiruv (ism bo'yicha) va kafedra filtri — mijoz tomonida: ro'yxat serverdan to'liq keladi (sahifalash yo'q)
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const deptOptions = useMemo(() => {
    const extra = [...new Set(items.map(t => t.dept).filter(d => d && !departments.includes(d)))].sort()
    return [...departments, ...extra]
  }, [items, departments])
  const q = query.trim().toLowerCase()
  const visible = useMemo(
    () => items.filter(t => (!deptFilter || t.dept === deptFilter) && (!q || (t.name || '').toLowerCase().includes(q))),
    [items, deptFilter, q],
  )
  const filtering = !!q || !!deptFilter

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)        // tahrirlanayotgan o'qituvchi `_id` si
  const [values, setValues] = useState(EMPTY)
  const [initial, setInitial] = useState({ values: EMPTY, image: '' })  // «o'zgardimi?» taqqoslash uchun
  const [errors, setErrors] = useState({})
  const [photoError, setPhotoError] = useState('')
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const [leave, setLeave] = useState(null)            // saqlanmagan o'zgarishlar dialogi kutayotgan amal
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')
  const [focusKey, setFocusKey] = useState(0)         // forma ochilganda ismga fokus
  const [refocus, setRefocus] = useState(0)           // forma yopilganda / o'chirilgandan keyin sarlavhaga fokus
  const nameRef = useRef(null)
  const headingRef = useRef(null)

  // Bitta foto hook'i (Tadbirlar bilan bir xil); fayl xatolari foto ostida
  const photo = useSingleImageUpload({ onError: e => setPhotoError(photoErrorText(e)) })

  useEffect(() => { if (focusKey > 0) nameRef.current?.focus() }, [focusKey])
  useEffect(() => { if (refocus > 0) headingRef.current?.focus() }, [refocus])

  // Hozir saqlangan (blob bo'lmagan) foto manzili: yangi fayl tanlangan bo'lsa — yo'q
  const currentImage = photo.imageFile ? '' : (photo.imagePreview || '')
  const dirty = open && (
    values.name !== initial.values.name ||
    values.role !== initial.values.role ||
    values.dept !== initial.values.dept ||
    values.avatar !== initial.values.avatar ||
    !!photo.imageFile ||
    currentImage !== initial.image
  )

  function resetFeedback() { setErrors({}); setPhotoError(''); setServerError('') }

  function openNew() {
    setEditing(null); setValues(EMPTY); setInitial({ values: EMPTY, image: '' })
    photo.reset(null); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function openEdit(item) {
    const v = { name: item.name || '', role: item.role || '', dept: item.dept || '', avatar: item.avatar || '' }
    setEditing(item._id); setValues(v); setInitial({ values: v, image: item.image || '' })
    photo.reset(item.image || null); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function closeForm() {
    setOpen(false); setEditing(null); setValues(EMPTY); setInitial({ values: EMPTY, image: '' })
    photo.reset(null); resetFeedback(); setRefocus(k => k + 1)
  }

  // Forma o'zgargan bo'lsa «Bekor», «X», boshqa o'qituvchini tahrirlash va «Yangi o'qituvchi» jimgina tozalamaydi — dialog so'raydi
  function requestNew() {
    if (!open) return openNew()
    if (!editing) return nameRef.current?.focus()   // yangi forma allaqachon ochiq
    if (dirty) return setLeave({ type: 'new' })
    openNew()
  }
  function requestEdit(item) {
    if (editing === item._id) return nameRef.current?.focus()
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

  function addPhoto(file) {
    setPhotoError('')
    photo.addFile(file)
  }

  async function save(e) {
    e.preventDefault()
    if (saving) return
    const name = values.name.trim()
    const role = values.role.trim()
    const errs = {}
    if (!name) errs.name = "To'liq ismni kiriting."
    if (!role) errs.role = 'Lavozimni kiriting.'
    if (!values.dept) errs.dept = 'Kafedrani tanlang.'
    else if (!departments.includes(values.dept)) errs.dept = "Kafedrani ro'yxatdan tanlang."
    setErrors(errs)
    if (errs.name) return nameRef.current?.focus()
    if (errs.role) return document.getElementById('teacher-role')?.focus()
    if (errs.dept) return document.getElementById('teacher-dept')?.focus()

    // Foto — bor bo'lsa haqiqiy fayl sifatida, bo'lmasa mavjud/olib tashlangan holatini bildiruvchi `existingImage`
    // sifatida yuboriladi. Yuklashning o'zi backendda (service_role kalit bilan, MIME/hajm tekshiruvi bilan) amalga oshadi —
    // brauzer to'g'ridan-to'g'ri Supabase'ga yozmaydi.
    const fd = new FormData()
    fd.append('name', name)
    fd.append('role', role)
    fd.append('dept', values.dept)
    fd.append('avatar', values.avatar)
    fd.append('existingImage', currentImage)
    if (photo.imageFile) fd.append('imageFile', photo.imageFile)

    setSaving(true)
    setServerError('')
    try {
      const url = editing ? `${API}/teachers/${editing}` : `${API}/teachers`
      const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: HF(), body: fd })
      if (!r.ok) {
        const msg = await errorMessage(r, "O'qituvchi saqlanmadi.")
        return setServerError(`${msg.replace(/[.!\s]+$/, '')} — ${KEPT}`)
      }
      const data = await r.json()
      const id = editing
      res.mutate(list => (Array.isArray(list) ? (id ? list.map(t => (t._id === id ? data : t)) : [data, ...list]) : list))
      closeForm()
    } catch {
      setServerError(`O'qituvchi saqlanmadi. Server bilan bog'lanib bo'lmadi — ${KEPT}`)
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
      const r = await fetch(`${API}/teachers/${id}`, { method: 'DELETE', headers: H() })
      // 404 — boshqa admin allaqachon o'chirgan (backend 1.8): natija bir xil, ro'yxatdan olib tashlanadi
      if (!r.ok && r.status !== 404) {
        setNotice(await errorMessage(r, "O'chirib bo'lmadi."))
      } else {
        res.mutate(list => (Array.isArray(list) ? list.filter(t => t._id !== id) : list))
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

  function clearFilters() { setQuery(''); setDeptFilter('') }

  const noMatchText = q && deptFilter
    ? `«${query.trim()}» ismi va «${deptFilter}» bo'yicha o'qituvchi topilmadi.`
    : q ? `«${query.trim()}» ismi bo'yicha o'qituvchi topilmadi.` : `«${deptFilter}» da o'qituvchi topilmadi.`

  return (
    <div>
      {notice && <ErrorBanner onDismiss={() => setNotice('')}>{notice}</ErrorBanner>}

      <div className="adm-page-head">
        <div className="adm-page-head-title">
          <h2 className="adm-page-title" ref={headingRef} tabIndex={-1}>O'qituvchilar</h2>
          <span className="adm-count-pill"><span className="adm-sr-only">O'qituvchilar soni: </span>{res.loading || failed ? '–' : items.length}</span>
        </div>
        <button type="button" className="btn btn-primary" onClick={requestNew}>{Ic.add}Yangi o'qituvchi</button>
      </div>

      {open && (
        <TeachersForm
          isEditing={!!editing}
          departments={departments}
          values={values}
          onChange={change}
          errors={errors}
          photo={photo}
          photoError={photoError}
          onFile={addPhoto}
          saving={saving}
          serverError={serverError}
          nameRef={nameRef}
          onSubmit={save}
          onClose={requestClose}
        />
      )}

      {!res.loading && !failed && items.length > 0 && (
        <div className="adm-toolbar">
          <div className="adm-toolbar-search" role="search">
            <div className="adm-input-wrap">
              <span className="adm-input-icon" aria-hidden="true">{Ic.search}</span>
              <input
                className="adm-ctl adm-ctl--icon"
                type="text"
                value={query}
                placeholder="Ism bo'yicha qidirish"
                aria-label="Ism bo'yicha qidirish"
                autoComplete="off"
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="adm-select adm-toolbar-dept">
            <select className="adm-ctl adm-ctl--select" aria-label="Kafedra bo'yicha filtr" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">Barcha kafedralar</option>
              {deptOptions.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <span className="adm-select-icon" aria-hidden="true">{Ic.chevronDown}</span>
          </div>
          <span className="adm-toolbar-count" role="status">{formatCount(items.length)} nafardan {formatCount(visible.length)} tasi</span>
        </div>
      )}

      {res.loading ? <TeacherSkeleton /> : failed ? (
        <ErrorPanel title="O'qituvchilarni yuklab bo'lmadi." onRetry={res.reload}>
          Internet aloqasini tekshiring yoki birozdan keyin qayta urinib ko'ring.
        </ErrorPanel>
      ) : items.length === 0 ? (
        !open && (
          <EmptyState
            icon={Ic.teach}
            title="Hali o'qituvchi yo'q"
            action={<button type="button" className="btn btn-primary adm-empty-action" onClick={openNew}>{Ic.add}Yangi o'qituvchi</button>}
          >
            Birinchi o'qituvchini qo'shing — u saytning «Professor-o'qituvchilar» sahifasida, o'z kafedrasi ostida ko'rinadi.
          </EmptyState>
        )
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Ic.search}
          title="Hech narsa topilmadi"
          action={<button type="button" className="btn btn-secondary adm-empty-action" onClick={clearFilters}>Filtrni tozalash</button>}
        >
          {filtering ? noMatchText : ''}
        </EmptyState>
      ) : (
        <ul className="adm-teachers">
          {visible.map(t => <TeacherCard key={t._id} item={t} onEdit={requestEdit} onDelete={setToDelete} />)}
        </ul>
      )}

      {toDelete && (
        <ConfirmDialog
          title="O'qituvchini o'chirishni tasdiqlaysizmi?"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          <strong>«{toDelete.name}»</strong> o'chiriladi, saytdagi ro'yxatdan ham yo'qoladi. Bu amalni qaytarib bo'lmaydi.
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
