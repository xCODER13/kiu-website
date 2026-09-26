// ':id' parametrli route'larda ishlatiladigan middleware (router.param EMAS).
// Sabab: router.param handler'i route zanjiridan OLDIN ishlaydi, ya'ni auth'dan ham
// oldin — login qilmagan odam noto'g'ri id bilan 401 o'rniga 400 olardi. Endi u
// zanjirda auth va limiter'dan KEYIN turadi: avval kim ekanligi, keyin id formati.
// Noto'g'ri formatdagi id bazaga yetib bormaydi (aks holda Mongoose CastError → 500).
const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function validateObjectId(req, res, next) {
  if (!OBJECT_ID_RE.test(req.params.id)) return res.status(400).json({ error: "Noto'g'ri identifikator formati" })
  next()
}

module.exports = validateObjectId
