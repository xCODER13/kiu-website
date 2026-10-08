import { Ic } from './Icons.jsx'

// Admin formalarining umumiy maydoni (6.24 — taxta: Admin-News «Forma»). Avval har sahifa o'z `label` + `input`
// juftligini yozardi: yorliq 11 px UPPERCASE, `htmlFor` yo'q, xato `alert()` bilan chiqardi.
//
// - ko'rinadigan yorliq (14/600) `<label htmlFor>` bilan inputga bog'lanadi; `*` faqat ko'rinish uchun (`aria-hidden`),
//   majburiylik inputdagi `aria-required` da;
// - o'ng tomonda hisoblagich («0 / 300»);
// - `fieldProps(id, { error, hint })` (helpers.js) inputga `id`, `aria-invalid`, `aria-describedby` beradi;
// - xato (`role="alert"`) maydon ostida: input `aria-invalid` + `aria-describedby`; xato bor paytda izoh o'rniga xato chiqadi.
export function FieldError({ id, children }) {
  return (
    <p id={id} className="adm-fld-error" role="alert">
      {Ic.alert}
      <span>{children}</span>
    </p>
  )
}

export default function FormField({ id, label, required = false, count, hint, error, children }) {
  return (
    <div className="adm-fld">
      <div className="adm-fld-head">
        <label className="adm-fld-label" htmlFor={id}>
          {label}
          {required && <span className="adm-fld-req" aria-hidden="true"> *</span>}
        </label>
        {count != null && <span className="adm-fld-count">{count}</span>}
      </div>
      {children}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : hint && <p id={`${id}-hint`} className="adm-fld-hint">{hint}</p>}
    </div>
  )
}
