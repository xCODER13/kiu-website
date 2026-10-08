import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API, H, errorMessage, skipUnauthorizedRedirect } from './shared/api'
import ConfirmDialog from './shared/ConfirmDialog.jsx'
import { Ic } from './shared/Icons.jsx'
import PasswordField from './shared/PasswordField.jsx'
import { ErrorBanner } from './shared/StateViews.jsx'
import {
  decodeJwtPayload, formatDateTimeShort, formatTimeLeft, byteLength, passwordStrength, STRENGTH_LABELS,
} from './shared/helpers'

const EMPTY = { current: '', next: '', confirm: '' }
const MAX_BYTES = 72
const REDIRECT_MS = 4000
const KEPT = "maydonlar saqlanib turibdi, qayta urinib ko'ring."

// Yangi parol uchun uchta talab: 'idle' (hali kutilmoqda), 'ok', 'fail'
function requirements({ current, next }) {
  const len = [...next].length
  return [
    { key: 'len', text: 'Kamida 8 ta belgi', state: !next ? 'idle' : len >= 8 ? 'ok' : 'fail' },
    { key: 'diff', text: 'Joriy paroldan farq qiladi', state: !next || !current ? 'idle' : next !== current ? 'ok' : 'fail' },
    { key: 'bytes', text: 'Parol 72 baytdan oshmaydi (taxminan 72 ta lotin belgisi)', state: !next ? 'idle' : byteLength(next) <= MAX_BYTES ? 'ok' : 'fail' },
  ]
}

function validate({ current, next, confirm }) {
  const errors = {}
  if (!current) errors.current = 'Joriy parolni kiriting.'
  if ([...next].length < 8) errors.next = "Parol kamida 8 ta belgidan iborat bo'lishi kerak."
  else if (byteLength(next) > MAX_BYTES) errors.next = 'Parol 72 baytdan oshmasligi kerak.'
  else if (current && next === current) errors.next = 'Yangi parol joriy paroldan farq qilishi kerak.'
  if (!confirm) errors.confirm = 'Yangi parolni takrorlang.'
  else if (confirm !== next) errors.confirm = 'Parollar mos kelmadi.'
  return errors
}

const REQ_STATE_LABEL = { ok: 'bajarilgan', fail: 'bajarilmagan', idle: 'kutilmoqda' }

function Strength({ value }) {
  const level = passwordStrength(value)
  return (
    <div className="adm-strength" data-level={level}>
      <div className="adm-strength-bars" aria-hidden="true">
        {[0, 1, 2, 3].map(i => <span key={i} className="adm-strength-bar" />)}
      </div>
      <p className="adm-strength-text" role="status" aria-live="polite">
        Parol kuchi{level > 0 && <>: <strong className="adm-strength-label">{STRENGTH_LABELS[level]}</strong></>}
      </p>
    </div>
  )
}

function Requirements({ items }) {
  return (
    <ul className="adm-reqs">
      {items.map(r => (
        <li key={r.key} className="adm-req" data-state={r.state}>
          <span className="adm-req-icon" aria-hidden="true">
            {r.state === 'ok' ? Ic.check : r.state === 'fail' ? Ic.close : <span className="adm-req-dot" />}
          </span>
          <span>{r.text}</span>
          <span className="adm-sr-only"> — {REQ_STATE_LABEL[r.state]}</span>
        </li>
      ))}
    </ul>
  )
}

// «Hisob» kartasi: login va sessiya muddati — JWT ichidan (backend'ga so'rov yo'q). «Parol oxirgi o'zgargan»
// `GET /admin/me` tayyor bo'lgach qo'shiladi (DESIGN.md 10.4).
function AccountCard({ session, now }) {
  const left = session.exp ? session.exp * 1000 - now : null
  return (
    <section className="adm-card adm-account" aria-labelledby="account-title">
      <h3 id="account-title" className="adm-account-title">{Ic.profile}Hisob</h3>
      <div className="adm-account-row">
        <span className="adm-account-icon" aria-hidden="true">{Ic.profile}</span>
        <div>
          <p className="adm-account-key">Login</p>
          <p className="adm-account-val">{session.username || '—'}</p>
        </div>
      </div>
      {left !== null && (
        <div className="adm-account-row">
          <span className="adm-account-icon" aria-hidden="true">{Ic.shield}</span>
          <div>
            <p className="adm-account-key">Sessiya tugaydi</p>
            <p className="adm-account-val">{formatDateTimeShort(session.exp * 1000)}</p>
            <p className="adm-account-sub">{formatTimeLeft(left)}</p>
          </div>
        </div>
      )}
    </section>
  )
}

