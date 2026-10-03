/* ── Yo'nalishlar (faqat tuzilma) ──────────────────────────────
   Barcha matnlar (nom, tavsif, fanlar, karyera, izoh) i18n'da:
   src/i18n/locales/<til>.json → faculty.programs.<id>.
   Bu yerda faqat til bog'liq bo'lmagan maydonlar turadi:
     id       — tarjima kaliti (faculty.programs.<id>)
     price    — yillik kontrakt narxi (so'm)
     years    — davomiyligi (yil)
     langs    — o'qitish tillari kodlari (faculty.langs.<kod>)
     studyForm— faculty.studyForms.<kalit>
     hasNote  — faculty.programs.<id>.note mavjudmi
   Rang maydoni yo'q: yo'nalish kartalari bitta brend rangida (6.11, 10.4 — CSS injection
   qoidasi); ma'lumotdagi `color` hech qachon stilga qo'yilmasdi va 6.19 da olib tashlandi. */

/* ── BAKALAVR ──────────────────────────────────────────────── */
export const BAKALAVR = [
  { id: 'preschool',    price: 12850000, years: 4, langs: ['uz', 'ru'],       studyForm: 'fullTime', icon: 'users' },
  { id: 'primary',      price: 12850000, years: 4, langs: ['uz'],             studyForm: 'fullTime', icon: 'book' },
  { id: 'nationalIdea', price: 12850000, years: 4, langs: ['uz'],             studyForm: 'fullTime', icon: 'home' },
  { id: 'oilGas',       price: 12850000, years: 4, langs: ['uz', 'en'],       studyForm: 'fullTime', icon: 'map', hasNote: true },
  { id: 'economics',    price: 14900000, years: 4, langs: ['uz', 'en'],       studyForm: 'fullTime', icon: 'dollar', hasNote: true },
  { id: 'softwareEng',  price: 12850000, years: 4, langs: ['uz', 'en'],       studyForm: 'fullTime', icon: 'code' },
  { id: 'finance',      price: 14900000, years: 4, langs: ['uz', 'en'],       studyForm: 'fullTime', icon: 'briefcase' },
  { id: 'accounting',   price: 14900000, years: 4, langs: ['uz'],             studyForm: 'fullTime', icon: 'file' },
  { id: 'psychology',   price: 12850000, years: 4, langs: ['uz'],             studyForm: 'fullTime', icon: 'hex', hasNote: true },
  { id: 'philology',    price: 12850000, years: 4, langs: ['uz', 'en', 'ru'], studyForm: 'fullTime', icon: 'globe', hasNote: true },
]

/* ── MAGISTRATURA ──────────────────────────────────────────── */
export const MAGISTRATURA = [
  { id: 'linguisticsEn',   price: 18000000, years: 2, langs: ['uz', 'en'], studyForm: 'fullTime', icon: 'globe' },
  { id: 'linguisticsRu',   price: 18000000, years: 2, langs: ['uz', 'ru'], studyForm: 'fullTime', icon: 'book' },
  { id: 'economicsMaster', price: 18000000, years: 2, langs: ['uz', 'en'], studyForm: 'fullTime', icon: 'dollar' },
]
