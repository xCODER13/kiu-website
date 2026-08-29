// Barcha ariza formalari (Qabul, Bo'sh ish o'rinlari, Sorting Hat) uchun
// umumiy validatsiya qoidalari. Faqat shu faylni o'zgartirish orqali
// barcha formalardagi qoidalar bir vaqtda yangilanadi.

const NAME_RE = /^[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ'’.\- ]+$/

// Ism-familiya: faqat harflar, kamida 2 so'z (Ism + Familiya), har bir so'z >= 2 harf
export function validateFullName(value) {
  const v = (value || '').trim().replace(/\s+/g, ' ')
  if (!v) return "Bu maydon majburiy"
  if (!NAME_RE.test(v)) return "Faqat harflardan foydalaning (raqam yoki belgi bo'lmasin)"
  const words = v.split(' ')
  if (words.length < 2) return "Ism va familiyangizni to'liq kiriting"
  if (words.some(w => w.length < 2)) return "Har bir so'z kamida 2 ta harfdan iborat bo'lsin"
  return null
}

// Telefon: O'zbekiston raqami — +998 xx xxx xx xx (9 ta raqam, 998 bilan)
export function validatePhone(value) {
  const digits = (value || '').replace(/\D/g, '')
  if (!digits) return "Bu maydon majburiy"
  const normalized = digits.startsWith('998')
    ? digits
    : digits.length === 9
      ? '998' + digits
      : digits
  if (!/^998\d{9}$/.test(normalized)) {
    return "Telefon raqam noto'g'ri. Namuna: +998 90 123 45 67"
  }
  return null
}

// Email
export function validateEmail(value) {
  const v = (value || '').trim()
  if (!v) return "Bu maydon majburiy"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Email manzil noto'g'ri formatda"
  return null
}

// Select/tanlov maydonlari uchun oddiy "bo'sh emasligi" tekshiruvi
export function validateRequired(value, label = "Bu maydon") {
  if (!value || !String(value).trim()) return `${label} majburiy`
  return null
}

// style yordamchisi — xato bo'lsa inputga qizil ramka qo'shadi
export function errorBorder(hasError, baseStyle) {
  return hasError ? { ...baseStyle, borderColor: '#dc2626' } : baseStyle
}