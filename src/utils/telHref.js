// `tel:` havolasi uchun raqamni bo'shliq/tire/qavslarsiz formatlaydi: "+998 55 500 99 44" → "tel:+998555009944".
// Brauzerlar bo'shliqli raqamni ham ochadi, lekin ba'zi telefon ilovalari (va ekran o'quvchilar) tozasini yaxshi qayta ishlaydi.
export default function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`
}
