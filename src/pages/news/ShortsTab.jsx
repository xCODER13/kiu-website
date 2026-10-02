import { useTranslation } from 'react-i18next'

// "SHORTS TAB" bo'limi — News.jsx'dan o'zgarishsiz ko'chirilgan.
// Hardcode FALLBACK_SHORTS olib tashlandi (2026-09-30, a3b632e) — video ro'yxati
// endi to'liq backend/admin panelga bog'liq. Bo'sh bo'lsa NewsTab.jsx'dagi bilan
// bir xil naqshda (ikonka + matn) bo'sh holat ko'rsatiladi.
export default function ShortsTab({ shorts }) {
  const { t } = useTranslation()
  return (
    <section className="section">
      <div className="container">
        <div className="shorts-channel">
          <div className="shorts-channel-tile"><svg width="28" height="28" viewBox="0 0 24 24" className="shorts-channel-icon" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>
          <div className="shorts-channel-text">
            <div className="shorts-channel-title">{t('news.channelTitle')}</div>
          </div>
          <a href="https://youtube.com/@kiu_uz" target="_blank" rel="noopener noreferrer" className="btn btn-primary shorts-link">{t('news.channelGo')}</a>
        </div>
        {shorts.length === 0 ? (
          <div className="empty-state shorts-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><polygon points="10 9 15 12 10 15 10 9"/></svg>
            <p className="empty-state-title">{t('news.emptyShorts')}</p>
            <p className="empty-state-hint">{t('news.emptyShortsHint')}</p>
          </div>
        ) : (
        <div className="shorts-grid">
          {shorts.map(s => (
            <div key={s._id || s.id} className="card shorts-card">
              <div className="shorts-frame">
                <iframe
                  src={`https://www.youtube.com/embed/${s.videoId}?rel=0&modestbranding=1`}
                  title={s.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="shorts-body">
                <p className="shorts-title">{s.title}</p>
                <a href={`https://youtube.com/shorts/${s.videoId}`} target="_blank" rel="noopener noreferrer" className="shorts-watch">
                  {t('news.watch')}
                </a>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}