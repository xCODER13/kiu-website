import { useState } from 'react'
import { Ic } from './Icons.jsx'
import { FieldError } from './FormField.jsx'
import { markBroken } from './helpers'

// Bitta rasm (poster) maydoni (6.25 — taxta: Admin-Events «Poster rasm»). Ko'p rasmli `ImageField` ning
// (Yangiliklar) bitta rasmlik varianti; mantiq `useSingleImageUpload` da, bu yerda faqat ko'rinish.
//
// - rasm yo'q: punktir yuklash maydoni (bosish + drag-and-drop);
// - rasm bor: 192×108 (16:9) ko'rinish (mavjud — 1 px chegara, yangi tanlangan — 2 px brend + «Yangi» belgisi) va
//   yonida «Rasmni almashtirish» / «Olib tashlash» tugmalari;
// - `<input type=file>` ko'rinmas, lekin klaviaturadan fokuslanadi (`.adm-sr-only`; `display: none` EMAS), fokus halqasi
//   o'rab turgan yorliqda (`:has(:focus-visible)`);
// - drag faqat fayl sudralganda yoqiladi; `disabled` (saqlanayotganda) — hammasi o'chiq.
export default function PosterField({
  id,
  label = 'Poster rasm',
  addLabel = "Poster qo'shish",           // Talabalar hayoti «Bo'limlar» o'z matnini beradi; Tadbirlar — o'zgarishsiz
  dropLabel = 'Posterni bu yerga tashlang',
  note = " — bo'lmasa sana-belgi ko'rsatiladi.",
  alt = 'poster',
  preview,            // { url, isNew } | null
  error,
  hint,
  disabled = false,
  inputRef,
  onFile,
  onRemove,
}) {
  const [drag, setDrag] = useState(false)
  const hasFiles = e => Array.from(e.dataTransfer?.types ?? []).includes('Files')

  function handleDrag(e) {
    if (disabled || !hasFiles(e)) return
    e.preventDefault()
    setDrag(true)
  }
  function handleLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false)
  }
  function handleDrop(e) {
    if (disabled || !hasFiles(e)) return
    e.preventDefault()
    setDrag(false)
    onFile(e.dataTransfer.files[0])
  }

  const input = (
    <input
      ref={inputRef}
      id={id}
      className="adm-sr-only"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      disabled={disabled}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={error ? 'true' : undefined}
      onChange={e => onFile(e.target.files?.[0])}
    />
  )
  const limits = 'JPEG, PNG, WebP, GIF · ≤ 5 MB · ixtiyoriy'

  return (
    <div className="adm-fld" role="group" aria-labelledby={`${id}-label`}>
      <div className="adm-fld-head">
        <span id={`${id}-label`} className="adm-fld-label">{label}</span>
      </div>
      {preview ? (
        <div className="adm-poster">
          <div className="adm-poster-img" data-new={preview.isNew ? 'true' : 'false'}>
            <img src={preview.url} alt={alt} loading="lazy" onError={markBroken} />
            {preview.isNew && <span className="adm-ithumb-badge adm-ithumb-badge--new">Yangi</span>}
          </div>
          <div className="adm-poster-side">
            <div className="adm-poster-actions">
              <label className="btn btn-secondary btn-sm adm-poster-btn" data-disabled={disabled ? 'true' : undefined}>
                {Ic.photo}Rasmni almashtirish
                {input}
              </label>
              <button type="button" className="btn btn-danger btn-sm adm-poster-remove" aria-label="Rasmni olib tashlash" disabled={disabled} onClick={onRemove}>
                {Ic.trash}Olib tashlash
              </button>
            </div>
            <p className="adm-fld-hint adm-poster-hint">{limits}{note}</p>
          </div>
        </div>
      ) : (
        <label
          className="adm-dz"
          data-drag={drag ? 'true' : 'false'}
          data-disabled={disabled ? 'true' : undefined}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleLeave}
          onDrop={handleDrop}
        >
          <span className="adm-dz-icon" aria-hidden="true">{Ic.photo}</span>
          <span className="adm-dz-body">
            <span className="adm-dz-title">{drag ? dropLabel : addLabel}</span>
            <span className="adm-dz-text">{drag ? "qo'yib yuboring" : 'yoki fayl tanlash uchun bosing'} · {limits}</span>
          </span>
          {input}
        </label>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      {hint && <p className="adm-fld-hint">{hint}</p>}
    </div>
  )
}
