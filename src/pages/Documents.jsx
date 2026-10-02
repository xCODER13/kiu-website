import { useTranslation } from 'react-i18next'
import ContentLangNote from '../i18n/ContentLangNote'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'

const DOC_ICON = {
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  badge: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
  people: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  book: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
}

// Sarlavha/tavsif i18n'da (documents.items.<id>); PDF fayllarning o'zi o'zbekcha
const DOCS = [
  { id: 'license1', url: '/docs/Litsenziya-KIU-1.pdf', icon: 'file' },
  { id: 'license2', url: '/docs/Litsenziya-KIU-2.pdf', icon: 'file' },
  { id: 'accreditation', url: '/docs/Guvohnoma.pdf', icon: 'badge' },
  { id: 'collective', url: '/docs/KIU-Jamoa-shartnomasi-2026-2026.pdf', icon: 'people' },
  { id: 'labor', url: '/docs/Ichki-mehnat-tartib-qoidalari-2026.pdf', icon: 'book' },
  { id: 'ethics', url: '/docs/Odob-axloq-kodeksi.pdf', icon: 'book' },
]

export default function Documents() {
  const { t } = useTranslation()
  return (
    <div className="fade-up">
      <PageHero title={t('documents.title')} sub={t('documents.subtitle')} note={<ContentLangNote />} />

      <section className="page-body">
        <div className="container-wide">
          <div className="cards-3">
            {DOCS.map((doc, i) => (
              <div key={doc.id} className={`rv-item reveal reveal-delay-${(i % 3) + 1}`}>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="card card--lift doc-card">
                  <div className="doc-card__top">
                    <div className="tile tile--56"><Icon size={24}>{DOC_ICON[doc.icon]}</Icon></div>
                    <span className="pill-brand" aria-hidden="true">PDF</span>
                  </div>
                  <h3 className="doc-card__title">{t(`documents.items.${doc.id}.title`)}</h3>
                  <p className="doc-card__desc">{t(`documents.items.${doc.id}.desc`)}</p>
                  <span className="doc-card__open">
                    {t('documents.open')}
                    <Icon size={16}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Icon>
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
