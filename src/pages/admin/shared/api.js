// Admin panelning barcha bo'limlari uchun umumiy API helperlari.
// Avval Dashboard.jsx ichida bitta joyda edi — bo'lingandan keyin
// har bir admin komponenti shu yerdan import qiladi.
export const API = import.meta.env.VITE_API_URL + '/api'

export const H = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('kiu_token')}`,
})

// FormData bilan yuboriladigan so'rovlar uchun — Content-Type qo'lda
// qo'yilmaydi, brauzer o'zi to'g'ri multipart boundary bilan qo'yadi.
// Buni H() bilan aralashtirib bo'lmaydi: 'Content-Type': 'application/json'
// qo'yilsa, multipart body butunlay noto'g'ri parslanadi.
export const HF = () => ({ Authorization: `Bearer ${localStorage.getItem('kiu_token')}` })
