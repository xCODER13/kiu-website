import { useState, useEffect, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { API, H } from './shared/api'
import { Ic } from './shared/Icons.jsx'
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

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    fetch(`${API}/stats`, { headers: H() }).then(r => r.json()).then(setStats)
      .catch(err => { console.error('Stats yuklashda xatolik:', err); setError(true) })
  }, [])

  // ── Band 6: admin statistika dashboard'i — trend grafigi va reyting
  // grafiklari uchun qo'shimcha holatlar. Har biri o'z fetch/loading/error
  // holatiga ega — bittasi muvaffaqiyatsiz bo'lsa ham qolganlari ko'rsatiladi.
  const [granularity, setGranularity] = useState('day')
  const [trend, setTrend] = useState(null)
  const [trendError, setTrendError] = useState(false)
  useEffect(() => {
    // effect tanasida to'g'ridan-to'g'ri setState (reset) chaqirmaslik uchun —
    // "yuklanmoqda" holati pastda trend?.granularity joriy granularity bilan
    // solishtirib HISOBLANADI (eskirgan javob hali ko'rsatilmayapti degani).
    // `cancelled` — foydalanuvchi tez-tez tugmani bossa, eski so'rov javobi
    // yangisini bosib ketmasligi uchun.
    let cancelled = false
    fetch(`${API}/stats/applications-trend?granularity=${granularity}`, { headers: H() })
      .then(r => r.json())
      .then(d => { if (!cancelled) { setTrend(d); setTrendError(false) } })
      .catch(err => {
        if (cancelled) return
        console.error('Arizalar trendini yuklashda xatolik:', err)
        setTrendError(true)
      })
    return () => { cancelled = true }
  }, [granularity])

  const [topNews, setTopNews] = useState(null)
  const [topNewsError, setTopNewsError] = useState(false)
  useEffect(() => {
    fetch(`${API}/stats/top-news?limit=${TOP_LIMIT}`, { headers: H() })
      .then(r => r.json()).then(setTopNews)
      .catch(err => { console.error("Top yangiliklarni yuklashda xatolik:", err); setTopNewsError(true) })
  }, [])

  const [topEvents, setTopEvents] = useState(null)
  const [topEventsError, setTopEventsError] = useState(false)
  useEffect(() => {
    fetch(`${API}/stats/top-events?limit=${TOP_LIMIT}`, { headers: H() })
      .then(r => r.json()).then(setTopEvents)
      .catch(err => { console.error('Top tadbirlarni yuklashda xatolik:', err); setTopEventsError(true) })
  }, [])

  const [sortingHat, setSortingHat] = useState(null)
  const [sortingHatError, setSortingHatError] = useState(false)
  useEffect(() => {
    fetch(`${API}/stats/sortinghat-faculties`, { headers: H() })
      .then(r => r.json()).then(setSortingHat)
      .catch(err => { console.error('SortingHat statistikasini yuklashda xatolik:', err); setSortingHatError(true) })
  }, [])

  const [appFaculties, setAppFaculties] = useState(null)
  const [appFacultiesError, setAppFacultiesError] = useState(false)
  useEffect(() => {
    fetch(`${API}/stats/applications-faculties`, { headers: H() })
      .then(r => r.json()).then(setAppFaculties)
      .catch(err => { console.error("Ariza yo'nalishlari statistikasini yuklashda xatolik:", err); setAppFacultiesError(true) })
  }, [])

  const dateLabel = useCallback((d, full = false) => formatBucketDate(d, full, granularity), [granularity])

  if (error) return <p className="adm-error">Statistikani yuklashda xatolik yuz berdi. Sahifani qayta yuklab ko'ring.</p>
  if (!stats) return <p className="adm-loading">Yuklanmoqda...</p>

  // `tone` — 4.4 dagi `--stat-*` rangi (CSS `[data-tone]` orqali `--kpi-c` ga aylanadi)
  const cards = [
    { label: 'Yangiliklar',        value: stats.newsCount,     tone: 'blue',    icon: Ic.news,    to: '/admin/news'         },
    { label: 'Youtube shorts',     value: stats.shortsCount,   tone: 'orange',  icon: Ic.video,   to: '/admin/news'         },
    { label: 'Tadbirlar',          value: stats.eventsCount,   tone: 'emerald', icon: Ic.events,  to: '/admin/events'       },
    { label: "O'qituvchilar",      value: stats.teachersCount, tone: 'indigo',  icon: Ic.teach,   to: '/admin/teachers'     },
    { label: 'Qabul arizalari',    value: stats.appsCount,     tone: 'amber',   icon: Ic.apps,    to: '/admin/applications' },
    { label: 'Vakansiya arizalari',value: stats.vacancyApps,   tone: 'cyan',    icon: Ic.vacancy, to: '/admin/vacancies'    },
    { label: 'Galereya',           value: stats.galleryCount,  tone: 'lime',    icon: Ic.gallery, to: '/admin/gallery'      },
  ]

  // trend hali joriy granularity uchun kelmagan bo'lsa (masalan foydalanuvchi
  // "Hafta"ni bosdi-yu, so'rov hali javob bermadi) — eskirgan (oldingi
  // granularity'ga tegishli) ma'lumot ko'rsatilmasin, "Yuklanmoqda..." chiqadi.
  const trendLoading = !trendError && trend?.granularity !== granularity
  const trendBuckets = (trend?.buckets ?? []).map(b => ({ date: new Date(b.date), admission: b.admission, vacancy: b.vacancy }))
  const topNewsData = (Array.isArray(topNews) ? topNews : []).map(n => ({ label: n.title, value: n.views ?? 0 }))
  const topEventsData = (Array.isArray(topEvents) ? topEvents : []).map(e => ({ label: e.title, value: e.views ?? 0 }))
  const facultyData = (sortingHat?.faculties ?? []).map(f => ({ label: f.faculty, value: f.count }))
  const appFacultyData = (appFaculties?.faculties ?? []).map(f => ({ label: f.faculty, value: f.count }))

  return (
    <div>
      <h2 className="adm-page-title adm-page-title--spaced">Statistika</h2>
      {/* Kartalar 7 ta: 132px asosda (7*132 + 6*12 = 996px) keng ekranda hammasi bitta qatorga sig'adi
          (avval 155px edi va 7-karta yolg'iz ikkinchi qatorga tushib qolardi). NavLink `display:flex` va
          ichki karta `flex:1` — bir qatordagi kartalar yorliq 2 qatorga o'ralib ketsa ham bir xil balandlikda.
          "Yangi arizalar" kartasi olib tashlandi (Qabul arizalari bilan dublikat edi).
          grid o'rniga flex + justify-content:center ishlatildi — shunda oxirgi qatorda
          kartalar soni ustunlar soniga to'liq bo'linmasa ham, ikki tomonga bir xil
          bo'sh joy qoladi (grid'da bo'sh ustun faqat o'ngda qolib, assimetrik ko'rinar edi).
          Hover (siljish) CSS da: `.adm-kpi:hover` (oldin JS hover) */}
      <div className="adm-kpi-grid">
        {cards.map(c => (
          <NavLink key={c.label} to={c.to} className="adm-kpi-link">
            <div className="adm-card adm-kpi" data-tone={c.tone}>
              <div className="adm-kpi-top">
                <div className="adm-kpi-value">{c.value ?? 0}</div>
                <div className="adm-kpi-icon">{c.icon}</div>
              </div>
              <div className="adm-kpi-label">{c.label}</div>
            </div>
          </NavLink>
        ))}
      </div>

      <h3 className="adm-subtitle">Batafsil statistika</h3>

      {/* Arizalar trendi — kun/hafta almashtirish tugmasi bilan */}
      <div className="adm-card adm-trend-card">
        <div className="adm-card-head">
          <div className="adm-card-title">
            <span className="adm-card-title-icon">{Ic.stats}</span>
            Arizalar trendi
          </div>
          <div className="adm-seg" role="group" aria-label="Vaqt oralig'ini tanlash">
            <button type="button" aria-label="Kunlik ko'rinish" aria-pressed={granularity === 'day'}
              className={granularity === 'day' ? 'adm-btn adm-btn--primary' : 'adm-btn'} onClick={() => setGranularity('day')}>Kun</button>
            <button type="button" aria-label="Haftalik ko'rinish" aria-pressed={granularity === 'week'}
              className={granularity === 'week' ? 'adm-btn adm-btn--primary' : 'adm-btn'} onClick={() => setGranularity('week')}>Hafta</button>
          </div>
        </div>
        {trendError ? (
          <p className="adm-error">Trendni yuklashda xatolik yuz berdi.</p>
        ) : trendLoading ? (
          <p className="adm-loading">Yuklanmoqda...</p>
        ) : trendBuckets.length === 0 ? (
          <p className="adm-loading adm-empty">Ma'lumot yo'q</p>
        ) : (
          <>
            <TrendLineChart
              data={trendBuckets}
              series={[
                { key: 'admission', label: 'Qabul arizalari', color: 'var(--stat-amber)' },
                { key: 'vacancy', label: 'Vakansiya arizalari', color: 'var(--stat-cyan)' },
              ]}
              dateLabel={dateLabel}
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
        <div className="adm-card">
          <div className="adm-card-title" data-tone="blue"><span className="adm-card-title-icon">{Ic.news}</span>Eng ko'p ko'rilgan yangiliklar</div>
          {topNewsError ? <p className="adm-error">Yuklashda xatolik yuz berdi.</p>
            : !topNews ? <p className="adm-loading">Yuklanmoqda...</p>
            : <RankedBarChart data={topNewsData} color="var(--stat-blue)" />}
        </div>

        <div className="adm-card">
          <div className="adm-card-title" data-tone="emerald"><span className="adm-card-title-icon">{Ic.events}</span>Eng ko'p ko'rilgan tadbirlar</div>
          {topEventsError ? <p className="adm-error">Yuklashda xatolik yuz berdi.</p>
            : !topEvents ? <p className="adm-loading">Yuklanmoqda...</p>
            : <RankedBarChart data={topEventsData} color="var(--stat-emerald)" />}
        </div>

        <div className="adm-card">
          <div className="adm-card-title" data-tone="violet"><span className="adm-card-title-icon">{Ic.teach}</span>Sehrli shlyapa yo'nalish tavsiyalari</div>
          {sortingHatError ? <p className="adm-error">Yuklashda xatolik yuz berdi.</p>
            : !sortingHat ? <p className="adm-loading">Yuklanmoqda...</p>
            : (
              <>
                <RankedBarChart data={facultyData} color="var(--stat-violet)" />
                <div className="adm-chart-total">Jami: {sortingHat.total ?? 0} ta murojaat</div>
              </>
            )}
        </div>

        <div className="adm-card">
          <div className="adm-card-title" data-tone="amber"><span className="adm-card-title-icon">{Ic.apps}</span>Eng ko'p ariza tushgan yo'nalishlar</div>
          {appFacultiesError ? <p className="adm-error">Yuklashda xatolik yuz berdi.</p>
            : !appFaculties ? <p className="adm-loading">Yuklanmoqda...</p>
            : (
              <>
                <RankedBarChart data={appFacultyData} color="var(--stat-amber)" />
                <div className="adm-chart-total">Jami: {appFaculties.total ?? 0} ta ariza</div>
              </>
            )}
        </div>
      </div>
    </div>
  )
}
