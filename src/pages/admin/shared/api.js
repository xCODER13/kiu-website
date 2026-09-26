// Admin panelning barcha bo'limlari uchun umumiy API helperlari.
// Avval Dashboard.jsx ichida bitta joyda edi — bo'lingandan keyin
// har bir admin komponenti shu yerdan import qiladi.
export const API = import.meta.env.VITE_API_URL + '/api'

// Token bo'lmasa Authorization headeri umuman yuborilmaydi ("Bearer null" emas)
const authHeader = () => {
  const t = localStorage.getItem('kiu_token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export const H = () => ({
  'Content-Type': 'application/json',
  ...authHeader(),
})

// FormData bilan yuboriladigan so'rovlar uchun — Content-Type qo'lda
// qo'yilmaydi, brauzer o'zi to'g'ri multipart boundary bilan qo'yadi.
// Buni H() bilan aralashtirib bo'lmaydi: 'Content-Type': 'application/json'
// qo'yilsa, multipart body butunlay noto'g'ri parslanadi.
export const HF = () => authHeader()

// Admin API 401 qaytarsa (token muddati o'tgan / bekor qilingan, masalan parol
// o'zgargandan keyin) — tokenni o'chirib, onUnauthorized() ni chaqiradi.
// Barcha admin komponentlari to'g'ridan-to'g'ri fetch ishlatgani uchun bitta joyda
// window.fetch o'raladi. Faqat bizning API'ga va Authorization bilan ketgan so'rovlar
// hisobga olinadi (login'ning noto'g'ri paroli 401 bermaydi va bu yerga kirmaydi).
// Qaytaradi: tozalash funksiyasi (unmount'da chaqiring).
export function installUnauthorizedHandler(onUnauthorized) {
  const original = window.fetch
  const wrapped = async function (input, init) {
    const res = await original.call(this, input, init)
    if (res.status === 401) {
      const url = typeof input === 'string' ? input : input?.url
      const headers = init?.headers || {}
      const hasAuth = !!(headers.Authorization || headers.authorization)
      if (hasAuth && typeof url === 'string' && url.startsWith(API)) {
        localStorage.removeItem('kiu_token')
        onUnauthorized()
      }
    }
    return res
  }
  window.fetch = wrapped
  return () => { if (window.fetch === wrapped) window.fetch = original }
}
