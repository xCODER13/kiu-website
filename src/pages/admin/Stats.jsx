import { useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { Ic } from './shared/Icons.jsx'
import { useApiGet } from './shared/useApiGet'
import { LoadingState, ErrorState, EmptyState, ErrorBanner } from './shared/StateViews.jsx'
import TrendLineChart from './charts/TrendLineChart'
import RankedBarChart from './charts/RankedBarChart'

// Top-yangiliklar / top-tadbirlar grafiklarida nechta qator ko'rsatilishi
// (backend standarti 5, maksimum 20 — `limit` query parametri bilan oshiriladi)
const TOP_LIMIT = 10

// Bucket sanasi (server UTC'da $dateTrunc bilan hisoblagan, masalan "2026-09-01")
// har doim UTC getter'lar bilan o'qiladi — toLocaleDateString ishlatilmaydi, chunki
// u LOKAL vaqt zonasidan foydalanadi va UTC yarim tunni oldingi kunga siljitib
// yuborishi mumkin (masalan foydalanuvchi UTC'dan orqada bo'lgan zonada bo'lsa).
function formatBucketDate(d, full, granularity) {
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  if (!full) return `${day}.${month}`
  const base = `${day}.${month}.${d.getUTCFullYear()}`
  return granularity === 'week' ? `${base} haftasi` : base
}

// Reyting kartasi: sarlavha (rangli ikonka plitkasi) + holatga qarab yuklanmoqda / xato / grafik.
// Har karta o'z holatiga ega — bittasi muvaffaqiyatsiz bo'lsa ham qolganlari ko'rsatiladi.
function RankCard({ title, tone, icon, resource, children }) {
  return (
    <div className="adm-card">
      <h4 className="adm-card-title" data-tone={tone}><span className="adm-card-title-icon" aria-hidden="true">{icon}</span>{title}</h4>
      {resource.error ? <ErrorState />
        : resource.loading ? <LoadingState />
        : children}
    </div>
  )
}

export default function Stats() {
  // 6.22: barcha so'rovlar `useApiGet` orqali — `res.ok` tekshiriladi, unmount/granularity
  // almashganda `AbortController` eskisini bekor qiladi (avval faqat trendda poyga himoyasi bor edi).
  const [granularity, setGranularity] = useState('day')
  const stats = useApiGet('/stats', 'Stats yuklashda xatolik')
  const trend = useApiGet(`/stats/applications-trend?granularity=${granularity}`, 'Arizalar trendini yuklashda xatolik')
  const topNews = useApiGet(`/stats/top-news?limit=${TOP_LIMIT}`, 'Top yangiliklarni yuklashda xatolik')
  const topEvents = useApiGet(`/stats/top-events?limit=${TOP_LIMIT}`, 'Top tadbirlarni yuklashda xatolik')
  const sortingHat = useApiGet('/stats/sortinghat-faculties', 'SortingHat statistikasini yuklashda xatolik')
  const appFaculties = useApiGet('/stats/applications-faculties', "Ariza yo'nalishlari statistikasini yuklashda xatolik")

  const dateLabel = useCallback((d, full = false) => formatBucketDate(d, full, granularity), [granularity])

  // Sarlavha har holatda ko'rinadi (taxta: "sahifa darajasidagi holatlar" — yuklanmoqda va xato ham shu ostida)
  if (stats.error) {
    return (
      <div>
        <h2 className="adm-page-title adm-page-title--spaced">Statistika</h2>
        <ErrorBanner>Statistikani yuklashda xatolik yuz berdi. Sahifani qayta yuklab ko'ring.</ErrorBanner>
      </div>
    )
  }
  if (stats.loading) {
    return (
      <div>
        <h2 className="adm-page-title adm-page-title--spaced">Statistika</h2>
        <LoadingState />
      </div>
    )
  }
  const s = stats.data ?? {}

  // `tone` — 4.4 dagi `--stat-*` rangi (CSS `[data-tone]` orqali `--kpi-c` ga aylanadi)
  const cards = [
    { label: 'Yangiliklar',        value: s.newsCount,     tone: 'blue',    icon: Ic.news,    to: '/admin/news'         },
    { label: 'Youtube shorts',     value: s.shortsCount,   tone: 'orange',  icon: Ic.video,   to: '/admin/news'         },
    { label: 'Tadbirlar',          value: s.eventsCount,   tone: 'emerald', icon: Ic.events,  to: '/admin/events'       },
    { label: "O'qituvchilar",      value: s.teachersCount, tone: 'indigo',  icon: Ic.teach,   to: '/admin/teachers'     },
    { label: 'Qabul arizalari',    value: s.appsCount,     tone: 'amber',   icon: Ic.clipboard, to: '/admin/applications' },
    { label: 'Vakansiya arizalari',value: s.vacancyApps,   tone: 'cyan',    icon: Ic.vacancy, to: '/admin/vacancies'    },
    { label: 'Talabalar hayoti',  value: s.galleryCount,  tone: 'lime',    icon: Ic.gallery, to: '/admin/gallery'      },
  ]

  const trendBuckets = (trend.data?.buckets ?? []).map(b => ({ date: new Date(b.date), admission: b.admission, vacancy: b.vacancy }))
  const topNewsData = (Array.isArray(topNews.data) ? topNews.data : []).map(n => ({ label: n.title, value: n.views ?? 0 }))
  const topEventsData = (Array.isArray(topEvents.data) ? topEvents.data : []).map(e => ({ label: e.title, value: e.views ?? 0 }))
  const facultyData = (sortingHat.data?.faculties ?? []).map(f => ({ label: f.faculty, value: f.count }))
  const appFacultyData = (appFaculties.data?.faculties ?? []).map(f => ({ label: f.faculty, value: f.count }))

  return (
    <div>
      <h2 className="adm-page-title adm-page-title--spaced">Statistika</h2>
      {/* Kartalar 7 ta: 132px asosda (7*132 + 6*12 = 996px) keng ekranda hammasi bitta qatorga sig'adi.
          NavLink `display:flex` va ichki karta `flex:1` — bir qatordagi kartalar yorliq 2 qatorga o'ralib
          ketsa ham bir xil balandlikda. Flex + justify-content:center (grid emas): oxirgi qatorda
          kartalar soni ustunlarga bo'linmasa ham ikki tomonga bir xil bo'sh joy qoladi.
          Hover (siljish va soya) CSS da: `.adm-kpi:hover`. */}
      <div className="adm-kpi-grid">
        {cards.map(c => (
          <NavLink key={c.label} to={c.to} className="adm-kpi-link">
            <div className="adm-card adm-kpi" data-tone={c.tone}>
              <div className="adm-kpi-top">
                <div className="adm-kpi-value">{c.value ?? 0}</div>
                <div className="adm-kpi-icon" aria-hidden="true">{c.icon}</div>
              </div>
              <div className="adm-kpi-label">{c.label}</div>
            </div>
          </NavLink>
        ))}
      </div>

      <h3 className="adm-subtitle">Batafsil statistika</h3>

      {/* Arizalar trendi — kun/hafta almashtirish tugmasi bilan. Sarlavha va tugmalar har holatda ko'rinadi */}
      <div className="adm-card adm-trend-card">
        <div className="adm-card-head">
          <h4 className="adm-card-title">
            <span className="adm-card-title-icon" aria-hidden="true">{Ic.stats}</span>
            Arizalar trendi
          </h4>
          <div className="adm-seg" role="group" aria-label="Vaqt oralig'ini tanlash">
            <button type="button" aria-label="Kunlik ko'rinish" aria-pressed={granularity === 'day'}
              className={granularity === 'day' ? 'btn btn-sm btn-primary' : 'btn btn-sm'} onClick={() => setGranularity('day')}>Kun</button>
            <button type="button" aria-label="Haftalik ko'rinish" aria-pressed={granularity === 'week'}
              className={granularity === 'week' ? 'btn btn-sm btn-primary' : 'btn btn-sm'} onClick={() => setGranularity('week')}>Hafta</button>
          </div>
        </div>
        {trend.error ? (
          <ErrorState>Trendni yuklashda xatolik yuz berdi.</ErrorState>
        ) : trend.loading ? (
          <LoadingState />
        ) : trendBuckets.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <TrendLineChart
              data={trendBuckets}
              series={[
                { key: 'admission', label: 'Qabul arizalari', color: 'var(--stat-amber)' },
                { key: 'vacancy', label: 'Vakansiya arizalari', color: 'var(--stat-cyan)' },
              ]}
              dateLabel={dateLabel}
              ariaLabel="Arizalar trendi: qabul va vakansiya arizalari soni"
            />
            <div className="adm-legend">
              <span className="adm-legend-item" data-tone="amber"><span className="adm-legend-dot" />Qabul arizalari</span>
              <span className="adm-legend-item" data-tone="cyan"><span className="adm-legend-dot" />Vakansiya arizalari</span>
            </div>
          </>
        )}
      </div>

      {/* 2 qator x 2 ustun (`.adm-rank-grid`): keng ekranda doim 2 ustun; tor ekranda (ustun 260px dan
          kichraymasligi uchun) o'zi 1 ustunga tushadi */}
      <div className="adm-rank-grid">
        <RankCard title="Eng ko'p ko'rilgan yangiliklar" tone="blue" icon={Ic.news} resource={topNews}>
          <RankedBarChart data={topNewsData} color="var(--stat-blue)" ariaLabel="Eng ko'p ko'rilgan yangiliklar" />
        </RankCard>

        <RankCard title="Eng ko'p ko'rilgan tadbirlar" tone="emerald" icon={Ic.events} resource={topEvents}>
          <RankedBarChart data={topEventsData} color="var(--stat-emerald)" ariaLabel="Eng ko'p ko'rilgan tadbirlar" />
        </RankCard>

        <RankCard title="Sehrli shlyapa yo'nalish tavsiyalari" tone="violet" icon={Ic.teach} resource={sortingHat}>
          <RankedBarChart data={facultyData} color="var(--stat-violet)" ariaLabel="Sehrli shlyapa yo'nalish tavsiyalari" />
          {facultyData.length > 0 && <div className="adm-chart-total">Jami: {sortingHat.data?.total ?? 0} ta murojaat</div>}
        </RankCard>

        <RankCard title="Eng ko'p ariza tushgan yo'nalishlar" tone="amber" icon={Ic.clipboard} resource={appFaculties}>
          <RankedBarChart data={appFacultyData} color="var(--stat-amber)" ariaLabel="Eng ko'p ariza tushgan yo'nalishlar" />
          {appFacultyData.length > 0 && <div className="adm-chart-total">Jami: {appFaculties.data?.total ?? 0} ta ariza</div>}
        </RankCard>
      </div>
    </div>
  )
}
