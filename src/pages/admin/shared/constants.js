import { Ic } from './Icons.jsx'

// Holat → status badge klassi (4.4): `new` brend (binafsha) rangi emas, `info`; qolganlari warning/success/danger.
// Rang tokenlar orqali (tema bilan almashadi), badge har doim matn bilan ko'rsatiladi.
export const STATUS_BADGE = { new: 'badge-info', reviewed: 'badge-warning', accepted: 'badge-success', rejected: 'badge-danger' }
export const STATUS_LABELS = { new: 'Yangi', reviewed: "Ko'rildi", accepted: 'Qabul qilindi', rejected: 'Rad etildi' }

export const NAV = [
  { to: '/admin',              label: 'Statistika',       icon: Ic.stats   },
  { to: '/admin/news',         label: 'Yangiliklar',      icon: Ic.news    },
  { to: '/admin/events',       label: 'Tadbirlar',        icon: Ic.events  },
  { to: '/admin/teachers',     label: "O'qituvchilar",    icon: Ic.teach   },
  { to: '/admin/gallery',      label: 'Talabalar hayoti', icon: Ic.gallery },
  { to: '/admin/applications', label: 'Qabul arizalari',  icon: Ic.clipboard },
  { to: '/admin/vacancies',    label: 'Vakansiyalar',     icon: Ic.vacancy },
  { to: '/admin/profile',      label: 'Profil',           icon: Ic.profile },
]

// Yangiliklar formasi (6.24): chegaralar serverdagi bilan bir xil bo'lishi shart
export const NEWS_CATEGORIES = ["Umumiy", "Ta'lim", 'Sport', 'Madaniyat', 'Xalqaro', 'Fan']
// Server kategoriyani kichik harfda saqlaydi ("sport"), forma esa ko'rinadigan nom ("Sport") bilan ishlaydi.
// Ro'yxatda yo'q (eski, erkin matnli) qiymat o'zgarishsiz qaytadi — forma uni alohida variant sifatida ko'rsatadi.
export const toAdminCategory = c => {
  const key = String(c ?? '').trim().toLowerCase()
  return NEWS_CATEGORIES.find(x => x.toLowerCase() === key) ?? (c || 'Umumiy')
}
export const TITLE_MAX = 300      // models/News.js `maxlength`
export const CONTENT_MAX = 50000  // models/News.js `maxlength`
export const MAX_IMAGES = 10      // routes/news.routes.js multer `files: 10`

// Tadbirlar formasi (6.25): chegaralar models/Event.js bilan bir xil. Tur → chip rangi (`--chart-N`, 11.1-qaror 30):
// Umumiy 1, Bitiruvchilar 2, Sport 3, Madaniy 4, Ochiq kun va Qabul 5, Ilmiy 6.
export const EVENT_DESC_MAX = 3000  // models/Event.js `desc` maxlength
export const EVENT_TYPES = [
  { value: 'general', label: 'Umumiy', tone: 1 },
  { value: 'open', label: 'Ochiq kun', tone: 5 },
  { value: 'culture', label: 'Madaniy', tone: 4 },
  { value: 'science', label: 'Ilmiy', tone: 6 },
  { value: 'sport', label: 'Sport', tone: 3 },
  { value: 'graduation', label: 'Bitiruvchilar', tone: 2 },
  { value: 'admission', label: 'Qabul', tone: 5 },
]

// Galereya (6.26): models/Gallery.js `maxlength`; mozaika — albomdagi birinchi 3 rasm
export const GALLERY_TITLE_MAX = 200
export const GALLERY_DESC_MAX = 500
export const ALBUM_MOSAIC = 3

// Talabalar hayoti «Bo'limlar» (models/StudentLife.js): bo'lim kalitlari backend `utils/studentLifeSections.js` bilan bir xil
export const STUDENT_LIFE_SECTIONS = [
  { value: 'club', label: "Klublar va to'garaklar" },
  { value: 'sport', label: 'Sport va yutuqlar' },
  { value: 'campus', label: 'Kampus va yotoqxona hayoti' },
]
export const SL_TITLE_MAX = 200
export const SL_DESC_MAX = 2000
export const SL_LINK_MAX = 300
export const SL_ORDER_MAX = 9999

// O'qituvchilar (6.27): chegaralar models/Teacher.js bilan bir xil (ism, lavozim — 200). `avatar` modelda 20, formada 2 (10.4).
// Kafedralar ro'yxati — ZAXIRA nusxa: asosiy manba `GET /api/teachers/departments` (TeachersAdmin); server javob bermaguncha yoki xato bo'lsa
// shu ishlatiladi. Backend `utils/departments.js` bilan bir xil bo'lishi `teachers-validation.test.js` da tekshiriladi.
// «Ro'yxatda yo'q» eski qiymatlar uchun alohida holat bor (TeachersForm).
export const TEACHER_NAME_MAX = 200
export const TEACHER_ROLE_MAX = 200
export const TEACHER_AVATAR_MAX = 2
export const KAFEDRALAR = [
  'Iqtisodiyot va muhandislik kafedrasi',
  'Aniq fanlar kafedrasi',
  "Filologiya va tillarni o'qitish kafedrasi",
  'Ijtimoiy-gumanitar fanlar kafedrasi',
  'Ijtimoiy fanlar kafedrasi',
]
