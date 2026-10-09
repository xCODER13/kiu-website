import { useState, useEffect, useRef } from 'react'
import { API, H, errorMessage } from './shared/api'
import { STATUS_BADGE, STATUS_LABELS } from './shared/constants'
import { Ic } from './shared/Icons.jsx'
import { useApiGet } from './shared/useApiGet'
import { ErrorPanel, EmptyState, ErrorBanner } from './shared/StateViews.jsx'
import ConfirmDialog from './shared/ConfirmDialog.jsx'

// 6.23 (taxta: Admin-Apps): bitta komponent ikki sahifa — `type="admission"` (Qabul arizalari) va
// `type="vacancy"` (Vakansiya arizalari). `window.confirm`/`alert` o'rniga ilovaning o'z dialogi va banneri,
// yuklash xatosi jim «Ariza yo'q» o'rniga «Qayta urinish» bilan, holat — rang + ikonka + matn.
//
// 4.4: filtr, sahifalash va holatlar sanog'i SERVERDA (GET /applications?type=&status=&page=&limit=):
// ilgari hamma ariza (shaxsiy ma'lumot) bitta so'rovda kelib, klientda filtrlanardi. Javob:
// { items, total, page, limit, counts } — `counts` faqat `type` bo'yicha (chip hisoblagichlari).

const STATUSES = ['new', 'reviewed', 'accepted', 'rejected']
const FILTERS = ['all', ...STATUSES]
const FILTER_LABEL = { all: 'Barchasi', ...STATUS_LABELS }
const STATUS_ICON = { new: Ic.statusNew, reviewed: Ic.statusReviewed, accepted: Ic.statusAccepted, rejected: Ic.statusRejected }
// Xabar shundan uzun bo'lsa kesiladi va «To'liq o'qish» tugmasi chiqadi (avval 120 belgidan keyin matn butunlay yo'qolardi)
const MESSAGE_LIMIT = 120
const NETWORK_ERROR = "Server bilan bog'lanib bo'lmadi."
const PAGE_SIZE = 20

// Avatar: ismning dastlabki ikki so'zining bosh harflari (Unicode xavfsiz — surrogat juftlik bo'linmaydi)
function initials(name) {
  const letters = String(name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => Array.from(w)[0].toUpperCase())
  return letters.join('') || '?'
}

