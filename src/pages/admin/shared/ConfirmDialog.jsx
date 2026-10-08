import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Ic } from './Icons.jsx'

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

// Ilovaning o'z tasdiq dialogi (6.23 — taxta: Admin-Apps «O'chirish tasdig'i»). `window.confirm` o'rniga:
// brauzer dialogi ilova ko'rinishiga mos kelmaydi, matni sozlanmaydi va testda mock kerak bo'ladi.
//
// Qoidalar (WAI-ARIA `alertdialog`):
// - `role="alertdialog"` + `aria-modal` + `aria-labelledby/-describedby`;
// - ochilganda fokus «Bekor qilish»da (xavfli amal tasodifan Enter bilan bajarilmasin);
// - Tab dialog ichida aylanadi (fokus orqa fonga chiqib ketmaydi);
// - Esc va orqa fonni bosish — bekor qilish (so'rov ketayotganda (`busy`) yopilmaydi);
// - yopilganda fokus chaqirgan tugmaga qaytadi; ochiq payt sahifa aylanmaydi.
//
// 6.24 (Yangiliklar): `tone="warning"` — «Saqlanmagan o'zgarishlar» dialogi. Ogohlantirish ikonkasi; xavfsiz
// amal (`cancel` — «Tahrirlashda qolish») brend rangli asosiy tugma va fokus shunda, `confirm` («Chiqish») —
// neytral tugma, chapda. `tone="danger"` (standart) — o'chirish: xavfsiz tugma chapda, qizil tasdiq o'ngda.
//
// Yangiliklar, Tadbirlar, Galereya va O'qituvchilar sahifalari ham shuni ishlatadi (keyingi bo'laklar).
export default function ConfirmDialog({
  title,
  children,
  tone = 'danger',
  confirmLabel = tone === 'warning' ? 'Davom etish' : "O'chirish",
  cancelLabel = tone === 'warning' ? 'Qolish' : 'Bekor qilish',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId()
  const descId = useId()
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)
  // Handler'lar har render yangilanadi, effekt esa faqat bir marta (ochilish/yopilish) ishlaydi
  const latest = useRef({ busy, onCancel })
  useEffect(() => { latest.current = { busy, onCancel } })

  useEffect(() => {
    const opener = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (!latest.current.busy) latest.current.onCancel()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
      if (items.length === 0) { e.preventDefault(); return }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        e.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = prevOverflow
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus()
    }
  }, [])

  const warning = tone === 'warning'
  const cancelBtn = (
    <button
      ref={cancelRef}
      type="button"
      className={warning ? 'btn btn-primary adm-dialog-stay' : 'btn adm-dialog-cancel'}
      onClick={onCancel}
      disabled={busy}
    >
      {cancelLabel}
    </button>
  )
  const confirmBtn = (
    <button
      type="button"
      className={warning ? 'btn adm-dialog-cancel' : 'btn adm-dialog-confirm'}
      onClick={onConfirm}
      disabled={busy}
      aria-busy={busy || undefined}
    >
      {!warning && (busy ? Ic.spinner : Ic.trash)}
      {confirmLabel}
    </button>
  )

  return createPortal(
    <div className="adm-dialog-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !busy) onCancel() }}>
      <div ref={dialogRef} className="adm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
        <span className={warning ? 'adm-dialog-icon adm-dialog-icon--warning' : 'adm-dialog-icon'} aria-hidden="true">{warning ? Ic.warn : Ic.trash}</span>
        <h2 id={titleId} className="adm-dialog-title">{title}</h2>
        <div id={descId} className="adm-dialog-text">{children}</div>
        <div className="adm-dialog-actions">
          {warning ? <>{confirmBtn}{cancelBtn}</> : <>{cancelBtn}{confirmBtn}</>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
