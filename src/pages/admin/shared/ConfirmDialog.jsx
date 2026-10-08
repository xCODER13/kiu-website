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
// Yangiliklar, Tadbirlar, Galereya va O'qituvchilar sahifalari ham shuni ishlatadi (keyingi bo'laklar).
export default function ConfirmDialog({
  title,
  children,
  confirmLabel = "O'chirish",
  cancelLabel = 'Bekor qilish',
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

  return createPortal(
    <div className="adm-dialog-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !busy) onCancel() }}>
      <div ref={dialogRef} className="adm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
        <span className="adm-dialog-icon" aria-hidden="true">{Ic.trash}</span>
        <h2 id={titleId} className="adm-dialog-title">{title}</h2>
        <div id={descId} className="adm-dialog-text">{children}</div>
        <div className="adm-dialog-actions">
          <button ref={cancelRef} type="button" className="btn adm-dialog-cancel" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button type="button" className="btn adm-dialog-confirm" onClick={onConfirm} disabled={busy} aria-busy={busy || undefined}>
            {busy ? Ic.spinner : Ic.trash}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
