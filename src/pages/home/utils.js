// Home.jsx'dan ko'chirilgan yordamchi funksiya.

// DIQQAT: bu News.jsx (news/utils.js) va NewsDetail.jsx'dagi parseImages bilan
// so'zma-so'z bir xil — bo'lish paytida aniqlangan mavjud dublikat, ammo bu
// band doirasidan tashqarida bo'lgani uchun birlashtirilmadi (faqat kuzatuv
// sifatida qayd etilmoqda).
export function parseImages(imageField) {
  if (!imageField) return []
  try {
    const parsed = JSON.parse(imageField)
    if (Array.isArray(parsed)) return parsed
  } catch {
    return [imageField]
  }
  return [imageField]
}