// "30.09.2026, 14:32" — brauzer locale'iga bog'liq emas (`toLocaleString('uz-UZ')` muhitga qarab turlicha chiqardi).
// Server UTC saqlaydi; admin o'z lokal vaqtida ko'radi, shuning uchun lokal getter'lar.
function formatDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const p = n => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`
}

// Yuklanmoqda: taxtadagi skelet (`aria-busy`), kartalar bilan bir xil joylashuv — sahifa sakramaydi
function ApplicationSkeleton() {
  return (
    <div className="adm-app-list adm-skel-list" aria-busy="true" role="status">
      <span className="adm-sr-only">Yuklanmoqda...</span>
      {[0, 1, 2].map(i => (
        <div key={i} className="adm-card adm-app-card" aria-hidden="true">
          <div className="adm-app-row">
            <div className="adm-skel adm-skel--avatar" />
            <div className="adm-app-main adm-skel-col">
              <div className="adm-skel adm-skel--name" />
              <div className="adm-skel adm-skel--line" />
              <div className="adm-skel adm-skel--line adm-skel--short" />
              <div className="adm-skel adm-skel--date" />
            </div>
            <div className="adm-app-actions adm-skel-col">
              <div className="adm-skel adm-skel--label" />
              <div className="adm-skel adm-skel--btn" />
              <div className="adm-skel adm-skel--btn" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ApplicationCard({ a, type, expanded, onToggle, busy, onStatus, onDelete }) {
  const long = (a.message?.length ?? 0) > MESSAGE_LIMIT
  const shown = long && !expanded ? `${a.message.slice(0, MESSAGE_LIMIT)}...` : a.message
  const date = formatDate(a.createdAt)
  const selectId = `app-status-${a._id}`
  return (
    <li className="adm-card adm-app-card">
      <div className="adm-app-row">
        <div className="adm-app-avatar" aria-hidden="true">{initials(a.name)}</div>

        <div className="adm-app-main">
          <div className="adm-app-head">
            <span className="adm-app-name">{a.name}</span>
            <span className={`badge ${STATUS_BADGE[a.status] ?? ''}`}>{STATUS_ICON[a.status]}{STATUS_LABELS[a.status]}</span>
          </div>
          <div className="adm-app-meta">
            <span className="adm-app-meta-item"><span className="adm-app-meta-icon" aria-hidden="true">{Ic.phone}</span>{a.phone}</span>
            {/* Email faqat vakansiyada: qabul formasida email maydoni yo'q (taxta ham shunday) */}
            {type === 'vacancy' && a.email && (
              <span className="adm-app-meta-item"><span className="adm-app-meta-icon" aria-hidden="true">{Ic.mail}</span>{a.email}</span>
            )}
          </div>
          {type === 'admission' && a.faculty && (
            <div className="adm-app-line">
              <span className="adm-app-meta-icon" aria-hidden="true">{Ic.book}</span>
              Yo'nalish: <strong>{a.faculty}</strong>
            </div>
          )}
          {type === 'vacancy' && (a.position || a.faculty || a.education || a.experience) && (
            <div className="adm-tags">
              {a.position && <span className="adm-tag adm-tag--brand">{Ic.vacancy}{a.position}</span>}
              {a.faculty && <span className="adm-tag">{Ic.building}{a.faculty}</span>}
              {a.education && <span className="adm-tag">{Ic.cap}{a.education}</span>}
              {a.experience && <span className="adm-tag">{Ic.clock}{a.experience}</span>}
            </div>
          )}
          {a.message && (
            <div className="adm-app-msg">
              {/* Matn faqat text node sifatida chiqadi — xabarni ommaviy forma yuboradi (HTML sifatida ishlanmaydi) */}
              <div className="adm-app-msg-text" id={`app-msg-${a._id}`}>{shown}</div>
              {long && (
                <button type="button" className="adm-app-more" aria-expanded={expanded} aria-controls={`app-msg-${a._id}`} onClick={() => onToggle(a._id)}>
                  {expanded ? 'Yig\'ish' : "To'liq o'qish"}
                  <span className="adm-app-more-icon" aria-hidden="true">{Ic.chevronDown}</span>
                </button>
              )}
            </div>
          )}
          {date && (
            <div className="adm-app-date">
              <span className="adm-app-meta-icon" aria-hidden="true">{Ic.clock}</span>
              {date}
            </div>
          )}
        </div>

        <div className="adm-app-actions">
          <span className="adm-field-label" aria-hidden="true">Holat</span>
          <div className="adm-select" data-busy={busy || undefined}>
            <select id={selectId} className="adm-status-select" data-status={a.status} value={a.status} disabled={busy} aria-busy={busy || undefined}
              aria-label={`${a.name}: ariza holati`} onChange={e => onStatus(a._id, e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <span className={busy ? 'adm-select-icon adm-select-icon--spin' : 'adm-select-icon'} aria-hidden="true">{busy ? Ic.spinner : Ic.chevronDown}</span>
          </div>
          <button type="button" className="btn btn-danger adm-app-delete" aria-label={`O'chirish: ${a.name}`} onClick={() => onDelete(a)}>
            {Ic.trash}
            O'chirish
          </button>
        </div>
      </div>
    </li>
  )
}

// Server javobi kutilgan shaklda emas (proksi/xato sahifa yoki eski massiv formati) — bo'sh ro'yxat deb ko'rsatilmaydi
function isListResponse(d) {
  return !!d && Array.isArray(d.items) && typeof d.total === 'number' && !!d.counts && typeof d.counts === 'object'
}

