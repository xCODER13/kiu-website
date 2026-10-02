import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import config from '../config'

// Matn va sana i18n'da (telegram.posts.<id>) — bu yerda faqat id va ikonka turi
const DEMO_POSTS = [
  { id: 1, type: 'announce' },
  { id: 2, type: 'edu' },
  { id: 3, type: 'calendar' },
  { id: 4, type: 'check' },
]

const TgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
  </svg>
)

const PostIcon = ({ type }) => {
  if (type === 'announce') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  )
  if (type === 'edu') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
  if (type === 'calendar') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
  if (type === 'check') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

// `single` — bitta ustunli ko'rinish (tor joy: Contact yarim ustuni); odatda 2×2 to'r (keng joy: Yangiliklar)
export default function TelegramPanel({ single = false }) {
  const { t } = useTranslation()
  const [posts] = useState(DEMO_POSTS)

  return (
    <div className="tg-box" data-layout={single ? 'single' : 'grid'}>

      {/* Head */}
      <div className="tg-head">
        <div className="tg-avatar">
          <TgIcon />
        </div>
        <div>
          <div className="tg-name">{config.telegram.username}</div>
          <div className="tg-channel">{t('telegram.channel')}</div>
        </div>
        <span className="tg-live"><span className="tg-live-dot" aria-hidden="true" />LIVE</span>
      </div>

      {/* Messages */}
      <div className="tg-msgs">
        {posts.map(p => (
          <div key={p.id} className="tg-msg">
            <div className="tg-msg-icon">
              <PostIcon type={p.type} />
            </div>
            <div className="tg-msg-body">
              <p className="tg-msg-text">{t(`telegram.posts.${p.id}.text`)}</p>
              <time className="tg-msg-date">{t(`telegram.posts.${p.id}.date`)}</time>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="tg-foot">
        {/* rel="noreferrer" yolg'iz o'zi window.opener'ni kafolatlab bloklamaydi —
            noopener ham qo'shildi (tabnabbing'dan himoya, Documents.jsx'dagi bilan bir xil tuzatish) */}
        <a href={config.telegram.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-cta tg-subscribe">
          <TgIcon />
          {t('telegram.subscribe')}
        </a>
      </div>
    </div>
  )
}
