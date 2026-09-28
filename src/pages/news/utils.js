// Rasm maydonidan URL massivini olish (eski va yangi format). News.jsx'dan
// o'zgarishsiz ko'chirilgan (Home.jsx va NewsDetail.jsx'da ham xuddi shu
// mantiq takrorlangan — bu bo'lishdan oldin ham shunday edi).
export function parseImages(imageField) {
  if (!imageField) return []
  try {
    const parsed = JSON.parse(imageField)
    if (Array.isArray(parsed)) return parsed
  } catch { return [imageField] }
  return [imageField]
}