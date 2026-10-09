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

module.exports = { applyPagination }