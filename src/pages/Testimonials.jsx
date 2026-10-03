import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'

const REVIEWS = [
  { id: 1, name: "Aziza Karimova", year: 3, avatar: "AK" },
  { id: 2, name: "Jasur Toshmatov", year: 2, avatar: "JT" },
  { id: 3, name: "Malika Yusupova", year: 4, avatar: "MY" },
  { id: 4, name: "Bobur Rahimov", year: 1, avatar: "BR" },
  { id: 5, name: "Nilufar Hasanova", year: 3, avatar: "NH" },
  { id: 6, name: "Sardor Mirzayev", year: 'graduate', avatar: "SM" },
]

const STARS = [1, 2, 3, 4, 5]

export default function Testimonials() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <PageHero title={t('testimonials.title')} sub={t('testimonials.subtitle')} />

      <section className="page-body">
        <div className="container">
          <div className="cards-3">
            {REVIEWS.map((r, i) => (
              <div key={r.id} className={`rv-item reveal reveal-delay-${(i % 3) + 1}`}>
                <figure className="card card--lift review-card">
                  <div className="review-card__top">
                    <div className="tile tile--46">
                      <Icon size={22} strokeWidth={1.8}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></Icon>
                    </div>
                    {/* Yulduzlar — bezak: ekran o'quvchiga bitta "5 / 5" o'qiladi */}
                    <div className="review-card__stars" role="img" aria-label="5 / 5">
                      {STARS.map(s => (
                        <svg key={s} width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <blockquote className="review-card__text">{t(`testimonials.reviews.${r.id}.text`)}</blockquote>
                  <figcaption className="review-card__author">
                    <div className="avatar-wine" aria-hidden="true">{r.avatar}</div>
                    <div>
                      <div className="review-card__name">{r.name}</div>
                      <div className="review-card__meta">
                        {t(`testimonials.reviews.${r.id}.faculty`)} · {r.year === 'graduate' ? t('testimonials.graduate') : t('testimonials.year', { n: r.year })}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
