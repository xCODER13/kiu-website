const mongoose = require('mongoose')

// Admin xavfsizlik jurnali (3.7): FAQAT voqea turi, IP va vaqt (+ kim, + o'chirishda nima).
// HECH QACHON: parol, hash, token, kiritilgan login/parol matni, so'rov tanasi, User-Agent.
// Tarkibida shaxsiy ma'lumot (IP) bor, shuning uchun saqlash muddati cheklangan — TTL indeks eski yozuvlarni o'zi o'chiradi.
const AUDIT_EVENTS = ['login_success', 'login_failed', 'password_changed', 'password_change_failed', 'logout_all', 'delete']
const AUDIT_RETENTION_DAYS = 180

const AuditLogSchema = new mongoose.Schema({
  event: { type: String, required: true, enum: AUDIT_EVENTS },
  ip: { type: String, default: '', maxlength: 64 },
  // Token egasi (JWT `username`). login_failed da bo'sh: kiritilgan login saqlanmaydi (parol o'rniga yozib yuborilgan bo'lishi mumkin).
  actor: { type: String, default: '', maxlength: 100 },
  // Faqat `delete` uchun: qaysi resurs va qaysi hujjat (matn/sarlavha EMAS — faqat ID).
  resource: { type: String, default: '', maxlength: 32 },
  targetId: { type: String, default: '', maxlength: 64 },
}, { timestamps: { createdAt: true, updatedAt: false } })

AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: AUDIT_RETENTION_DAYS * 24 * 60 * 60 })

module.exports = mongoose.model('AuditLog', AuditLogSchema)
module.exports.AUDIT_EVENTS = AUDIT_EVENTS
module.exports.AUDIT_RETENTION_DAYS = AUDIT_RETENTION_DAYS
