import { useEffect, useRef } from 'react'
import { Ic } from './shared/Icons.jsx'
import FormField from './shared/FormField.jsx'
import PosterField from './shared/PosterField.jsx'
import { ErrorBanner } from './shared/StateViews.jsx'
import { formatCount, fieldProps } from './shared/helpers'
import { TITLE_MAX, EVENT_DESC_MAX, EVENT_TYPES } from './shared/constants'

// Tadbir formasi (6.25 — taxta: Admin-Events «Yangi tadbir: forma»). Boshqariladigan komponent: holat va tarmoq
// so'rovlari `EventsAdmin` da. Tartib: Sarlavha → Sana | Turi → Poster rasm → Tavsif. `NewsForm` bilan bir xil qoidalar:
// `<form noValidate>` (tekshiruv o'zimizda — maydon ostida `role="alert"`), saqlanayotganda `<fieldset disabled>`,
// server xatosi forma tepasida banner (forma to'la holda qoladi).
export default function EventsForm({
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
  dateRef,
  onSubmit,
  onClose,
}) {
  const bannerRef = useRef(null)
  useEffect(() => { if (serverError) bannerRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }) }, [serverError])

  // Eski ma'lumotda ro'yxatda yo'q tur bo'lishi mumkin — jimgina boshqasiga almashmasin
  const types = EVENT_TYPES.some(t => t.value === values.type) ? EVENT_TYPES : [...EVENT_TYPES, { value: values.type, label: values.type }]

  return (
    <form className="adm-card adm-formcard" noValidate onSubmit={onSubmit} aria-labelledby="event-form-title">
      <div className="adm-formcard-head">
        <h3 id="event-form-title" className="adm-formcard-title">{isEditing ? 'Tahrirlash' : 'Yangi tadbir'}</h3>
        <button type="button" className="adm-formcard-close" aria-label="Formani yopish" onClick={onClose} disabled={saving}>
          {Ic.close}
        </button>
      </div>

      {serverError && <div className="adm-form-banner" ref={bannerRef}><ErrorBanner>{serverError}</ErrorBanner></div>}

      <fieldset className="adm-fieldset" disabled={saving}>
        <FormField
          id="event-title"
          label="Sarlavha"
          required
          count={`${formatCount(values.title.length)} / ${formatCount(TITLE_MAX)}`}
          error={errors.title}
        >
          <input
            {...fieldProps('event-title', { error: errors.title })}
            ref={titleRef}
            className="adm-ctl"
            value={values.title}
            maxLength={TITLE_MAX}
            placeholder="Tadbir nomi"
            aria-required="true"
            onChange={e => onChange('title', e.target.value)}
          />
        </FormField>

        <div className="adm-form-cols">
          <FormField id="event-date" label="Sana" required error={errors.eventDate}>
            <div className="adm-input-wrap">
              <span className="adm-input-icon" aria-hidden="true">{Ic.events}</span>
              <input
                {...fieldProps('event-date', { error: errors.eventDate })}
                ref={dateRef}
                className="adm-ctl adm-ctl--icon"
                type="date"
                value={values.eventDate}
                aria-required="true"
                onChange={e => onChange('eventDate', e.target.value)}
              />
            </div>
          </FormField>
          <FormField id="event-type" label="Turi">
            <div className="adm-select">
              <select id="event-type" className="adm-ctl adm-ctl--select" value={values.type} onChange={e => onChange('type', e.target.value)}>
                {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <span className="adm-select-icon" aria-hidden="true">{Ic.chevronDown}</span>
            </div>
          </FormField>
        </div>

        <PosterField
          id="event-poster"
          preview={poster.imagePreview ? { url: poster.imagePreview, isNew: !!poster.imageFile } : null}
          error={posterError}
          disabled={saving}
          inputRef={poster.fileRef}
          onFile={onFile}
          onRemove={poster.clearImage}
        />

        <FormField id="event-desc" label="Tavsif" count={`${formatCount(values.desc.length)} / ${formatCount(EVENT_DESC_MAX)}`}>
          <textarea
            id="event-desc"
            className="adm-ctl adm-ctl--area adm-ctl--area-sm"
            rows={4}
            value={values.desc}
            maxLength={EVENT_DESC_MAX}
            placeholder="Tadbir haqida qisqacha"
            onChange={e => onChange('desc', e.target.value)}
          />
        </FormField>
      </fieldset>

      {saving && (
        <p className="adm-form-saving" role="status">
          <span className="adm-form-saving-icon" aria-hidden="true">{Ic.spinner}</span>
          Poster yuklanmoqda va tadbir saqlanmoqda...
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
