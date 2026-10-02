import { useTranslation } from 'react-i18next'
import { NavLink } from '../../i18n/router'
import ContentLangNote from '../../i18n/ContentLangNote'
import HomeNewsCarousel from './NewsCarousel'
import HomeNewsCard from './NewsCard'

// "Yangiliklar" bo'limi (6.11c5): yuklanish skeleti, karusel + so'nggi 3 ta karta, xato/bo'sh holat.
// Skeleton — dekorativ (`aria-hidden`), o'rami `role="status"` + `aria-busy` bilan yuklanayotganini bildiradi.
export default function NewsSection({ newsLoading, articles, newsError, featured, latest3 }) {
  const { t } = useTranslation()
  return (
    <section className="section home-news">
      <div className="container-wide">
        <div className="reveal home-news__head">
          <span className="section-badge">{t('home.news.badge')}</span>
          <h2 className="section-title section-title--center">{t('home.news.title')}</h2>
          <p className="home-news__sub">{t('home.news.subtitle')}</p>
          <ContentLangNote />
        </div>

        {newsLoading ? (
          <div role="status" aria-busy="true" aria-label={t('common.loading')}>
            <div className="home-skel home-skel--hero" aria-hidden="true" />
            <div className="cards-3" aria-hidden="true">
              {[0, 1, 2].map(i => <div key={i} className="home-skel home-skel--card" style={{ '--i': i }} />)}
            </div>
          </div>
        ) : articles.length > 0 ? (
          <>
            <HomeNewsCarousel items={featured} />
            <div className="cards-3 home-news__grid">
              {latest3.map((n, i) => <HomeNewsCard key={n._id} item={n} index={i} />)}
            </div>
          </>
        ) : (
          // Xato yoki bo'sh natija
          <div className="notice-banner" data-tone={newsError ? 'danger' : undefined} role={newsError ? 'alert' : 'status'}>
            {newsError ? t('home.news.error') : t('home.news.empty')}
          </div>
        )}

        <div className="reveal home-news__more">
          <NavLink to="/news" className="btn btn-primary btn-lg">{t('home.news.all')}</NavLink>
        </div>
      </div>
    </section>
  )
}