// Holat o'zgargach ro'yxat va sanoqlar qayta yuklanmasdan mahalliy yangilanadi (server javobi qo'lda).
// Tanlangan holat filtrida ariza endi mos kelmasa, u sahifadan chiqib ketadi (avvalgi klient filtri kabi).
function withStatusChange(d, updated, filter) {
  const old = d.items.find(a => a._id === updated._id)
  if (!old) return d
  const counts = { ...d.counts }
  if (old.status !== updated.status) {
    if (old.status in counts) counts[old.status] -= 1
    if (updated.status in counts) counts[updated.status] += 1
  }
  const stays = filter === 'all' || updated.status === filter
  return {
    ...d,
    counts,
    total: stays ? d.total : d.total - 1,
    items: stays ? d.items.map(a => (a._id === updated._id ? updated : a)) : d.items.filter(a => a._id !== updated._id),
  }
}

function withoutApplication(d, id) {
  const old = d.items.find(a => a._id === id)
  if (!old) return d
  const counts = { ...d.counts, all: d.counts.all - 1 }
  if (old.status in counts) counts[old.status] -= 1
  return { ...d, counts, total: d.total - 1, items: d.items.filter(a => a._id !== id) }
}

// Tur almashganda (Qabul ↔ Vakansiya) holat, sahifa va ochilgan kartalar tozalansin — `key` bilan qayta yaratiladi
export default function ApplicationsAdmin({ type = 'admission' }) {
  return <ApplicationsList key={type} type={type} />
}

