import { useEffect, useRef } from 'react'
import { Ic } from './shared/Icons.jsx'
import FormField from './shared/FormField.jsx'
import ImageField from './shared/ImageField.jsx'
import { ErrorBanner } from './shared/StateViews.jsx'
import { formatCount, fieldProps } from './shared/helpers'
import { NEWS_CATEGORIES, TITLE_MAX, CONTENT_MAX, MAX_IMAGES } from './shared/constants'

// Yangilik formasi (6.24 — taxta: Admin-News «Yangi yangilik: forma»). Boshqariladigan komponent: holat va
// tarmoq so'rovlari `NewsAdmin` da. Tartib: Sarlavha → Kategoriya | Shorts → Rasmlar → Matn.
//
// - `<form noValidate>`: tekshiruv o'zimizda — maydon ostida `role="alert"` xabar (avval 4 ta `alert()`);
// - saqlanayotganda `<fieldset disabled>` — barcha maydonlar bloklanadi, tugma `aria-busy`;
// - server xatosi forma tepasida banner, forma to'la holda qoladi.
export default function NewsForm({
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
  shortsRef,
  onSubmit,
  onClose,
}) {
  // Xato forma tepasida chiqadi, foydalanuvchi esa pastdagi tugma yonida — xabar ko'rinadigan joyga keltiriladi
  const bannerRef = useRef(null)
  useEffect(() => { if (serverError) bannerRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }) }, [serverError])

  // Eski ma'lumotda ro'yxatda yo'q kategoriya bo'lishi mumkin — jimgina boshqasiga almashmasin
  const categories = NEWS_CATEGORIES.includes(values.category) ? NEWS_CATEGORIES : [...NEWS_CATEGORIES, values.category]
  const shortsHint = "Faqat Shorts bo'lsa to'ldiring — yozuv «YouTube Shorts» bo'limiga tushadi."

  return (
    <form className="adm-card adm-formcard" noValidate onSubmit={onSubmit} aria-labelledby="news-form-title">
      <div className="adm-formcard-head">
        <h3 id="news-form-title" className="adm-formcard-title">{isEditing ? 'Tahrirlash' : 'Yangi yangilik'}</h3>
        <button type="button" className="adm-formcard-close" aria-label="Formani yopish" onClick={onClose} disabled={saving}>
          {Ic.close}
        </button>
      </div>

      {serverError && <div className="adm-form-banner" ref={bannerRef}><ErrorBanner>{serverError}</ErrorBanner></div>}

      <fieldset className="adm-fieldset" disabled={saving}>
        <FormField
          id="news-title"
          label="Sarlavha"
          required
          count={`${formatCount(values.title.length)} / ${formatCount(TITLE_MAX)}`}
          error={errors.title}
        >
          <input
            {...fieldProps('news-title', { error: errors.title })}
            ref={titleRef}
            className="adm-ctl"
            value={values.title}
            maxLength={TITLE_MAX}
            placeholder="Yangilik sarlavhasi"
            aria-required="true"
            onChange={e => onChange('title', e.target.value)}
          />
        </FormField>

        <div className="adm-form-cols">
          <FormField id="news-category" label="Kategoriya">
            <div className="adm-select">
              <select id="news-category" className="adm-ctl adm-ctl--select" value={values.category} onChange={e => onChange('category', e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="adm-select-icon" aria-hidden="true">{Ic.chevronDown}</span>
            </div>
          </FormField>
          <FormField id="news-shorts" label="YouTube Shorts havolasi" hint={shortsHint} error={errors.shortsUrl}>
            <div className="adm-input-wrap">
              <span className="adm-input-icon" aria-hidden="true">{Ic.camera}</span>
              <input
                {...fieldProps('news-shorts', { error: errors.shortsUrl, hint: shortsHint })}
                ref={shortsRef}
                className="adm-ctl adm-ctl--icon"
                value={values.shortsUrl}
                maxLength={500}
                inputMode="url"
                autoComplete="off"
                placeholder="https://youtube.com/shorts/VIDEO_ID"
                onChange={e => onChange('shortsUrl', e.target.value)}
              />
            </div>
          </FormField>
        </div>

        <ImageField
          id="news-images"
          previews={images.imagePreviews}
          max={MAX_IMAGES}
          error={imageError}
          hint="Birinchi rasm muqova bo'ladi (yangiliklar kartasida va slayderda ko'rinadi)."
          disabled={saving}
          inputRef={images.fileRef}
          onFiles={onFiles}
          onRemove={images.removeImage}
        />

        <FormField id="news-content" label="Matn" count={`${formatCount(values.content.length)} / ${formatCount(CONTENT_MAX)}`}>
          <textarea
            id="news-content"
            className="adm-ctl adm-ctl--area"
            rows={6}
            value={values.content}
            maxLength={CONTENT_MAX}
            placeholder="Yangilik matni"
            onChange={e => onChange('content', e.target.value)}
          />
        </FormField>
      </fieldset>

      {saving && (
        <p className="adm-form-saving" role="status">
          <span className="adm-form-saving-icon" aria-hidden="true">{Ic.spinner}</span>
          Rasmlar yuklanmoqda va yangilik saqlanmoqda...
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