// «Sessiya xavfsizligi»: parolni almashtirmasdan barcha qurilmalardagi sessiyalarni tugatadi (`POST /admin/logout-all`).
// Backend shu so'rovni yuborgan tokenni ham bekor qiladi, shuning uchun muvaffaqiyatda token o'chirilib, kirish sahifasiga o'tiladi.
function SessionCard() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function logoutAll() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${API}/admin/logout-all`, { method: 'POST', headers: H() })
      if (res.ok || res.status === 401) {
        // 401 — token allaqachon yaroqsiz (sessiya baribir tugagan): natija bir xil
        localStorage.removeItem('kiu_token')
        navigate('/admin/login')
        return
      }
      const msg = await errorMessage(res, '')
      setError(res.status === 429
        ? (msg || "Juda ko'p so'rov yuborildi. Birozdan so'ng qayta urinib ko'ring.")
        : `${(msg || 'Sessiyalar tugatilmadi.').replace(/[.!\s]+$/, '')} — qayta urinib ko'ring.`)
    } catch {
      setError("Sessiyalar tugatilmadi. Server bilan bog'lanib bo'lmadi — qayta urinib ko'ring.")
    }
    setBusy(false)
    setOpen(false)
  }

  return (
    <section className="adm-card adm-session" aria-labelledby="session-title">
      <h3 id="session-title" className="adm-account-title">{Ic.shield}Sessiya xavfsizligi</h3>
      <p className="adm-session-text">
        Parolni o'zgartirmasdan barcha qurilmalardagi sessiyalarni tugatadi. Qurilmangiz yo'qolgan yoki kimdir kirgan deb shubhalansangiz, shuni bosing.
      </p>
      {error && <div className="adm-form-banner"><ErrorBanner>{error}</ErrorBanner></div>}
      <button type="button" className="btn btn-danger adm-session-btn" onClick={() => setOpen(true)}>
        {Ic.logout}Barcha qurilmalardan chiqish
      </button>
      {open && (
        <ConfirmDialog
          title="Barcha qurilmalardan chiqasizmi?"
          iconTone="warning"
          confirmIcon={Ic.logout}
          confirmLabel="Barchasidan chiqish"
          busy={busy}
          onConfirm={logoutAll}
          onCancel={() => setOpen(false)}
        >
          Shu qurilmadagi sessiya ham tugaydi — qaytadan kirishingiz kerak. Parol o'zgarmaydi.
        </ConfirmDialog>
      )}
    </section>
  )
}

