import { useState } from 'react'
import { Ic } from './Icons.jsx'
import { FieldError } from './FormField.jsx'
import { markBroken } from './helpers'

// Ko'p rasm maydoni (6.24 — taxta: Admin-News «Rasmlar»): punktir yuklash maydoni (bosish + drag-and-drop),
// miniatyuralar (birinchisida «Muqova», yangi tanlanganlarda «Yangi»), olib tashlash tugmasi, fayl xatosi.
// Mantiq `useMultiImageUpload` da (`addFiles`, `removeImage`, `fileRef`); bu yerda faqat ko'rinish.
//
// - `<input type=file>` ko'rinmas, lekin klaviaturadan fokuslanadi (`.adm-sr-only`; `display: none` EMAS) — fokus halqasi
//   yuklash maydonida (`:has(:focus-visible)`);
// - drag faqat fayl sudralganda yoqiladi (matn/havola sudralganda emas);
// - `disabled` (saqlanayotganda) — yuklash va olib tashlash o'chiq.
export default function ImageField({
  id,
  label = 'Rasmlar',
  previews,
  max,
  error,
  hint,
  disabled = false,
  coverLabel = 'Muqova',
  inputRef,
  onFiles,
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
    // bola elementlar ustidan o'tishda `dragleave` yolg'on ishlamasin
    if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false)
  }
  function handleDrop(e) {
    if (disabled || !hasFiles(e)) return
    e.preventDefault()
    setDrag(false)
    onFiles(e.dataTransfer.files)
  }

  const limits = `JPEG, PNG, WebP, GIF · har biri ≤ 5 MB${max ? ` · ${max} tagacha` : ''}`

  return (
    <div className="adm-fld" role="group" aria-labelledby={`${id}-label`}>
      <div className="adm-fld-head">
        <span id={`${id}-label`} className="adm-fld-label">{label}</span>
        <span className="adm-fld-count">{previews.length} ta</span>
      </div>
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
          <span className="adm-dz-title">{drag ? 'Rasmlarni bu yerga tashlang' : "Rasm qo'shish"}</span>
          <span className="adm-dz-text">{drag ? "qo'yib yuboring" : 'yoki fayl tanlash uchun bosing'} · {limits}</span>
        </span>
        <input
          ref={inputRef}
          id={id}
          className="adm-sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={disabled}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          onChange={e => onFiles(e.target.files)}
        />
      </label>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      {previews.length > 0 && (
        <ul className="adm-ithumbs">
          {previews.map((p, i) => (
            <li key={`${i}:${p.url}`} className="adm-ithumb" data-new={p.isNew ? 'true' : 'false'}>
              <img className="adm-ithumb-img" src={p.url} alt={`rasm-${i + 1}`} loading="lazy" onError={markBroken} />
              {i === 0 && coverLabel && <span className="adm-ithumb-badge adm-ithumb-badge--cover">{coverLabel}</span>}
              {p.isNew && <span className="adm-ithumb-badge adm-ithumb-badge--new">Yangi</span>}
              <button type="button" className="adm-ithumb-x" aria-label="Rasmni olib tashlash" disabled={disabled} onClick={() => onRemove(i)}>
                {Ic.close}
              </button>
            </li>
          ))}
        </ul>
      )}
      {hint && <p className="adm-fld-hint">{hint}</p>}
    </div>
  )
}
