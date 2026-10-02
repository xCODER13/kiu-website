// Vacancies.jsx'dan o'zgarishsiz ko'chirilgan ma'lumot konstantalari.
// Ikonkalar inline SVG (JSX) sifatida saqlangani uchun bu fayl .jsx.
export const BENEFITS = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, id: 'salary' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, id: 'infra' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, id: 'international' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, id: 'career' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, id: 'team' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, id: 'research' },
]

export const REQUIREMENTS = ['education', 'skills', 'growth', 'teamwork'] // matn: vacancies.info.requirements.<kalit>

export const DOCS_NEEDED = [
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, id: 'cv' },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, id: 'resume' },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>, id: 'diplomas' },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, id: 'portfolio' },
]

// value — backend'ga yuboriladigan (va admin panelda ko'rinadigan) o'zbekcha qiymat;
// key — ko'rsatiladigan nom uchun tarjima kaliti (vacancies.form.options.<guruh>.<key>).
export const POSITIONS = [
  { value: "O'qituvchi", key: 'teacher' }, { value: "Katta o'qituvchi", key: 'seniorTeacher' }, { value: 'Dotsent', key: 'docent' },
  { value: 'Professor', key: 'professor' }, { value: 'Laborant', key: 'lab' }, { value: 'Metodist', key: 'methodist' },
  { value: "Ma'muriy xodim", key: 'adminStaff' }, { value: 'IT mutaxassisi', key: 'itSpecialist' }, { value: 'Boshqa', key: 'other' },
]
export const FACULTIES = [
  { value: 'Aniq fanlar kafedrasi', key: 'exact' }, { value: 'Ijtimoiy-gumanitar fanlar kafedrasi', key: 'humanities' },
  { value: 'Tillar kafedrasi', key: 'languages' }, { value: 'Iqtisodiyot va muhandislik kafedrasi', key: 'econEng' },
  { value: "Ma'muriyat", key: 'administration' }, { value: "IT bo'limi", key: 'itDept' }, { value: "Sport bo'limi", key: 'sportDept' },
  { value: 'Boshqa', key: 'other' },
]
export const EDUCATION = [
  { value: 'Bakalavr', key: 'bachelor' }, { value: 'Magistr', key: 'master' }, { value: 'PhD', key: 'phd' }, { value: 'Fan doktori', key: 'doctor' },
]
export const EXPERIENCE = [
  { value: "Tajribam yo'q", key: 'none' }, { value: '1 yilgacha', key: 'lt1' }, { value: '1–3 yil', key: 'y1_3' },
  { value: '3–5 yil', key: 'y3_5' }, { value: '5–10 yil', key: 'y5_10' }, { value: '10 yildan ortiq', key: 'gt10' },
]

// Ariza topshirish bo'yicha aloqa: raqamlar HR bo'limiga tegishli (config.contact.phone — umumiy qabul raqami, boshqa).
export const HR_PHONES = [
  { id: 'phone1', value: '+998 91 961 11 00' },
  { id: 'phone2', value: '+998 91 211 54 52' },
]
