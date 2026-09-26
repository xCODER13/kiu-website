import { Ic } from './Icons.jsx'

export const STATUS_COLORS = { new: '#7c3aed', reviewed: '#d97706', accepted: '#059669', rejected: '#dc2626' }
export const STATUS_LABELS = { new: 'Yangi', reviewed: "Ko'rildi", accepted: 'Qabul qilindi', rejected: 'Rad etildi' }

export const NAV = [
  { to: '/admin',              label: 'Statistika',       icon: Ic.stats   },
  { to: '/admin/news',         label: 'Yangiliklar',      icon: Ic.news    },
  { to: '/admin/events',       label: 'Tadbirlar',        icon: Ic.events  },
  { to: '/admin/teachers',     label: "O'qituvchilar",    icon: Ic.teach   },
  { to: '/admin/gallery',      label: 'Galereya',         icon: Ic.gallery },
  { to: '/admin/applications', label: 'Qabul arizalari',  icon: Ic.apps    },
  { to: '/admin/vacancies',    label: 'Vakansiyalar',     icon: Ic.vacancy },
  { to: '/admin/profile',      label: 'Profil',           icon: Ic.profile },
]
