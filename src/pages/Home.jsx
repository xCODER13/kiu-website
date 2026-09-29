import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LANG } from '../i18n/locale'
import config from '../config'
import useReveal from '../hooks/useReveal'
import useApi from '../hooks/useApi'
import useJsonLd from '../hooks/useJsonLd'
import HeroSection from './home/HeroSection'
import AboutSection from './home/AboutSection'
import NewsSection from './home/NewsSection'

const API = import.meta.env.VITE_API_URL
const SITE_URL = 'https://kiu-university.vercel.app'

// Til bo'yicha alohida schema (nom, manzil, inLanguage, url) — useMemo bilan barqaror
// referens: useJsonLd har render'da script'ni qayta yaratmasligi uchun.
function buildUniversitySchema(t, lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: t('university.name'),
    alternateName: config.university.shortName,
    inLanguage: lang,
    url: lang === DEFAULT_LANG ? SITE_URL : `${SITE_URL}/${lang}`,
    logo: `${SITE_URL}${config.university.logo}`,
    foundingDate: config.university.founded,
    telephone: config.contact.phone,
    email: config.contact.email,
    address: [
      { '@type': 'PostalAddress', streetAddress: t('university.address1'), addressCountry: 'UZ' },
      { '@type': 'PostalAddress', streetAddress: t('university.address2'), addressCountry: 'UZ' },
    ],
    sameAs: Object.values(config.social),
  }
}

// ── MAIN ── (endi yupqa orkestrator — state/data-fetching va statistika
// hisoblagichi shu yerda, real render mantig'i home/HeroSection.jsx,
// home/AboutSection.jsx va home/NewsSection.jsx'ga bo'lingan)
export default function Home() {
  useReveal()
  const { t, i18n } = useTranslation()
  const schema = useMemo(() => buildUniversitySchema(t, i18n.language), [t, i18n.language])
  useJsonLd('jsonld-university', schema)

  const { data: newsData, loading: newsLoading, error: newsError } = useApi(`${API}/api/news`, [])
  // useApi noto'g'ri shakldagi (array bo'lmagan) javob bersa ham
  // ".filter is not a function" bilan qulamasin
  const articles = (Array.isArray(newsData) ? newsData : []).filter(n => !n.videoId)
  const featured = articles.slice(0, 5)
  const latest3 = articles.slice(0, 3)

  useEffect(() => {
    const timers = []
    const targets = config.stats.map((s, i) => ({
      el: document.getElementById(`stat-${i}`),
      target: parseInt(s.n.replace(/\D/g, '')),
      suffix: s.n.replace(/[0-9]/g, ''),
    }))
    targets.forEach(({ el, target, suffix }) => {
      if (!el) return
      let current = 0
      const step = Math.ceil(target / 60)
      const timer = setInterval(() => {
        current += step
        if (current >= target) { current = target; clearInterval(timer) }
        el.textContent = current + suffix
      }, 30)
      timers.push(timer)
    })
    return () => timers.forEach(clearInterval)
  }, [])

  return (
    <div className="fade-up">
      <HeroSection />
      <AboutSection />
      <NewsSection
        newsLoading={newsLoading} articles={articles} newsError={newsError}
        featured={featured} latest3={latest3}
      />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes homeCarouselFade { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
        @keyframes homeSkelShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes homeSectionFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 1080px) {
          .hero-grid .stats-grid { grid-template-columns: repeat(2, 1fr) !important; max-width: 320px !important; }
        }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-photo-wrap { order: -1; }
        }
      `}</style>
    </div>
  )
}