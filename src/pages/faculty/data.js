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
   Rang: 6-belgili hex bo'lishi shart — `${f.color}25` kabi alpha qo'shimchasi
   ishlatiladi (8-belgili #RRGGBBAA noto'g'ri CSS beradi). */

/* ── BAKALAVR ──────────────────────────────────────────────── */
export const BAKALAVR = [
  { id: 'preschool',    price: 12850000, years: 4, langs: ['uz', 'ru'],       studyForm: 'fullTime', icon: 'users',     color: '#1c2cb9' },
  { id: 'primary',      price: 12850000, years: 4, langs: ['uz'],             studyForm: 'fullTime', icon: 'book',      color: '#3abd31' },
  { id: 'nationalIdea', price: 12850000, years: 4, langs: ['uz'],             studyForm: 'fullTime', icon: 'home',      color: '#d7690f' },
  { id: 'oilGas',       price: 12850000, years: 4, langs: ['uz', 'en'],       studyForm: 'fullTime', icon: 'map',       color: '#e3dd2c', hasNote: true },
  { id: 'economics',    price: 14900000, years: 4, langs: ['uz', 'en'],       studyForm: 'fullTime', icon: 'dollar',    color: '#059669', hasNote: true },
  { id: 'softwareEng',  price: 12850000, years: 4, langs: ['uz', 'en'],       studyForm: 'fullTime', icon: 'code',      color: '#06bdc7' },
  { id: 'finance',      price: 14900000, years: 4, langs: ['uz', 'en'],       studyForm: 'fullTime', icon: 'briefcase', color: '#793bac' },
  { id: 'accounting',   price: 14900000, years: 4, langs: ['uz'],             studyForm: 'fullTime', icon: 'file',      color: '#f33218' },
  { id: 'psychology',   price: 12850000, years: 4, langs: ['uz'],             studyForm: 'fullTime', icon: 'hex',       color: '#db2777', hasNote: true },
  { id: 'philology',    price: 12850000, years: 4, langs: ['uz', 'en', 'ru'], studyForm: 'fullTime', icon: 'globe',     color: '#29a6f8', hasNote: true },
]

/* ── MAGISTRATURA ──────────────────────────────────────────── */
export const MAGISTRATURA = [
  { id: 'linguisticsEn',   price: 18000000, years: 2, langs: ['uz', 'en'], studyForm: 'fullTime', icon: 'globe',  color: '#2563eb' },
  { id: 'linguisticsRu',   price: 18000000, years: 2, langs: ['uz', 'ru'], studyForm: 'fullTime', icon: 'book',   color: '#ae0895' },
  { id: 'economicsMaster', price: 18000000, years: 2, langs: ['uz', 'en'], studyForm: 'fullTime', icon: 'dollar', color: '#416c2a' },
]
