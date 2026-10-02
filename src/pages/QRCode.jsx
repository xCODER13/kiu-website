import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import config from '../config'

// Uchinchi tomon brend ranglari faqat ikonka doirasida (`.qr-card__icon--*`, tokenlar tokens.css da).
// Havolalar — `config.social` dan (bitta manba); foydalanuvchi nomlari — ko'rsatiladigan matn.
const SOCIALS = [
  {
    name: 'Telegram',
    username: '@kiu_uz',
    url: config.social.telegram,
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>,
  },
  {
    name: 'Instagram',
    username: '@kiu_university_uz',
    url: config.social.instagram,
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  },
  {
    name: 'YouTube',
    username: '@kiu_university_uz',
    url: config.social.youtube,
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
  {
    name: 'Facebook',
    username: 'KIU Uzbekistan',
    url: config.social.facebook,
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
]

// QR moduli rangi: loyiha wine (7f2063, `--color-brand` bilan bir xil) oq fonda ~11:1 — skaner uchun yetarli kontrast.
// Tashqi servis (api.qrserver.com) faqat ommaviy havolani oladi; `referrerPolicy="no-referrer"` — sahifa manzili yuborilmaydi.
const qrSrc = url =>
  `https://api.qrserver.com/v1/create-qr-code/?size=312x312&data=${encodeURIComponent(url)}&color=7f2063&bgcolor=ffffff&qzone=1`

export default function QRCode() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <PageHero title={t('qrcode.title')} sub={t('qrcode.subtitle')} />

      <section className="section">
        <div className="container">
          <div className="cards-4">
            {SOCIALS.map((s, i) => (
              <div key={s.name} className={`rv-item reveal reveal-delay-${(i % 4) + 1}`}>
                <div className="card card--lift qr-card">
                  <div className={`qr-card__icon qr-card__icon--${s.name.toLowerCase()}`}>{s.icon}</div>
                  <h2 className="qr-card__name">{s.name}</h2>
                  <p className="qr-card__desc">{t(`qrcode.socials.${s.name}.desc`)}</p>

                  <div className="qr-card__code">
                    <img src={qrSrc(s.url)} alt={`${s.name} QR`} width="156" height="156" loading="lazy" referrerPolicy="no-referrer" />
                  </div>

                  <div className="pill-brand qr-card__user">{s.username}</div>

                  {/* rel="noreferrer" yolg'iz o'zi window.opener'ni kafolatlab bloklamaydi —
                      tabnabbing'dan himoya uchun noopener ham kerak */}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block qr-card__link">
                    {t('qrcode.goTo', { name: s.name })}
                    <Icon size={16}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></Icon>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* "Qanday foydalanish kerak?" — wine banner (oltin hairline) */}
          <div className="wine-banner wine-banner--row reveal">
            <div className="wine-banner__tile">
              <Icon size={26}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3" /><path d="M17 17h4" /><path d="M14 17v4" />
              </Icon>
            </div>
            <div>
              <h2 className="wine-banner__title wine-banner__title--sm">{t('qrcode.howTitle')}</h2>
              <p className="wine-banner__text wine-banner__text--sm">{t('qrcode.howText')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
