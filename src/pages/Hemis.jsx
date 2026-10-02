import { useTranslation, Trans } from 'react-i18next'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import telHref from '../utils/telHref'
import config from '../config'

// Tashqi havola ikonkasi (tugma oxirida)
const ExternalIcon = () => (
  <Icon size={16}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </Icon>
)

// Havolalar o'zgarmagan: ikkala HEMIS portali. Ikonka/matn kalitlari — i18n `hemis.*`.
const PORTALS = [
  {
    key: 'students',
    href: 'https://student.kiu.uz/dashboard/login',
    label: 'HEMIS Student',
    icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>,
  },
  {
    key: 'teachers',
    href: 'https://hemis.kiu.uz/dashboard/login',
    label: 'HEMIS OTM',
    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  },
]

export default function Hemis() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <PageHero title={t('hemis.title')} sub={t('hemis.subtitle')} />

      <section className="page-body">
        <div className="container container--820 hemis-flow">
          <div className="cards-2">
            {PORTALS.map((p, i) => (
              <div key={p.key} className={`rv-item reveal${i ? ` reveal-delay-${i}` : ''}`}>
                <div className="card card--lift hemis-card">
                  <div className="tile tile--72"><Icon size={32}>{p.icon}</Icon></div>
                  <h2 className="hemis-card__title">{t(`hemis.${p.key}Title`)}</h2>
                  <p className="hemis-card__desc">{t(`hemis.${p.key}Desc`)}</p>
                  {/* rel="noreferrer" yolg'iz o'zi window.opener'ni kafolatlab bloklamaydi —
                      tabnabbing'dan himoya uchun noopener ham kerak */}
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-cta btn-block hemis-card__btn">
                    {p.label}
                    <ExternalIcon />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="rv-item reveal">
            <div className="card hemis-help">
              <div className="tile"><Icon><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon></div>
              <div>
                <h2 className="hemis-help__title">{t('hemis.helpTitle')}</h2>
                <p className="hemis-help__text">
                  <Trans
                    i18nKey="hemis.helpText"
                    values={{ phone: config.contact.phone, telegram: config.telegram.username }}
                    components={{
                      phone: <a href={telHref(config.contact.phone)} className="strong-link" />,
                      tg: <a href={config.telegram.url} target="_blank" rel="noopener noreferrer" className="strong-link" />,
                    }}
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
