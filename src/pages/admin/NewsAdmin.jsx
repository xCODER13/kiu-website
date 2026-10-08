import { useEffect, useMemo, useRef, useState } from 'react'
import { API, H, HF, errorMessage } from './shared/api'
import { Ic } from './shared/Icons.jsx'
import { extractYouTubeShortsId, parseImages, markBroken, formatDateShort, formatCount } from './shared/helpers'
import { useMultiImageUpload } from './shared/useImageUpload'
import { useApiGet } from './shared/useApiGet'
import { ErrorBanner, ErrorPanel, EmptyState } from './shared/StateViews.jsx'
import ConfirmDialog from './shared/ConfirmDialog.jsx'
import { MAX_IMAGES, toAdminCategory } from './shared/constants'
import NewsForm from './NewsForm.jsx'

const EMPTY = { title: '', content: '', category: 'Umumiy', shortsUrl: '' }
const SHORTS_ERROR = "To'g'ri YouTube Shorts havolasini kiriting (masalan: https://youtube.com/shorts/VIDEO_ID)."
const KEPT = "kiritilgan ma'lumotlar saqlanib turibdi, qayta urinib ko'ring."

// Kategoriya → grafik rangi (`--chart-1…6`, 4.4). Nom apostrof turiga qaramaydi («Ta'lim» / «Taʼlim»); noma'lum — neytral (0).
const CATEGORY_TONE = { umumiy: 1, talim: 2, sport: 3, madaniyat: 4, xalqaro: 5, fan: 6 }
const categoryTone = c => CATEGORY_TONE[String(c ?? '').toLowerCase().replace(/[^a-z]/g, '')] ?? 0

// Fayl xatosi (hook'dan keladi) → maydon ostidagi xabar
function imageErrorText({ kind, file, max }) {
  if (kind === 'type') return 'Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP, GIF).'
  if (kind === 'size') return `${file.name} — 5 MB dan katta. Boshqa rasm tanlang.`
  return `Ko'pi bilan ${max} ta rasm qo'shish mumkin.`
}

