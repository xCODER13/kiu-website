import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import TelegramPanel from '../components/TelegramPanel'
import telHref from '../utils/telHref'
import config from '../config'

const pin = <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>

// `href` bor kartalar (telefon, email) — havola; qolganlari oddiy matn (manzil, ish vaqti).
const ITEMS = [
  { key: 'campus1', text: 'university.address1', icon: pin },
  { key: 'campus2', text: 'university.address2', icon: pin },
  {
    key: 'phone', value: config.contact.phone, href: telHref(config.contact.phone),
    icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.58 4.88C1.58 3.85 2.35 3 3.39 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18v-.08z" />,
  },
  {
    key: 'email', value: config.contact.email, href: `mailto:${config.contact.email}`,
    icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
  },
  { key: 'workHours', text: 'university.workHours', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
]

export default function Contact() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <PageHero title={t('contact.title')} sub={t('contact.subtitle')} />
      <section className="page-body">
        <div className="container-wide">
          <div className="contact-grid">
            <div className="contact-list">
              {ITEMS.map((item, i) => (
                <div key={item.key} className={`rv-item reveal reveal-delay-${(i % 4) + 1}`}>
                  <div className="card card--lift contact-card" data-link={item.href ? 'true' : undefined}>
                    <div className="tile"><Icon>{item.icon}</Icon></div>
                    <div className="contact-card__body">
                      <div className="contact-card__label">{t(`contact.${item.key}`)}</div>
                      {item.href ? (
                        <a href={item.href} className="contact-card__link">
                          <span>{item.value}</span>
                        </a>
                      ) : (
                        <div className="contact-card__value">{t(item.text)}</div>
                      )}
                    </div>
                    {item.href && (
                      <span className="contact-card__go" aria-hidden="true">
                        <Icon size={16}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></Icon>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="rv-item reveal reveal-delay-2 contact-tg">
              <TelegramPanel single />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
