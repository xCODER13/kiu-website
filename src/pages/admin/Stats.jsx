import { useState, useEffect, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { API, H } from './shared/api'
import { card, bP, bG } from './shared/styles'
import { Ic } from './shared/Icons.jsx'
import TrendLineChart from './charts/TrendLineChart'
import RankedBarChart from './charts/RankedBarChart'

const loadingText = { color: 'var(--muted)', fontSize: 13 }
const errorText = { color: '#dc2626', fontSize: 13 }
// Top-yangiliklar / top-tadbirlar grafiklarida nechta qator ko'rsatilishi
// (backend standarti 5, maksimum 20 — `limit` query parametri bilan oshiriladi)
const TOP_LIMIT = 10

const sectionCardTitle = { fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }

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

  if (error) return <p style={errorText}>Statistikani yuklashda xatolik yuz berdi. Sahifani qayta yuklab ko'ring.</p>
  if (!stats) return <p style={loadingText}>Yuklanmoqda...</p>

  const cards = [
    { label: 'Yangiliklar',        value: stats.newsCount,     color: '#f11717', icon: Ic.news,    to: '/admin/news'         },
    { label: 'Youtube shorts',     value: stats.shortsCount,   color: '#ea580c', icon: Ic.video,   to: '/admin/news'         },
    { label: 'Tadbirlar',          value: stats.eventsCount,   color: '#e546e5', icon: Ic.events,  to: '/admin/events'       },
    { label: "O'qituvchilar",      value: stats.teachersCount, color: '#0088cc', icon: Ic.teach,   to: '/admin/teachers'     },
    { label: 'Qabul arizalari',    value: stats.appsCount,     color: '#059669', icon: Ic.apps,    to: '/admin/applications' },
    { label: 'Vakansiya arizalari',value: stats.vacancyApps,   color: '#4f46e5', icon: Ic.vacancy, to: '/admin/vacancies'    },
    { label: 'Galereya',           value: stats.galleryCount,  color: '#0d9488', icon: Ic.gallery, to: '/admin/gallery'      },
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
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>Statistika</h2>
      {/* Kartalar 7 ta: 132px asosda (7*132 + 6*12 = 996px) keng ekranda hammasi bitta qatorga sig'adi
          (avval 155px edi va 7-karta yolg'iz ikkinchi qatorga tushib qolardi). NavLink `display:flex` va
          ichki karta `flex:1` — bir qatordagi kartalar yorliq 2 qatorga o'ralib ketsa ham bir xil balandlikda.
          "Yangi arizalar" kartasi olib tashlandi (Qabul arizalari bilan dublikat edi).
          grid o'rniga flex + justify-content:center ishlatildi — shunda oxirgi qatorda
          kartalar soni ustunlar soniga to'liq bo'linmasa ham, ikki tomonga bir xil
          bo'sh joy qoladi (grid'da bo'sh ustun faqat o'ngda qolib, assimetrik ko'rinar edi) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: '2rem' }}>
        {cards.map(c => (
          <NavLink key={c.label} to={c.to} style={{ textDecoration: 'none', display: 'flex', flex: '1 1 132px', maxWidth: 220 }}>
            <div style={{ ...card, flex: 1, minWidth: 0, borderLeft: `3px solid ${c.color}`, cursor: 'pointer', transition: 'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c.color }}>{c.value ?? 0}</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.label}</div>
            </div>
          </NavLink>
        ))}
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>Batafsil statistika</h3>

      {/* Arizalar trendi — kun/hafta almashtirish tugmasi bilan */}
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={sectionCardTitle}>
            <span style={{ color: '#7c3aed' }}>{Ic.stats}</span>
            Arizalar trendi
          </div>
          <div style={{ display: 'flex', gap: 6 }} role="group" aria-label="Vaqt oralig'ini tanlash">
            <button type="button" aria-label="Kunlik ko'rinish" aria-pressed={granularity === 'day'}
              style={granularity === 'day' ? bP : bG} onClick={() => setGranularity('day')}>Kun</button>
            <button type="button" aria-label="Haftalik ko'rinish" aria-pressed={granularity === 'week'}
              style={granularity === 'week' ? bP : bG} onClick={() => setGranularity('week')}>Hafta</button>
          </div>
        </div>
        {trendError ? (
          <p style={errorText}>Trendni yuklashda xatolik yuz berdi.</p>
        ) : trendLoading ? (
          <p style={loadingText}>Yuklanmoqda...</p>
        ) : trendBuckets.length === 0 ? (
          <p style={{ ...loadingText, textAlign: 'center', padding: '1.5rem 0' }}>Ma'lumot yo'q</p>
        ) : (
          <>
            <TrendLineChart
              data={trendBuckets}
              series={[
                { key: 'admission', label: 'Qabul arizalari', color: '#059669' },
                { key: 'vacancy', label: 'Vakansiya arizalari', color: '#4f46e5' },
              ]}
              dateLabel={dateLabel}
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />Qabul arizalari</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }} />Vakansiya arizalari</span>
            </div>
          </>
        )}
      </div>

      {/* 2 qator x 2 ustun: keng ekranda doim 2 ustun; tor ekranda (ustun 260px dan
          kichraymasligi uchun) o'zi 1 ustunga tushadi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(max(260px, calc(50% - 8px)), 1fr))', gap: 12 }}>
        <div style={card}>
          <div style={sectionCardTitle}><span style={{ color: '#f11717' }}>{Ic.news}</span>Eng ko'p ko'rilgan yangiliklar</div>
          {topNewsError ? <p style={errorText}>Yuklashda xatolik yuz berdi.</p>
            : !topNews ? <p style={loadingText}>Yuklanmoqda...</p>
            : <RankedBarChart data={topNewsData} color="#f11717" />}
        </div>

        <div style={card}>
          <div style={sectionCardTitle}><span style={{ color: '#e546e5' }}>{Ic.events}</span>Eng ko'p ko'rilgan tadbirlar</div>
          {topEventsError ? <p style={errorText}>Yuklashda xatolik yuz berdi.</p>
            : !topEvents ? <p style={loadingText}>Yuklanmoqda...</p>
            : <RankedBarChart data={topEventsData} color="#e546e5" />}
        </div>

        <div style={card}>
          <div style={sectionCardTitle}><span style={{ color: '#7c3aed' }}>{Ic.teach}</span>Sehrli shlyapa yo'nalish tavsiyalari</div>
          {sortingHatError ? <p style={errorText}>Yuklashda xatolik yuz berdi.</p>
            : !sortingHat ? <p style={loadingText}>Yuklanmoqda...</p>
            : (
              <>
                <RankedBarChart data={facultyData} color="#7c3aed" />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Jami: {sortingHat.total ?? 0} ta murojaat</div>
              </>
            )}
        </div>

        <div style={card}>
          <div style={sectionCardTitle}><span style={{ color: '#059669' }}>{Ic.apps}</span>Eng ko'p ariza tushgan yo'nalishlar</div>
          {appFacultiesError ? <p style={errorText}>Yuklashda xatolik yuz berdi.</p>
            : !appFaculties ? <p style={loadingText}>Yuklanmoqda...</p>
            : (
              <>
                <RankedBarChart data={appFacultyData} color="#059669" />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Jami: {appFaculties.total ?? 0} ta ariza</div>
              </>
            )}
        </div>
      </div>
    </div>
  )
}