// Yuklanmoqda: taxtadagi skelet (`aria-busy`), qatorlar bilan bir xil joylashuv — sahifa sakramaydi
function NewsSkeleton() {
  return (
    <ul className="adm-items adm-skel-list" aria-busy="true" role="status">
      <li className="adm-sr-only">Yuklanmoqda...</li>
      {[0, 1, 2].map(i => (
        <li key={i} className="adm-card adm-item" aria-hidden="true">
          <div className="adm-skel adm-skel--thumb" />
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

// Bitta qator: miniatyura (birinchi rasm = «muqova»), kategoriya/Shorts belgisi, sana, ko'rishlar, sarlavha, matn boshi
function NewsRow({ n, shorts, onEdit, onDelete }) {
  const cover = parseImages(n.image)[0]
  const thumbClass = shorts ? 'adm-item-thumb adm-item-thumb--shorts' : 'adm-item-thumb'
  return (
    <li className="adm-card adm-item">
      <div className={cover ? thumbClass : `${thumbClass} adm-item-thumb--empty`} aria-hidden="true">
        {cover
          ? <img className="adm-item-thumb-img" src={cover} alt="" loading="lazy" onError={markBroken} />
          : (shorts ? Ic.camera : Ic.image)}
      </div>
      <div className="adm-item-main">
        <div className="adm-item-meta">
          {shorts
            ? <span className="adm-cat adm-cat--shorts">{Ic.camera}Shorts</span>
            : <span className="adm-cat" data-cat={categoryTone(n.category || 'Umumiy')}><span className="adm-cat-dot" aria-hidden="true" />{n.category || 'Umumiy'}</span>}
          <span className="adm-meta">{Ic.events}<span className="adm-sr-only">Sana: </span>{formatDateShort(n.createdAt)}</span>
          <span className="adm-meta">{Ic.eye}<span className="adm-sr-only">Ko'rishlar: </span>{formatCount(n.views)}</span>
        </div>
        <h4 className="adm-item-title">{n.title}</h4>
        {n.content && <p className="adm-item-text">{n.content}</p>}
      </div>
      <div className="adm-item-actions">
        <button type="button" className="btn btn-secondary btn-sm adm-item-edit" aria-label={`Tahrirlash: ${n.title}`} onClick={() => onEdit(n)}>
          {Ic.edit}Tahrirlash
        </button>
        <button type="button" className="btn btn-danger adm-icon-btn" aria-label={`O'chirish: ${n.title}`} onClick={() => onDelete(n)}>
          {Ic.trash}
        </button>
      </div>
    </li>
  )
}

function NewsSection({ id, title, items, shorts, onEdit, onDelete }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby={id} className="adm-sec">
      <div className="adm-sec-head">
        <h3 id={id} className="adm-sec-title">{title}</h3>
        <span className="adm-count-pill adm-count-pill--sm">{items.length}</span>
      </div>
      <ul className="adm-items">
        {items.map(n => <NewsRow key={n._id} n={n} shorts={shorts} onEdit={onEdit} onDelete={onDelete} />)}
      </ul>
    </section>
  )
}

export default function NewsAdmin() {
  const res = useApiGet('/news', 'Yangiliklarni yuklash')
  const failed = res.error || (!res.loading && !Array.isArray(res.data))
  const news = useMemo(() => (Array.isArray(res.data) ? res.data : []), [res.data])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)        // tahrirlanayotgan yangilik `_id` si
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
  const [focusKey, setFocusKey] = useState(0)         // forma ochilganda sarlavhaga fokus
  const [refocus, setRefocus] = useState(0)           // forma yopilganda / o'chirilgandan keyin sarlavhaga fokus
  const titleRef = useRef(null)
  const shortsRef = useRef(null)
  const headingRef = useRef(null)

  const images = useMultiImageUpload({ max: MAX_IMAGES, onError: e => setImageError(imageErrorText(e)) })

  useEffect(() => { if (focusKey > 0) titleRef.current?.focus() }, [focusKey])
  useEffect(() => { if (refocus > 0) headingRef.current?.focus() }, [refocus])

  const currentUrls = images.imagePreviews.filter(p => !p.isNew).map(p => p.url)
  const dirty = open && (
    values.title !== initial.values.title ||
    values.content !== initial.values.content ||
    values.category !== initial.values.category ||
    values.shortsUrl !== initial.values.shortsUrl ||
    images.imageFiles.length > 0 ||
    currentUrls.join('\n') !== initial.urls.join('\n')
  )

  function resetFeedback() { setErrors({}); setImageError(''); setServerError('') }

  function openNew() {
    setEditing(null); setValues(EMPTY); setInitial({ values: EMPTY, urls: [] })
    images.clear(); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function openEdit(n) {
    const v = {
      title: n.title,
      content: n.content || '',
      category: toAdminCategory(n.category),
      shortsUrl: n.shortsUrl || (n.videoId ? `https://youtube.com/shorts/${n.videoId}` : ''),
    }
    const urls = parseImages(n.image)
    setEditing(n._id); setValues(v); setInitial({ values: v, urls })
    images.reset(urls); resetFeedback(); setOpen(true); setFocusKey(k => k + 1)
  }

  function closeForm() {
    setOpen(false); setEditing(null); setValues(EMPTY); setInitial({ values: EMPTY, urls: [] })
    images.clear(); resetFeedback(); setRefocus(k => k + 1)
  }

  // Forma o'zgargan bo'lsa «Bekor», «X», boshqa yangilikni tahrirlash va «Yangi yangilik» jimgina tozalamaydi — dialog so'raydi
  function requestNew() {
    if (!open) return openNew()
    if (!editing) return titleRef.current?.focus()   // yangi forma allaqachon ochiq
    if (dirty) return setLeave({ type: 'new' })
    openNew()
  }
  function requestEdit(n) {
    if (editing === n._id) return titleRef.current?.focus()
    if (open && dirty) return setLeave({ type: 'edit', item: n })
    openEdit(n)
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

  async function save(e) {
    e.preventDefault()
    if (saving) return
    const title = values.title.trim()
    const shortsUrl = values.shortsUrl.trim()
    const videoId = shortsUrl ? extractYouTubeShortsId(shortsUrl) : ''
    const next = {}
    if (!title) next.title = 'Sarlavha kiritilishi shart.'
    if (shortsUrl && !videoId) next.shortsUrl = SHORTS_ERROR
    setErrors(next)
    if (next.title) return titleRef.current?.focus()
    if (next.shortsUrl) return shortsRef.current?.focus()

    // Rasm yuklash backend orqali (Supabase service_role kaliti serverda, MIME/hajm tekshiruvi bilan) — brauzer
    // to'g'ridan-to'g'ri Supabase'ga yozmaydi. Mavjud (o'zgartirilmagan) URL'lar `existingImages` sifatida,
    // yangi tanlangan fayllar haqiqiy fayl sifatida yuboriladi.
    const fd = new FormData()
    fd.append('title', title)
    fd.append('content', values.content)
    fd.append('category', values.category)
    fd.append('shortsUrl', shortsUrl)
    fd.append('videoId', videoId)
    fd.append('existingImages', JSON.stringify(currentUrls))
    images.imageFiles.forEach(f => fd.append('imageFiles', f))

    setSaving(true)
    setServerError('')
    try {
      const url = editing ? `${API}/news/${editing}` : `${API}/news`
      const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: HF(), body: fd })
      if (!r.ok) {
        const msg = await errorMessage(r, 'Yangilik saqlanmadi.')
        return setServerError(`${msg.replace(/[.!\s]+$/, '')} — ${KEPT}`)
      }
      const data = await r.json()
      const id = editing
      res.mutate(list => (Array.isArray(list) ? (id ? list.map(n => (n._id === id ? data : n)) : [data, ...list]) : list))
      closeForm()
    } catch {
      setServerError(`Yangilik saqlanmadi. Server bilan bog'lanib bo'lmadi — ${KEPT}`)
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
      const r = await fetch(`${API}/news/${id}`, { method: 'DELETE', headers: H() })
      // 404 — boshqa admin allaqachon o'chirgan (backend 1.8): natija bir xil, ro'yxatdan olib tashlanadi
      if (!r.ok && r.status !== 404) {
        setNotice(await errorMessage(r, "O'chirib bo'lmadi."))
      } else {
        res.mutate(list => (Array.isArray(list) ? list.filter(n => n._id !== id) : list))
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

  const regular = news.filter(n => !n.videoId)
  const shorts = news.filter(n => n.videoId)

  return (
    <div>
      {notice && <ErrorBanner onDismiss={() => setNotice('')}>{notice}</ErrorBanner>}

      <div className="adm-page-head">
        <div className="adm-page-head-title">
          <h2 className="adm-page-title" ref={headingRef} tabIndex={-1}>Yangiliklar</h2>
          <span className="adm-count-pill"><span className="adm-sr-only">Jami: </span>{res.loading || failed ? '–' : news.length}</span>
        </div>
        <button type="button" className="btn btn-primary" onClick={requestNew}>{Ic.add}Yangi yangilik</button>
      </div>

      {open && (
        <NewsForm
          isEditing={!!editing}
          values={values}
          onChange={change}
          errors={errors}
          images={images}
          imageError={imageError}
          onFiles={addFiles}
          saving={saving}
          serverError={serverError}
          titleRef={titleRef}
          shortsRef={shortsRef}
          onSubmit={save}
          onClose={requestClose}
        />
      )}

      {res.loading ? <NewsSkeleton /> : failed ? (
        <ErrorPanel title="Yangiliklarni yuklab bo'lmadi." onRetry={res.reload}>
          Internet aloqasini tekshiring yoki birozdan keyin qayta urinib ko'ring.
        </ErrorPanel>
      ) : news.length === 0 ? (
        !open && (
          <EmptyState
            icon={Ic.news}
            title="Hali yangilik yo'q"
            action={<button type="button" className="btn btn-primary adm-empty-action" onClick={openNew}>{Ic.add}Yangi yangilik</button>}
          >
            Birinchi yangilikni qo'shing — u saytning «Yangiliklar» sahifasida ko'rinadi.
          </EmptyState>
        )
      ) : (
        <>
          <NewsSection id="news-sec-regular" title="Yangiliklar" items={regular} shorts={false} onEdit={requestEdit} onDelete={setToDelete} />
          <NewsSection id="news-sec-shorts" title="YouTube Shorts" items={shorts} shorts onEdit={requestEdit} onDelete={setToDelete} />
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Yangilikni o'chirishni tasdiqlaysizmi?"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          <strong>«{toDelete.title}»</strong> yangiligi butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.
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
