import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// "SHORTS TAB" bo'limi — News.jsx'dan o'zgarishsiz ko'chirilgan.
// Hardcode FALLBACK_SHORTS olib tashlandi (2026-09-30, a3b632e) — video ro'yxati
// endi to'liq backend/admin panelga bog'liq. Bo'sh bo'lsa NewsTab.jsx'dagi bilan
// bir xil naqshda (ikonka + matn) bo'sh holat ko'rsatiladi.
// Video kartasi (6.16, taxta "NewsVideo"): avval poster + doira "play" tugmasi; iframe (va YouTube'ga so'rovlar)
// faqat bosilganda yuklanadi — sahifa tezroq, uchinchi tomonga kamroq so'rov. Poster — videoning o'z miniatyurasi
// (yuklanmasa, taxtadagi to'q gradient fon qoladi).
function ShortFrame({ short }) {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const frameRef = useRef(null)
  const id = encodeURIComponent(short.videoId)

  // Tugma yo'qolgach fokus yo'qolmasin — iframe'ga o'tkaziladi
  useEffect(() => { if (playing) frameRef.current?.focus() }, [playing])

  return (
    <div className="shorts-frame">
      {playing ? (
        <iframe
          ref={frameRef}
          src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=1`}
          title={short.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <>
          <img className="shorts-thumb" src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
          <button type="button" className="shorts-play" onClick={() => setPlaying(true)} aria-label={t('news.playVideo', { title: short.title })}>
            <span className="shorts-play__disc" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon fill="currentColor" points="9 6 18 12 9 18 9 6" /></svg>
            </span>
          </button>
        </>
      )}
    </div>
  )
}

export default function ShortsTab({ shorts }) {
  const { t } = useTranslation()
  return (
    <section className="page-body">
      <div className="container shorts-flow">
        <div className="shorts-channel">
          <div className="shorts-channel-tile"><svg width="28" height="28" viewBox="0 0 24 24" className="shorts-channel-icon" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>
          <div className="shorts-channel-text">
            <div className="shorts-channel-title">{t('news.channelTitle')}</div>
            <div className="shorts-channel-sub">{t('news.channelSub')}</div>
          </div>
          <a href="https://youtube.com/@kiu_uz" target="_blank" rel="noopener noreferrer" className="btn btn-primary shorts-link">
            {t('news.channelGo')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
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
              <ShortFrame short={s} />
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