export default function ProfileAdmin() {
  const navigate = useNavigate()
  // Sahifa ochilgandagi holat (bir marta): token ichidan login va muddat, `now` — «N kundan so'ng» hisobi uchun
  const [{ session, now }] = useState(() => {
    const p = decodeJwtPayload(localStorage.getItem('kiu_token'))
    return {
      session: { username: typeof p?.username === 'string' ? p.username : '', exp: Number.isFinite(p?.exp) ? p.exp : null },
      now: Date.now(),
    }
  })

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [banner, setBanner] = useState(null)      // { tone: 'error' | 'warning', text }
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const focusCurrent = useRef(false)
  const currentRef = useRef(null)
  const nextRef = useRef(null)
  const confirmRef = useRef(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  // `fieldset disabled` saqlash vaqtida maydonlarni bloklaydi — fokus faqat ular yana faol bo'lgach (saving=false) beriladi
  useEffect(() => {
    if (!saving && focusCurrent.current) {
      focusCurrent.current = false
      currentRef.current?.focus()
    }
  }, [saving])

  function change(field, value) {
    setValues(v => ({ ...v, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
    setBanner(null)
  }

  // Takrorlash maydonidan chiqilganda mos kelmasa — darrov xabar (avval faqat yuborishda)
  function checkConfirm() {
    if (values.confirm && values.confirm !== values.next) setErrors(e => ({ ...e, confirm: 'Parollar mos kelmadi.' }))
  }

  function goLogin() {
    clearTimeout(timer.current)
    navigate('/admin/login')
  }

  async function save(e) {
    e.preventDefault()
    if (saving || done) return
    const errs = validate(values)
    setErrors(errs)
    setBanner(null)
    if (errs.current) return currentRef.current?.focus()
    if (errs.next) return nextRef.current?.focus()
    if (errs.confirm) return confirmRef.current?.focus()

    setSaving(true)
    try {
      const init = skipUnauthorizedRedirect({
        method: 'POST',
        headers: H(),
        body: JSON.stringify({ currentPassword: values.current, newPassword: values.next }),
      })
      const res = await fetch(`${API}/admin/change-password`, init)
      if (res.ok) {
        // Backend parol o'zgargach eski tokenlarni bekor qiladi (iat < passwordChangedAt) — token tozalanadi, qayta kirish so'raladi.
        localStorage.removeItem('kiu_token')
        setValues(EMPTY)
        setDone(true)
        timer.current = setTimeout(goLogin, REDIRECT_MS)
        return
      }
      const msg = await errorMessage(res, '')
      if (res.status === 403 || (res.status === 401 && msg === "Joriy parol noto'g'ri")) {
        // 401 shu yerda ham keladi (backend) — `skipUnauthorizedRedirect` tufayli admin tizimdan chiqmaydi; maydon xatosi
        setErrors({ current: "Joriy parol noto'g'ri." })
        focusCurrent.current = true
      } else if (res.status === 401) {
        // Haqiqiy «token eskirdi» — avvalgi umumiy qoida bilan bir xil
        localStorage.removeItem('kiu_token')
        navigate('/admin/login')
      } else if (res.status === 429) {
        setBanner({ tone: 'warning', text: msg || "Juda ko'p muvaffaqiyatsiz urinish. 15 daqiqadan so'ng qayta urinib ko'ring." })
      } else {
        setBanner({ tone: 'error', text: `${(msg || "Parol o'zgartirilmadi.").replace(/[.!\s]+$/, '')} — ${KEPT}` })
      }
    } catch {
      setBanner({ tone: 'error', text: `Parol o'zgartirilmadi. Server bilan bog'lanib bo'lmadi — ${KEPT}` })
    } finally {
      setSaving(false)
    }
  }

  const reqs = requirements(values)
  const confirmOk = values.confirm && values.next && values.confirm === values.next ? 'Parollar mos.' : ''
  const locked = saving || done

  return (
    <div>
      <div className="adm-page-head">
        <h2 className="adm-page-title">Profil sozlamalari</h2>
      </div>

      <div className="adm-profile-grid">
        <div className="adm-profile-side">
          <AccountCard session={session} now={now} />
          <SessionCard />
        </div>

        <form className="adm-card adm-formcard adm-pwform" noValidate onSubmit={save} aria-labelledby="pw-form-title">
          <div className="adm-pwform-head">
            <span className="adm-pwform-icon" aria-hidden="true">{Ic.key}</span>
            <div>
              <h3 id="pw-form-title" className="adm-formcard-title">Parolni o'zgartirish</h3>
              <p className="adm-pwform-sub">Kuchli parol tanlang. Almashtirilgach, barcha qurilmalardagi sessiyalar tugatiladi.</p>
            </div>
          </div>

          {done && (
            <div className="adm-pbanner" data-tone="success" role="status">
              {Ic.check}
              <span className="adm-pbanner-text">
                Parol o'zgartirildi. Xavfsizlik uchun barcha qurilmalardan chiqarildingiz — {REDIRECT_MS / 1000} soniyadan so'ng kirish sahifasiga o'tasiz.
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={goLogin}>Hozir kirish</button>
            </div>
          )}
          {banner?.tone === 'error' && <div className="adm-form-banner"><ErrorBanner>{banner.text}</ErrorBanner></div>}
          {banner?.tone === 'warning' && (
            <div className="adm-pbanner" data-tone="warning" role="alert">{Ic.warn}<span className="adm-pbanner-text">{banner.text}</span></div>
          )}

          {/* Parol menejeri qaysi hisobga saqlashni bilishi uchun (ko'rinmas, fokuslanmaydi) */}
          <input className="adm-sr-only" type="text" name="username" autoComplete="username" value={session.username} readOnly tabIndex={-1} aria-hidden="true" />

          <fieldset className="adm-fieldset" disabled={locked}>
            <PasswordField
              id="pw-current"
              label="Joriy parol"
              value={values.current}
              onChange={v => change('current', v)}
              autoComplete="current-password"
              placeholder="Joriy parolingiz"
              error={errors.current}
              inputRef={currentRef}
            />
            <PasswordField
              id="pw-new"
              label="Yangi parol"
              value={values.next}
              onChange={v => change('next', v)}
              autoComplete="new-password"
              placeholder="Kamida 8 ta belgi"
              error={errors.next}
              inputRef={nextRef}
            >
              <Strength value={values.next} />
              <Requirements items={reqs} />
            </PasswordField>
            <PasswordField
              id="pw-confirm"
              label="Yangi parolni takrorlang"
              value={values.confirm}
              onChange={v => change('confirm', v)}
              onBlur={checkConfirm}
              autoComplete="new-password"
              placeholder="Parolni qaytadan kiriting"
              error={errors.confirm}
              ok={confirmOk}
              inputRef={confirmRef}
            />
          </fieldset>

          <div className="adm-form-foot">
            <button type="submit" className="btn btn-primary adm-save" disabled={locked} aria-busy={saving || undefined}>
              {!saving && Ic.save}
              {saving ? 'Saqlanmoqda...' : 'Parolni saqlash'}
            </button>
            <span className="adm-form-note">Saqlangach barcha qurilmalardan chiqarilasiz va qayta kirasiz.</span>
          </div>
        </form>
      </div>
    </div>
  )
}
