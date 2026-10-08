import { Ic } from './Icons.jsx'
import { FieldError } from './FormField.jsx'
import Avatar from './Avatar.jsx'

// O'qituvchi fotosi maydoni (6.27 — taxta: Admin-Teachers «Foto»). Bitta rasmlik `PosterField` ning doira varianti:
// mantiq `useSingleImageUpload` da, bu yerda faqat ko'rinish.
//
// - foto yo'q: 96 px doirada saytda ko'rinadigan bosh harflar (jonli ko'rinish — «Bosh harflar» maydoni bilan o'zgaradi) va «Foto qo'shish»;
// - foto bor: doira (mavjud — 1 px chegara, yangi tanlangan — 3 px brend halqa + «Yangi» belgisi) va «Fotoni almashtirish» / «Olib tashlash»;
// - `<input type=file>` ko'rinmas, lekin klaviaturadan fokuslanadi (`.adm-sr-only`; `display: none` EMAS), fokus halqasi
//   o'rab turgan tugma-yorliqda (`:has(:focus-visible)`);
// - `disabled` (saqlanayotganda) — hammasi o'chiq.
export default function AvatarField({
  id,
  label = 'Foto',
  name,
  avatar,
  preview,            // { url, isNew } | null
  error,
  disabled = false,
  inputRef,
  onFile,
  onRemove,
}) {
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

  return (
    <div className="adm-fld" role="group" aria-labelledby={`${id}-label`}>
      <div className="adm-fld-head">
        <span id={`${id}-label`} className="adm-fld-label">{label}</span>
      </div>
      <div className="adm-avfield">
        <div className="adm-avfield-pic" data-new={preview?.isNew ? 'true' : 'false'} data-has={preview ? 'true' : 'false'}>
          <Avatar size="lg" name={name} avatar={avatar} image={preview?.url} />
          {preview?.isNew && <span className="adm-avfield-new">Yangi</span>}
        </div>
        <div className="adm-avfield-side">
          <div className="adm-poster-actions">
            <label className="btn btn-secondary btn-sm adm-poster-btn" data-disabled={disabled ? 'true' : undefined}>
              {Ic.photo}{preview ? 'Fotoni almashtirish' : "Foto qo'shish"}
              {input}
            </label>
            {preview && (
              <button type="button" className="btn btn-danger btn-sm adm-poster-remove" aria-label="Fotoni olib tashlash" disabled={disabled} onClick={onRemove}>
                {Ic.trash}Olib tashlash
              </button>
            )}
          </div>
          <p className="adm-fld-hint adm-poster-hint">JPEG, PNG, WebP, GIF · ≤ 5 MB · foto bo'lmasa saytda bosh harflar ko'rsatiladi.</p>
        </div>
      </div>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}
