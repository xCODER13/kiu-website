// Barcha ariza formalari (Qabul, Bo'sh ish o'rinlari, Sorting Hat) uchun
// umumiy validatsiya qoidalari. Faqat shu faylni o'zgartirish orqali
// barcha formalardagi qoidalar bir vaqtda yangilanadi.

// Xabarlar: `t` (i18next) berilsa — joriy tilda (validation.<kalit>), berilmasa o'zbekcha
// (eski chaqiruvlar va testlar o'zgarishsiz ishlaydi). Backend'ga faqat qiymat ketadi,
// xabar matni hech qachon yuborilmaydi.
const msg = (t, key, uz, opts) => (t ? t(`validation.${key}`, opts) : uz)

const NAME_RE = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ'’ʻʼʹ‘`.\- ]+$/

// Ism-familiya: faqat harflar, kamida 2 so'z (Ism + Familiya), har bir so'z >= 2 harf
export function validateFullName(value, t) {
  const v = (value || '').trim().replace(/\s+/g, ' ')
  if (!v) return msg(t, 'required', "Bu maydon majburiy")
  if (!NAME_RE.test(v)) return msg(t, 'lettersOnly', "Faqat harflardan foydalaning (raqam yoki belgi bo'lmasin)")
  const words = v.split(' ')
  if (words.length < 2) return msg(t, 'fullNameIncomplete', "Ism va familiyangizni to'liq kiriting")
  if (words.some(w => w.length < 2)) return msg(t, 'nameWordLength', "Har bir so'z kamida 2 ta harfdan iborat bo'lsin")
  return null
}

// Telefon: O'zbekiston raqami — +998 xx xxx xx xx (9 ta raqam, 998 bilan)
export function validatePhone(value, t) {
  const digits = (value || '').replace(/\D/g, '')
  if (!digits) return msg(t, 'required', "Bu maydon majburiy")
  const normalized = digits.startsWith('998')
    ? digits
    : digits.length === 9
      ? '998' + digits
      : digits
  if (!/^998\d{9}$/.test(normalized)) {
    return msg(t, 'phoneInvalid', "Telefon raqam noto'g'ri. Namuna: +998 90 123 45 67")
  }
  return null
}

// Email — ba'zi formalarda (mas. Bo'sh ish o'rinlari) ixtiyoriy, shuning uchun
// `required` parametri bilan boshqariladi (standart holatda majburiy).
export function validateEmail(value, required = true, t) {
  const v = (value || '').trim()
  if (!v) return required ? msg(t, 'required', "Bu maydon majburiy") : null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return msg(t, 'emailInvalid', "Email manzil noto'g'ri formatda")
  return null
}

// Select/tanlov maydonlari uchun oddiy "bo'sh emasligi" tekshiruvi
export function validateRequired(value, label = "Bu maydon", t) {
  if (value == null || !String(value).trim()) return t ? t('validation.fieldRequired', { field: label }) : `${label} majburiy`
  return null
}
