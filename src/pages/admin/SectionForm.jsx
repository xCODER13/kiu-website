import { useEffect, useRef } from 'react'
import { Ic } from './shared/Icons.jsx'
import FormField from './shared/FormField.jsx'
import PosterField from './shared/PosterField.jsx'
import { ErrorBanner } from './shared/StateViews.jsx'
import { formatCount, fieldProps } from './shared/helpers'
import { STUDENT_LIFE_SECTIONS, SL_TITLE_MAX, SL_DESC_MAX, SL_LINK_MAX, SL_ORDER_MAX } from './shared/constants'

// «Bo'limlar» formasi (Talabalar hayoti): bo'lim → nomi → tavsif → havola → tartib → rasm. `EventsForm` bilan bir xil qoidalar:
// boshqariladigan komponent (holat va tarmoq `SectionsAdmin` da), `<form noValidate>`, xato maydon ostida `role="alert"`,
// saqlanayotganda `<fieldset disabled>`, server xatosi forma tepasida banner (kiritilgan ma'lumot saqlanib qoladi).
export default function SectionForm({
  isEditing,
  values,
  onChange,
  errors,
  poster,
  posterError,
  onFile,
  saving,
  serverError,
  titleRef,
  onSubmit,
  onClose,
}) {
  const bannerRef = useRef(null)
  useEffect(() => { if (serverError) bannerRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }) }, [serverError])

  return (
    <form className="adm-card adm-formcard" noValidate onSubmit={onSubmit} aria-labelledby="section-form-title">
      <div className="adm-formcard-head">
        <h3 id="section-form-title" className="adm-formcard-title">{isEditing ? 'Tahrirlash' : 'Yangi element'}</h3>
        <button type="button" className="adm-formcard-close" aria-label="Formani yopish" onClick={onClose} disabled={saving}>
          {Ic.close}
        </button>
      </div>

      {serverError && <div className="adm-form-banner" ref={bannerRef}><ErrorBanner>{serverError}</ErrorBanner></div>}

      <fieldset className="adm-fieldset" disabled={saving}>
        <FormField id="section-section" label="Bo'lim" required>
          <div className="adm-select">
            <select id="section-section" className="adm-ctl adm-ctl--select" value={values.section} onChange={e => onChange('section', e.target.value)}>
              {STUDENT_LIFE_SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <span className="adm-select-icon" aria-hidden="true">{Ic.chevronDown}</span>
          </div>
        </FormField>

        <FormField
          id="section-title"
          label="Nomi"
          required
          count={`${formatCount(values.title.length)} / ${formatCount(SL_TITLE_MAX)}`}
          error={errors.title}
        >
          <input
            {...fieldProps('section-title', { error: errors.title })}
            ref={titleRef}
            className="adm-ctl"
            value={values.title}
            maxLength={SL_TITLE_MAX}
            placeholder="Debat klubi"
            aria-required="true"
            onChange={e => onChange('title', e.target.value)}
          />
        </FormField>

        <FormField id="section-desc" label="Tavsif" count={`${formatCount(values.desc.length)} / ${formatCount(SL_DESC_MAX)}`}>
          <textarea
            id="section-desc"
            className="adm-ctl adm-ctl--area adm-ctl--area-sm"
            rows={4}
            value={values.desc}
            maxLength={SL_DESC_MAX}
            placeholder="Klub haqida qisqacha: nima bilan shug'ullanadi, uchrashuvlar qachon"
            onChange={e => onChange('desc', e.target.value)}
          />
        </FormField>

        <div className="adm-form-cols">
          <FormField
            id="section-link"
            label="Havola"
            count={`${formatCount(values.link.length)} / ${formatCount(SL_LINK_MAX)}`}
            error={errors.link}
            hint="Ixtiyoriy: Telegram kanali, Instagram va h.k. Faqat https:// bilan boshlanadi."
          >
            <input
              {...fieldProps('section-link', { error: errors.link, hint: true })}
              className="adm-ctl"
              type="url"
              inputMode="url"
              autoComplete="off"
              value={values.link}
              maxLength={SL_LINK_MAX}
              placeholder="https://t.me/kiu_debat"
              onChange={e => onChange('link', e.target.value)}
            />
          </FormField>
          <FormField
            id="section-order"
            label="Tartib raqami"
            error={errors.order}
            hint={`0–${formatCount(SL_ORDER_MAX)}. Kichigi birinchi chiqadi.`}
          >
            <input
              {...fieldProps('section-order', { error: errors.order, hint: true })}
              className="adm-ctl"
              type="number"
              inputMode="numeric"
              min={0}
              max={SL_ORDER_MAX}
              step={1}
              value={values.order}
              onChange={e => onChange('order', e.target.value)}
            />
          </FormField>
        </div>

        <PosterField
          id="section-image"
          label="Rasm"
          addLabel="Rasm qo'shish"
          dropLabel="Rasmni bu yerga tashlang"
          note=" — bo'lmasa karta rasmsiz chiqadi."
          alt="Tanlangan rasm"
          preview={poster.imagePreview ? { url: poster.imagePreview, isNew: !!poster.imageFile } : null}
          error={posterError}
          disabled={saving}
          inputRef={poster.fileRef}
          onFile={onFile}
          onRemove={poster.clearImage}
        />
      </fieldset>

      {saving && (
        <p className="adm-form-saving" role="status">
          <span className="adm-form-saving-icon" aria-hidden="true">{Ic.spinner}</span>
          {poster.imageFile ? 'Rasm yuklanmoqda va saqlanmoqda...' : 'Saqlanmoqda...'}
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
