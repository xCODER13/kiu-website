// ── IXTIYORIY PAGINATION ──
// Faqat so'rovda ?limit= kelsa ishga tushadi. Hozircha frontend limit/page yubormaydi,
// shuning uchun javob formati (oddiy massiv) o'zgarmaydi — to'liq backward-compatible.
// Kelajakda frontend ?page=&limit= yuborishni boshlasa, katta ma'lumotlar to'plamida
// server yukini kamaytiradi.
// DIQQAT: skip/limit barqaror bo'lishi uchun chaqiruvchi sort'ga yagona kalit (`_id`) ni oxirgi tiebreaker
// sifatida qo'shishi shart — aks holda createdAt/eventDate bir xil yozuvlar sahifalar orasida takrorlanishi
// yoki tushib qolishi mumkin (news/events/gallery/teachers controllerlarida shunday).
function applyPagination(query, { page, limit } = {}) {
  if (!limit) return query
  const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 100)
  const pg = Math.max(parseInt(page) || 1, 1)
  return query.skip((pg - 1) * lim).limit(lim)
}

// Sahifa raqami va hajmini xavfsiz sonlarga aylantiradi (konvert/`skip` uchun). `limit` — [1, max], standart defaultLimit;
// yaroqsiz (NaN, 0, manfiy) qiymat standartga/chegaraga tushadi.
function parsePage({ page, limit } = {}, { defaultLimit = 20, max = 100 } = {}) {
  const lim = Math.min(Math.max(parseInt(limit) || defaultLimit, 1), max)
  const pg = Math.max(parseInt(page) || 1, 1)
  return { page: pg, limit: lim, skip: (pg - 1) * lim }
}

module.exports = { applyPagination, parsePage }