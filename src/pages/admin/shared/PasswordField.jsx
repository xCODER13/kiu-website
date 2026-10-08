import { useState } from 'react'
import { Ic } from './Icons.jsx'
import FormField from './FormField.jsx'
import { fieldProps } from './helpers'

// Parol maydoni (6.28 — taxta: Admin-Profil «Parol maydoni»). `FormField` ustiga: ko'rinadigan yorliq `htmlFor` bilan bog'lanadi,
// o'ngda 36×36 «ko'z» tugmasi (`type="password"` ↔ `"text"`, `aria-pressed`, `aria-label`), xato — maydon ostida `role="alert"`,
// `ok` (masalan, «Parollar mos.») — `role="status"`. `autoComplete` majburiy: parol menejerlari joriy/yangi parolni ajratadi.
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  autoComplete,
  placeholder,
  error,
  ok,
  disabled = false,
  inputRef,
  children,   // maydon ostidagi qo'shimcha (kuch o'lchagichi)
}) {
  const [shown, setShown] = useState(false)
  const okId = `${id}-ok`
  const props = fieldProps(id, { error })
  if (!error && ok) props['aria-describedby'] = okId

  return (
    <FormField id={id} label={label} required error={error}>
      <div className="adm-pw">
        <input
          {...props}
          ref={inputRef}
          className="adm-ctl adm-ctl--pw"
          type={shown ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-required="true"
          data-ok={!error && ok ? 'true' : undefined}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
        />
        <button
          type="button"
          className="adm-pw-eye"
          aria-pressed={shown}
          aria-label={shown ? 'Parolni yashirish' : "Parolni ko'rsatish"}
          disabled={disabled}
          onClick={() => setShown(s => !s)}
        >
          {shown ? Ic.eyeOff : Ic.eye}
        </button>
      </div>
      {!error && ok && <p id={okId} className="adm-fld-ok" role="status">{Ic.check}<span>{ok}</span></p>}
      {children}
    </FormField>
  )
}
