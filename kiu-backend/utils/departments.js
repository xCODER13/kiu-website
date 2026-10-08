// Kafedralar — YAGONA ruxsat etilgan ro'yxat (1.5). Yozuv xatosi saytda alohida kafedra guruhini yaratardi
// (ommaviy sahifa kafedralarni `dept` qiymatlaridan yig'adi). Frontend nusxasi: `src/pages/admin/shared/constants.js`
// (KAFEDRALAR) — `tests/teachers-validation.test.js` ikkalasini solishtiradi. Ro'yxat `GET /api/teachers/departments`
// orqali ham beriladi (frontend keyinchalik shundan oladi).
// Yangi kafedra qo'shish uchun shu ro'yxat o'zgaradi (kod o'zgarishi kerak, bu ataylab).
const DEPARTMENTS = [
  'Iqtisodiyot va muhandislik kafedrasi',
  'Aniq fanlar kafedrasi',
  "Filologiya va tillarni o'qitish kafedrasi",
  'Ijtimoiy-gumanitar fanlar kafedrasi',
  'Ijtimoiy fanlar kafedrasi',
]

module.exports = { DEPARTMENTS }