function ApplicationsList({ type }) {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const path = `/applications?type=${type}&page=${page}&limit=${PAGE_SIZE}${filter === 'all' ? '' : `&status=${filter}`}`
  const res = useApiGet(path, 'Arizalarni yuklashda xatolik')
  const { mutate, reload } = res
  const [expanded, setExpanded] = useState(() => new Set())
  const [pending, setPending] = useState(() => new Set())   // holati o'zgartirilayotgan arizalar (tanlagich o'chiq)
  const [toDelete, setToDelete] = useState(null)            // dialog ochiq bo'lgan ariza
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')                  // sahifa banneri (avval `alert()`)
  const [refocus, setRefocus] = useState(0)
  const headingRef = useRef(null)

  const data = isListResponse(res.data) ? res.data : null
  // Filtr/sahifa almashganda yangi javob kelguncha oldingi sanoqlar ko'rinib turadi (chiplar «–» bilan miltillamasin)
  const shown = data ?? (isListResponse(res.previousData) ? res.previousData : null)
  const items = data?.items ?? []
  const counts = shown?.counts

  // Arizani o'chirgach, uni ochgan tugma yo'qoladi / sahifa almashgach tepaga: fokus sahifa sarlavhasiga (klaviatura foydalanuvchisi yo'qolib qolmasin)
  useEffect(() => { if (refocus > 0) headingRef.current?.focus() }, [refocus])

  function changeFilter(next) {
    setFilter(next)
    setPage(1)
  }

  function goToPage(next) {
    setPage(next)
    setRefocus(n => n + 1)
  }

  // Sahifadagi oxirgi ariza ketgach (o'chirildi / filtrdan chiqdi) bo'sh sahifada qolmaslik uchun oldingisiga qaytiladi
  function leavePageIfEmpty() {
    if (page > 1 && items.length <= 1) setPage(page - 1)
  }

  async function updateStatus(id, status) {
    if (pending.has(id)) return
    setPending(p => new Set(p).add(id))
    setNotice('')
    try {
      const r = await fetch(`${API}/applications/${id}`, { method: 'PUT', headers: H(), body: JSON.stringify({ status }) })
      if (!r.ok) setNotice(await errorMessage(r, "Statusni o'zgartirib bo'lmadi."))
      else {
        const updated = await r.json()
        mutate(d => (isListResponse(d) ? withStatusChange(d, updated, filter) : d))
        if (filter !== 'all' && updated.status !== filter) leavePageIfEmpty()
      }
    } catch {
      setNotice(NETWORK_ERROR)
    } finally {
      setPending(p => { const n = new Set(p); n.delete(id); return n })
    }
  }

  async function confirmDelete() {
    const { _id: id } = toDelete
    setDeleting(true)
    setNotice('')
    try {
      const r = await fetch(`${API}/applications/${id}`, { method: 'DELETE', headers: H() })
      // 404 — boshqa admin allaqachon o'chirgan (backend 1.8): natija bir xil, ro'yxatdan olib tashlanadi
      if (!r.ok && r.status !== 404) setNotice(await errorMessage(r, "O'chirib bo'lmadi."))
      else {
        mutate(d => (isListResponse(d) ? withoutApplication(d, id) : d))
        leavePageIfEmpty()
        setRefocus(n => n + 1)
      }
    } catch {
      setNotice(NETWORK_ERROR)
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  function toggleExpanded(id) {
    setExpanded(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  // Server 200 qaytarib kutilgan shaklda javob bermasa (proksi/xato sahifa) ham bu xato — bo'sh ro'yxat deb ko'rsatilmaydi
  const failed = res.error || (!res.loading && !data)
  const title = type === 'vacancy' ? 'Vakansiya arizalari' : 'Qabul arizalari'
  const countText = n => (failed || !counts ? '–' : String(n ?? 0))
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <div>
      {notice && <ErrorBanner onDismiss={() => setNotice('')}>{notice}</ErrorBanner>}

      <div className="adm-page-head">
        <div className="adm-page-head-title">
          <h2 className="adm-page-title" ref={headingRef} tabIndex={-1}>{title}</h2>
          {!failed && counts && <span className="adm-count-pill"><span className="adm-sr-only">Jami: </span>{counts.all}</span>}
        </div>
        <div className="adm-filters" role="group" aria-label="Holat bo'yicha filtr">
          {FILTERS.map(val => (
            <button key={val} type="button" className="adm-chip" data-active={filter === val} data-status={val === 'all' ? undefined : val}
              aria-pressed={filter === val} onClick={() => changeFilter(val)}>
              {val !== 'all' && <span className="adm-chip-dot" aria-hidden="true" />}
              {FILTER_LABEL[val]}{' '}
              <span className="adm-chip-count">{countText(counts?.[val])}</span>
            </button>
          ))}
        </div>
      </div>

      {res.loading && <ApplicationSkeleton />}

      {!res.loading && failed && (
        <ErrorPanel title="Arizalarni yuklab bo'lmadi." onRetry={reload}>
          Internet aloqasini tekshiring yoki birozdan keyin qayta urinib ko'ring.
        </ErrorPanel>
      )}

      {!res.loading && !failed && data.counts.all === 0 && (
        <EmptyState icon={Ic.inbox} title="Hali ariza kelmagan">
          {type === 'vacancy'
            ? "Nomzodlar sayt orqali ariza yuborganda ular shu yerda ko'rinadi."
            : "Abituriyentlar sayt orqali ariza yuborganda ular shu yerda ko'rinadi."}
        </EmptyState>
      )}

      {!res.loading && !failed && data.counts.all > 0 && items.length === 0 && (
        <EmptyState icon={Ic.inbox} title="Bu holatda ariza yo'q"
          action={<button type="button" className="btn adm-btn-neutral" onClick={() => changeFilter('all')}>{FILTER_LABEL.all}</button>}>
          Boshqa holatni tanlang yoki filtrni tozalang.
        </EmptyState>
      )}

      {!res.loading && !failed && items.length > 0 && (
        <ul className="adm-app-list">
          {items.map(a => (
            <ApplicationCard key={a._id} a={a} type={type} expanded={expanded.has(a._id)} busy={pending.has(a._id)}
              onToggle={toggleExpanded} onStatus={updateStatus} onDelete={setToDelete} />
          ))}
        </ul>
      )}

      {!res.loading && !failed && pages > 1 && (
        <nav className="adm-pager" aria-label="Sahifalar">
          <button type="button" className="btn adm-btn-neutral" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Oldingi</button>
          <span className="adm-pager-info" aria-live="polite">Sahifa {page} / {pages}</span>
          <button type="button" className="btn adm-btn-neutral" disabled={page >= pages} onClick={() => goToPage(page + 1)}>Keyingi</button>
        </nav>
      )}

      {toDelete && (
        <ConfirmDialog title="Arizani o'chirishni tasdiqlaysizmi?" busy={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)}>
          <strong>{toDelete.name}</strong> arizasi butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.
        </ConfirmDialog>
      )}
    </div>
  )
}
