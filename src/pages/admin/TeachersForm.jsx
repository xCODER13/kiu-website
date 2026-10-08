import { useEffect, useRef } from 'react'
import { Ic } from './shared/Icons.jsx'
import FormField from './shared/FormField.jsx'
import AvatarField from './shared/AvatarField.jsx'
import { ErrorBanner } from './shared/StateViews.jsx'
import { formatCount, fieldProps } from './shared/helpers'
import { TEACHER_NAME_MAX, TEACHER_ROLE_MAX, TEACHER_AVATAR_MAX, KAFEDRALAR } from './shared/constants'

// O'qituvchi formasi (6.27 — taxta: Admin-Teachers «Yangi o'qituvchi» / «Tahrirlash»). Boshqariladigan komponent: holat va tarmoq
// so'rovlari `TeachersAdmin` da. Tartib: To'liq ism → Lavozim | Kafedra → Bosh harflar (yarim kenglik) → Foto. `NewsForm` bilan
// bir xil qoidalar: `<form noValidate>` (tekshiruv o'zimizda — maydon ostida `role="alert"`), saqlanayotganda `<fieldset disabled>`,
// server xatosi forma tepasida banner (forma va tanlangan foto saqlanib qoladi).
export default function TeachersForm({
  isEditing,
  values,
  onChange,
  errors,
  photo,
  photoError,
  onFile,
  saving,
  serverError,
  nameRef,
  onSubmit,
  onClose,
}) {
  const bannerRef = useRef(null)
  useEffect(() => { if (serverError) bannerRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }) }, [serverError])

  // Eski yoki o'zgargan kafedra nomi (ro'yxatda yo'q): qiymat ko'rinib turadi, lekin tanlab bo'lmaydi — ogohlantirish chiqadi
  // (avval `<select>` mos `option` topmasa bo'sh ko'rinardi va `dept` bo'sh ketardi).
  const unknownDept = !!values.dept && !KAFEDRALAR.includes(values.dept)
  const deptWarn = unknownDept && !errors.dept
  const deptProps = fieldProps('teacher-dept', { error: errors.dept })
  if (deptWarn) deptProps['aria-describedby'] = 'teacher-dept-warn'

  const photoPreview = photo.imagePreview ? { url: photo.imagePreview, isNew: !!photo.imageFile } : null

  return (
    <form className="adm-card adm-formcard" noValidate onSubmit={onSubmit} aria-labelledby="teacher-form-title">
      <div className="adm-formcard-head">
        <h3 id="teacher-form-title" className="adm-formcard-title">{isEditing ? 'Tahrirlash' : "Yangi o'qituvchi"}</h3>
        <button type="button" className="adm-formcard-close" aria-label="Formani yopish" onClick={onClose} disabled={saving}>
          {Ic.close}
        </button>
      </div>

      {serverError && <div className="adm-form-banner" ref={bannerRef}><ErrorBanner>{serverError}</ErrorBanner></div>}

      <fieldset className="adm-fieldset" disabled={saving}>
        <FormField
          id="teacher-name"
          label="To'liq ism"
          required
          count={`${formatCount(values.name.length)} / ${formatCount(TEACHER_NAME_MAX)}`}
          error={errors.name}
        >
          <input
            {...fieldProps('teacher-name', { error: errors.name })}
            ref={nameRef}
            className="adm-ctl"
            value={values.name}
            maxLength={TEACHER_NAME_MAX}
            placeholder="Familiya Ism Sharif"
            aria-required="true"
            onChange={e => onChange('name', e.target.value)}
          />
        </FormField>

        <div className="adm-form-cols">
          <FormField
            id="teacher-role"
            label="Lavozim"
            required
            count={`${formatCount(values.role.length)} / ${formatCount(TEACHER_ROLE_MAX)}`}
            error={errors.role}
          >
            <input
              {...fieldProps('teacher-role', { error: errors.role })}
              className="adm-ctl"
              value={values.role}
              maxLength={TEACHER_ROLE_MAX}
              placeholder="O'qituvchi / Dotsent"
              aria-required="true"
              onChange={e => onChange('role', e.target.value)}
            />
          </FormField>

          <FormField id="teacher-dept" label="Kafedra" required error={errors.dept}>
            <div className="adm-select">
              <select
                {...deptProps}
                className="adm-ctl adm-ctl--select"
                value={values.dept}
                data-warn={deptWarn ? 'true' : undefined}
                aria-required="true"
                onChange={e => onChange('dept', e.target.value)}
              >
                <option value="">— Kafedrani tanlang —</option>
                {unknownDept && <option value={values.dept}>{values.dept}</option>}
                {KAFEDRALAR.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <span className="adm-select-icon" aria-hidden="true">{Ic.chevronDown}</span>
            </div>
            {deptWarn && (
              <p id="teacher-dept-warn" className="adm-fld-warn" role="status">
                {Ic.warn}
                <span>Bu kafedra ro'yxatda yo'q. Saqlashdan oldin ro'yxatdan tanlang.</span>
              </p>
            )}
          </FormField>
        </div>

        <div className="adm-form-cols">
          <FormField
            id="teacher-avatar"
            label="Bosh harflar"
            count={`${formatCount(values.avatar.length)} / ${TEACHER_AVATAR_MAX}`}
            hint="Foto bo'lmasa saytda shu 2 harf ko'rinadi. Bo'sh qolsa — ismning birinchi 2 harfi."
          >
            <input
              {...fieldProps('teacher-avatar', { hint: true })}
              className="adm-ctl"
              value={values.avatar}
              maxLength={TEACHER_AVATAR_MAX}
              placeholder="AB"
              onChange={e => onChange('avatar', e.target.value)}
            />
          </FormField>
        </div>

        <AvatarField
          id="teacher-photo"
          name={values.name}
          avatar={values.avatar}
          preview={photoPreview}
          error={photoError}
          disabled={saving}
          inputRef={photo.fileRef}
          onFile={onFile}
          onRemove={photo.clearImage}
        />
      </fieldset>

      {saving && (
        <p className="adm-form-saving" role="status">
          <span className="adm-form-saving-icon" aria-hidden="true">{Ic.spinner}</span>
          {photo.imageFile ? "Foto yuklanmoqda va o'qituvchi saqlanmoqda..." : "O'qituvchi saqlanmoqda..."}
        </p>
      )}

      <div className="adm-form-foot">
        <button type="submit" className="btn btn-primary adm-save" disabled={saving} aria-busy={saving || undefined}>
          {!saving && Ic.save}
          {saving ? 'Saqlanmoqda...' : isEditing ? 'Saqlash' : "Qo'shish"}
        </button>
        <button type="button" className="btn adm-btn-neutral" onClick={onClose} disabled={saving}>Bekor qilish</button>
        <span className="adm-form-req">* majburiy maydon</span>
      </div>
    </form>
  )
}
