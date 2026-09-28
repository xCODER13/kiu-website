// Home.jsx'dan o'zgarishsiz ko'chirilgan yordamchi funksiyalar.

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

export const navBtnStyle = (side) => ({
  position: 'absolute', [side]: 14, top: '50%', transform: 'translateY(-50%)',
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.25)',
  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(6px)',
})