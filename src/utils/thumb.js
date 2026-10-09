// Thumbnail URL qoidasi (backend reja 2.2): bizning Storage'ga yuklangan rasm `<papka>/<fayl>` uchun
// `<papka>/<fayl>.thumb.webp` (640 px, WebP) ham yaratiladi. Bazada faqat original URL saqlanadi.
// Faqat 2.2 dan keyin yuklangan rasmlarda thumbnail bor — eski rasmlarda yo'q, shuning uchun
// <ThumbImg> thumbnail yuklanmasa originalga qaytadi.
const OWN_STORAGE = /\/storage\/v1\/object\/public\/[^/?#]+\/(?:news|events|teachers|gallery)\/[^/?#]+$/
const THUMB_SUFFIX = '.thumb.webp'

// Thumbnail bo'lishi mumkin bo'lgan URL uchun thumbnail manzili, aks holda `null`
// (tashqi/begona URL, blob:, data:, bo'sh qiymat, allaqachon thumbnail).
export function thumbUrl(url) {
  if (typeof url !== 'string' || !OWN_STORAGE.test(url) || url.endsWith(THUMB_SUFFIX)) return null
  return url + THUMB_SUFFIX
}
