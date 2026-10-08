import { useEffect, useRef } from 'react'
import { Ic } from './shared/Icons.jsx'
import FormField from './shared/FormField.jsx'
import ImageField from './shared/ImageField.jsx'
import { ErrorBanner } from './shared/StateViews.jsx'
import { formatCount, fieldProps } from './shared/helpers'
import { GALLERY_TITLE_MAX, GALLERY_DESC_MAX, MAX_IMAGES } from './shared/constants'

// Albom formasi (6.26 — taxta: Admin-Gallery «Yangi albom: forma»). Boshqariladigan komponent: holat va tarmoq
// so'rovlari `GalleryAdmin` da. Tartib (bir ustun): Nomi → Tavsif → Rasmlar. `NewsForm` bilan bir xil qoidalar:
// `<form noValidate>` (tekshiruv o'zimizda — maydon ostida `role="alert"`), saqlanayotganda `<fieldset disabled>`,
// server xatosi forma tepasida banner (forma va tanlangan fayllar saqlanib qoladi).
export default function GalleryForm({
  isEditing,
  values,
  onChange,
  errors,
  images,
  imageError,
  onFiles,
  saving,
  serverError,
  titleRef,
  onSubmit,
  onClose,
}) {
  const bannerRef = useRef(null)
  useEffect(() => { if (serverError) bannerRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }) }, [serverError])

  const newCount = images.imageFiles.length
  const hint = (
    <>
      Saytdagi galereyada albomdagi <strong>har bir rasm alohida karta</strong> bo'lib chiqadi; nom va tavsif hammasida
      takrorlanadi. Rasmlar yuklangan tartibda ko'rsatiladi.
    </>
  )

  return (
    <form className="adm-card adm-formcard" noValidate onSubmit={onSubmit} aria-labelledby="gallery-form-title">
      <div className="adm-formcard-head">
        <h3 id="gallery-form-title" className="adm-formcard-title">{isEditing ? 'Tahrirlash' : 'Yangi albom'}</h3>
        <button type="button" className="adm-formcard-close" aria-label="Formani yopish" onClick={onClose} disabled={saving}>
          {Ic.close}
        </button>
      </div>

      {serverError && <div className="adm-form-banner" ref={bannerRef}><ErrorBanner>{serverError}</ErrorBanner></div>}

      <fieldset className="adm-fieldset" disabled={saving}>
        <FormField
          id="gallery-title"
          label="Nomi"
          required
          count={`${formatCount(values.title.length)} / ${formatCount(GALLERY_TITLE_MAX)}`}
          error={errors.title}
        >
          <input
            {...fieldProps('gallery-title', { error: errors.title })}
            ref={titleRef}
            className="adm-ctl"
            value={values.title}
            maxLength={GALLERY_TITLE_MAX}
            placeholder="1-kampus"
            aria-required="true"
            onChange={e => onChange('title', e.target.value)}
          />
        </FormField>

        <FormField id="gallery-desc" label="Tavsif" count={`${formatCount(values.desc.length)} / ${formatCount(GALLERY_DESC_MAX)}`}>
          <textarea
            id="gallery-desc"
            className="adm-ctl adm-ctl--area adm-ctl--area-sm"
            rows={3}
            value={values.desc}
            maxLength={GALLERY_DESC_MAX}
            placeholder="Kampus binosi, hovli va kutubxona"
            onChange={e => onChange('desc', e.target.value)}
          />
        </FormField>

        <ImageField
          id="gallery-images"
          required
          showMax
          numbered
          lockAtMax
          coverLabel={null}
          fullLabel="Albom"
          previews={images.imagePreviews}
          max={MAX_IMAGES}
          error={imageError}
          hint={hint}
          disabled={saving}
          inputRef={images.fileRef}
          onFiles={onFiles}
          onRemove={images.removeImage}
        />
      </fieldset>

      {saving && (
        <p className="adm-form-saving" role="status">
          <span className="adm-form-saving-icon" aria-hidden="true">{Ic.spinner}</span>
          {newCount > 0 ? `${newCount} ta rasm yuklanmoqda va albom saqlanmoqda...` : 'Albom saqlanmoqda...'}
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
