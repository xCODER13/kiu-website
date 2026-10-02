// YouTube Shorts URL'idan video ID ajratib olish. NewsAdmin'da
// "Shorts" bo'limi uchun ishlatiladi.
export function extractYouTubeShortsId(url) {
  if (!url) return ''
  try {
    const normalized = url.trim()
    const parsed = new URL(normalized)
    const hostname = parsed.hostname.replace('www.', '')
    if (hostname === 'youtu.be') return parsed.pathname.slice(1).split(/[^A-Za-z0-9_-]/)[0]
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/')[2]?.slice(0, 11) || ''
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v') || ''
      if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/v/')) return parsed.pathname.split('/')[2]?.slice(0, 11) || ''
    }
  } catch {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/))([\w-]{11})/)
    return match ? match[1] : ''
  }
  return ''
}

// Yordamchi: news.image maydonidan URL massivini olish (eski format —
// bitta string, yangi format — JSON massiv — ikkalasini ham qo'llab-quvvatlaydi)
export function parseImages(imageField) {
  if (!imageField) return []
  try {
    const parsed = JSON.parse(imageField)
    if (Array.isArray(parsed)) return parsed
  } catch { return [imageField] }
  return [imageField]  // eski format — bitta URL string
}

// <img onError> uchun: rasm yuklanmasa elementga `data-broken` qo'yadi — xira ko'rsatish yoki
// yashirish CSS da (admin.css `img[data-broken]`). Inline `style.opacity` kerak emas.
export function markBroken(e) {
  e.currentTarget.dataset.broken = 'true'
}
