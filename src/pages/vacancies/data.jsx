// Vacancies.jsx'dan o'zgarishsiz ko'chirilgan ma'lumot konstantalari.
// Ikonkalar inline SVG (JSX) sifatida saqlangani uchun bu fayl .jsx.
export const BENEFITS = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: "Raqobatbardosh ish haqi", desc: "Bozor narxidan yuqori maosh" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title: "Zamonaviy infratuzilma", desc: "Akademik va texnik jihozlar" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: "Xalqaro loyihalar", desc: "Konferensiyalar va xorijiy hamkorlik" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, title: "Martaba o'sishi", desc: "Malaka oshirish imkoniyatlari" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: "Samimiy jamoa", desc: "Yangi xodimlarga moslashishda yordam" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, title: "Ilmiy izlanish", desc: "Tadqiqot va nashrlar uchun imkoniyat" },
]

export const REQUIREMENTS = [
  "Oliygoh darajasidagi tegishli yo'nalishda ma'lumot (o'qituvchilar uchun kamida magistr darajasi)",
  "Zamonaviy o'qitish uslublari va axborot texnologiyalarini bilish",
  "O'z ustida ishlashga intilish va yangiliklarga ochiqlik",
  "Javobgarlik, muloqot qobiliyati va jamoada ishlash ko'nikmasi",
]

export const DOCS_NEEDED = [
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, text: "Rezyume (CV)" },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, text: "Obyektivka" },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>, text: "Diplom va sertifikatlar nusxasi" },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, text: "Portfel (agar mavjud bo'lsa)" },
]

export const POSITIONS = ["O'qituvchi", "Katta o'qituvchi", "Dotsent", "Professor", "Laborant", "Metodist", "Ma'muriy xodim", "IT mutaxassisi", "Boshqa"]
export const FACULTIES = ["Aniq fanlar kafedrasi", "Ijtimoiy-gumanitar fanlar kafedrasi", "Tillar kafedrasi", "Iqtisodiyot va muhandislik kafedrasi", "Ma'muriyat", "IT bo'limi", "Sport bo'limi", "Boshqa"]