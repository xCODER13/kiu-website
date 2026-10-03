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
  { to: '/admin/gallery',      label: 'Galereya',         icon: Ic.gallery },
  { to: '/admin/applications', label: 'Qabul arizalari',  icon: Ic.clipboard },
  { to: '/admin/vacancies',    label: 'Vakansiyalar',     icon: Ic.vacancy },
  { to: '/admin/profile',      label: 'Profil',           icon: Ic.profile },
]
