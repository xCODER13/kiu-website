// Yangi tekshiruv (enum, maxlength) qo'shilishidan OLDIN saqlangan hujjatlarda yangi qoidaga to'g'ri kelmaydigan
// qiymat bo'lishi mumkin. Admin forma tahrirlashda barcha maydonlarni qayta yuboradi, shuning uchun o'sha qiymat
// o'zgarmasdan qaytsa ham `runValidators` uni rad etardi va hujjatni umuman tahrirlab bo'lmay qolardi.
//
// Bu yordamchi shunday maydonni yangilanishdan CHIQARIB tashlaydi (bazadagi qiymat o'zgarmaydi). Qiymat O'ZGARTIRILSA —
// odatdagidek tekshiriladi, ya'ni yangi noto'g'ri qiymat baribir rad etiladi.
//
// `rules` — { maydon: qiymat => to'g'rimi }. `update` o'zgartirilmaydi, nusxa qaytariladi.
function omitUnchangedLegacy(update, stored, rules) {
  if (!stored) return update
  const result = { ...update }
  for (const [field, isValid] of Object.entries(rules)) {
    const value = result[field]
    if (value !== undefined && value === stored[field] && !isValid(value)) delete result[field]
  }
  return result
}

module.exports = { omitUnchangedLegacy }
