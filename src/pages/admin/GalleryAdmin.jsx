import { useEffect, useMemo, useRef, useState } from 'react'
import { API, H, HF, errorMessage } from './shared/api'
import { Ic } from './shared/Icons.jsx'
import { markBroken, formatDateLong, formatCount } from './shared/helpers'
import { useMultiImageUpload } from './shared/useImageUpload'
import { useApiGet } from './shared/useApiGet'
import { ErrorBanner, ErrorPanel, EmptyState } from './shared/StateViews.jsx'
import ConfirmDialog from './shared/ConfirmDialog.jsx'
import { MAX_IMAGES, ALBUM_MOSAIC } from './shared/constants'
import GalleryForm from './GalleryForm.jsx'

const EMPTY = { title: '', desc: '' }
const KEPT = "kiritilgan ma'lumotlar saqlanib turibdi, qayta urinib ko'ring."

// Fayl xatosi (hook'dan keladi) → yuklash maydoni ostidagi xabar
function imageErrorText({ kind, file, max }) {
  if (kind === 'type') return `${file?.name ? `${file.name} — ` : ''}faqat JPEG, PNG, WebP yoki GIF qabul qilinadi.`
  if (kind === 'size') return `${file.name} — 5 MB dan katta. Boshqa rasm tanlang.`
  return `Albomda ko'pi bilan ${max} ta rasm bo'lishi mumkin.`
}

// Yuklanmoqda: taxtadagi skelet (`aria-busy`), kartalar bilan bir xil joylashuv — sahifa sakramaydi
function AlbumSkeleton() {
  return (
    <ul className="adm-albums adm-skel-list" aria-busy="true" role="status">
      <li className="adm-sr-only">Yuklanmoqda...</li>
      {[0, 1, 2].map(i => (
        <li key={i} className="adm-card adm-album" aria-hidden="true">
          <div className="adm-skel adm-skel--mosaic" />
          <div className="adm-album-body adm-skel-col">
            <div className="adm-skel adm-skel--name" />
            <div className="adm-skel adm-skel--line" />
            <div className="adm-skel adm-skel--date" />
          </div>
        </li>
      ))}
    </ul>
  )
}

// Mozaika (birinchi 3 rasm): 1 ta — to'liq; 2 ta — yarim-yarim; 3 va undan ko'p — katta + ikkita kichik. Ko'rsatilgan
// hamma rasm yuklanmasa — «Rasm yuklanmadi» bloki (karta bo'sh qolmasin); «N ta rasm» belgisi har doim bor.
// Bir rasm yuklanmasa, faqat o'sha katak xiralashadi (`markBroken`).
function Mosaic({ images }) {
  const shown = images.slice(0, ALBUM_MOSAIC)
  const [failed, setFailed] = useState(() => new Set())
  const lost = shown.length === 0 || shown.every((_, i) => failed.has(i))
  return (
    <div className="adm-album-mosaic" data-count={shown.length} data-lost={lost ? 'true' : undefined}>
      {lost ? (
        <div className="adm-album-fallback">
          {Ic.image}
          <span>{shown.length === 0 ? "Rasm yo'q" : 'Rasm yuklanmadi'}</span>
        </div>
      ) : shown.map((src, i) => (
        <img
          key={`${i}:${src}`}
          className="adm-album-tile"
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={e => { markBroken(e); setFailed(f => new Set(f).add(i)) }}
        />
      ))}
      <span className="adm-album-badge">{Ic.image}{images.length} ta rasm</span>
    </div>
  )
}

function AlbumCard({ item, onEdit, onDelete }) {
  const images = Array.isArray(item.images) ? item.images : []
  const date = formatDateLong(item.createdAt)
  return (
    <li className="adm-card adm-album">
      <Mosaic key={images.slice(0, ALBUM_MOSAIC).join('\n')} images={images} />
      <div className="adm-album-body">
        <h4 className="adm-album-title">{item.title}</h4>
        <p className="adm-album-desc">{item.desc}</p>
        <span className="adm-meta adm-album-date">
          {date && <>{Ic.events}<span className="adm-sr-only">Qo'shilgan: </span>{date}</>}
        </span>
        <div className="adm-album-actions">
          <button type="button" className="btn btn-secondary btn-sm adm-item-edit" aria-label={`Tahrirlash: ${item.title}`} onClick={() => onEdit(item)}>
            {Ic.edit}Tahrirlash
          </button>
          <button type="button" className="btn btn-danger adm-icon-btn" aria-label={`O'chirish: ${item.title}`} onClick={() => onDelete(item)}>
            {Ic.trash}
          </button>
        </div>
      </div>
    </li>
  )
}

export default function GalleryAdmin() {
  const res = useApiGet('/gallery', 'Albomlarni yuklash')
  const failed = res.error || (!res.loading && !Array.isArray(res.data))
  const items = useMemo(() => (Array.isArray(res.data) ? res.data : []), [res.data])
  const totalImages = useMemo(() => items.reduce((n, a) => n + (Array.isArray(a.images) ? a.images.length : 0), 0), [items])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)        // tahrirlanayotgan albom `_id` si
  const [values, setValues] = useState(EMPTY)
  const [initial, setInitial] = useState({ values: EMPTY, urls: [] })  // «o'zgardimi?» taqqoslash uchun
  const [errors, setErrors] = useState({})
  const [imageError, setImageError] = useState('')
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const [leave, setLeave] = useState(null)            // saqlanmagan o'zgarishlar dialogi kutayotgan amal
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')
  const [focusKey, setFocusKey] = useState(0)         // forma ochilganda nomga fokus
  const [refocus, setRefocus] = useState(0)           // forma yopilganda / o'chirilgandan keyin sarlavhaga fokus
  const titleRef = useRef(null)
  const headingRef = useRef(null)

  // Ko'p rasmli yuklash hook'i (Yangiliklar bilan bir xil); albom — 10 tagacha, fayl xatolari maydon ostida
  const images = useMultiImageUpload({ max: MAX_IMAGES, onError: e => setImageError(imageErrorText(e)) })

  useEffect(() => { if (focusKey > 0) titleRef.current?.focus() }, [focusKey])
  useEffect(() => { if (refocus > 0) headingRef.current?.focus() }, [refocus])

  const currentUrls = images.imagePreviews.filter(p => !p.isNew).map(p => p.url)
  const dirty = open && (
    values.title !== initial.values.title ||
    values.desc !== initial.values.desc ||
    images.imageFiles.length > 0 ||
    currentUrls.join('\n') !== initial.urls.join('\n')
  )

  function resetFeedback() { setErrors({}); setImageError(''); setServerError('') }

  function openNew() {
    setEditing(null); setValues(EMPTY); setInitial({ values: EMPTY, urls: [] })
    images.clear(); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function openEdit(item) {
    const v = { title: item.title, desc: item.desc || '' }
    const urls = Array.isArray(item.images) ? item.images : []
    setEditing(item._id); setValues(v); setInitial({ values: v, urls })
    images.reset(urls); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function closeForm() {
    setOpen(false); setEditing(null); setValues(EMPTY); setInitial({ values: EMPTY, urls: [] })
    images.clear(); resetFeedback(); setRefocus(k => k + 1)
  }

  // Forma o'zgargan bo'lsa «Bekor», «X», boshqa albomni tahrirlash va «Yangi albom» jimgina tozalamaydi — dialog so'raydi
  function requestNew() {
    if (!open) return openNew()
    if (!editing) return titleRef.current?.focus()   // yangi forma allaqachon ochiq
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

  function addFiles(list) {
    setImageError('')
    images.addFiles(list)
  }

  function removeImage(i) {
    setImageError('')
    images.removeImage(i)
  }

  async function save(e) {
    e.preventDefault()
    if (saving) return
    const title = values.title.trim()
    const noImages = images.imagePreviews.length === 0
    setErrors(title ? {} : { title: 'Albom nomini kiriting.' })
    setImageError(noImages ? 'Kamida bitta rasm tanlang.' : '')
    if (!title) return titleRef.current?.focus()
    if (noImages) return images.fileRef.current?.focus()

    // Rasm yuklash backend orqali (Supabase service_role kaliti serverda, MIME/hajm tekshiruvi bilan) — brauzer
    // to'g'ridan-to'g'ri Supabase'ga yozmaydi. Mavjud (o'zgartirilmagan) URL'lar `existingImages` sifatida,
    // yangi tanlangan fayllar haqiqiy fayl sifatida yuboriladi.
    const fd = new FormData()
    fd.append('title', title)
    fd.append('desc', values.desc)
    fd.append('existingImages', JSON.stringify(currentUrls))
    images.imageFiles.forEach(f => fd.append('imageFiles', f))

    setSaving(true)
    setServerError('')
    try {
      const url = editing ? `${API}/gallery/${editing}` : `${API}/gallery`
      const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: HF(), body: fd })
      if (!r.ok) {
        const msg = await errorMessage(r, 'Albom saqlanmadi.')
        return setServerError(`${msg.replace(/[.!\s]+$/, '')} — ${KEPT}`)
      }
      const data = await r.json()
      const id = editing
      res.mutate(list => (Array.isArray(list) ? (id ? list.map(a => (a._id === id ? data : a)) : [data, ...list]) : list))
      closeForm()
    } catch {
      setServerError(`Albom saqlanmadi. Server bilan bog'lanib bo'lmadi — ${KEPT}`)
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
      const r = await fetch(`${API}/gallery/${id}`, { method: 'DELETE', headers: H() })
      // 404 — boshqa admin allaqachon o'chirgan (backend 1.8): natija bir xil, ro'yxatdan olib tashlanadi
      if (!r.ok && r.status !== 404) {
        setNotice(await errorMessage(r, "O'chirib bo'lmadi."))
      } else {
        res.mutate(list => (Array.isArray(list) ? list.filter(a => a._id !== id) : list))
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

  const deleteCount = Array.isArray(toDelete?.images) ? toDelete.images.length : 0

  return (
    <div>
      {notice && <ErrorBanner onDismiss={() => setNotice('')}>{notice}</ErrorBanner>}

      <div className="adm-page-head">
        <div className="adm-page-head-title">
          <h2 className="adm-page-title" ref={headingRef} tabIndex={-1}>Galereya</h2>
          <span className="adm-count-pill"><span className="adm-sr-only">Albomlar: </span>{res.loading || failed ? '–' : items.length}</span>
          {!res.loading && !failed && items.length > 0 && <span className="adm-page-head-sub">jami {formatCount(totalImages)} ta rasm</span>}
        </div>
        <button type="button" className="btn btn-primary" onClick={requestNew}>{Ic.add}Yangi albom</button>
      </div>

      {open && (
        <GalleryForm
          isEditing={!!editing}
          values={values}
          onChange={change}
          errors={errors}
          images={{ ...images, removeImage }}
          imageError={imageError}
          onFiles={addFiles}
          saving={saving}
          serverError={serverError}
          titleRef={titleRef}
          onSubmit={save}
          onClose={requestClose}
        />
      )}

      {res.loading ? <AlbumSkeleton /> : failed ? (
        <ErrorPanel title="Albomlarni yuklab bo'lmadi." onRetry={res.reload}>
          Internet aloqasini tekshiring yoki birozdan keyin qayta urinib ko'ring.
        </ErrorPanel>
      ) : items.length === 0 ? (
        !open && (
          <EmptyState
            icon={Ic.gallery}
            title="Hali albom yo'q"
            action={<button type="button" className="btn btn-primary adm-empty-action" onClick={openNew}>{Ic.add}Yangi albom</button>}
          >
            Birinchi albomni qo'shing — undagi har bir rasm saytning «Galereya» sahifasida alohida ko'rinadi.
          </EmptyState>
        )
      ) : (
        <ul className="adm-albums">
          {items.map(a => <AlbumCard key={a._id} item={a} onEdit={requestEdit} onDelete={setToDelete} />)}
        </ul>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Albomni o'chirishni tasdiqlaysizmi?"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          <strong>«{toDelete.title}»</strong> albomi{deleteCount > 0 ? ` va undagi ${deleteCount} ta rasm` : ''} o'chiriladi, saytdagi galereyadan ham yo'qoladi. Bu amalni qaytarib bo'lmaydi.
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
