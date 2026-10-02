/* global process */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Stats from './Stats'
import { mockApi } from '../../test/helpers'

const setup = () => render(<MemoryRouter><Stats /></MemoryRouter>)

// Band 6 testlarida ishlatiladigan bazaviy javoblar — mockApi'ga berilmagan
// yo'llar {} bilan javob qaytaradi, shuning uchun har bir testda faqat shu
// testga tegishli bo'lgan yo'llarni aniq belgilaymiz.
const TREND_DAY = {
  granularity: 'day',
  buckets: [
    { date: '2026-09-01', admission: 3, vacancy: 1 },
    { date: '2026-09-02', admission: 5, vacancy: 2 },
  ],
}
const TREND_WEEK = {
  granularity: 'week',
  buckets: [{ date: '2026-08-24', admission: 8, vacancy: 3 }],
}
const TOP_NEWS = [
  { _id: '1', title: 'Ochiq eshiklar kuni haqida', views: 120, category: 'umumiy' },
  { _id: '2', title: 'Yangi fakultet ochildi', views: 80, category: 'talim' },
]
const TOP_EVENTS = [
  { _id: '1', title: 'Bitiruv marosimi', views: 50, eventDate: '2026-06-20' },
]
const APP_FACULTIES = { total: 9, faculties: [{ faculty: 'Pedagogika', count: 6 }, { faculty: 'Tarix', count: 3 }] }
const SORTINGHAT = { total: 7, faculties: [{ faculty: 'Informatika', count: 4 }, { faculty: 'Iqtisodiyot', count: 3 }] }

describe('Stats', () => {
  it('yuklanish paytida "Yuklanmoqda..." ko\'rsatadi', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    setup()
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()
  })

  it('kartalar to\'g\'ri qiymatlar bilan ko\'rsatiladi', async () => {
    mockApi({ 'GET /stats': { newsCount: 5, shortsCount: 8, eventsCount: 2, teachersCount: 10, appsCount: 3, vacancyApps: 1, galleryCount: 4 } })
    setup()
    expect(await screen.findByText('5')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('qiymat kelmagan maydonlar 0 ko\'rsatadi (nullish coalescing)', async () => {
    mockApi({ 'GET /stats': {} })
    setup()
    expect(await screen.findAllByText('0')).toHaveLength(7)
  })

  it('"Yangiliklar" va "Youtube shorts" alohida kartalar — har biri o\'z sonini ko\'rsatadi', async () => {
    mockApi({ 'GET /stats': { newsCount: 6, shortsCount: 13 } })
    setup()
    const news = (await screen.findByText('Yangiliklar')).closest('a')
    const shorts = screen.getByText('Youtube shorts').closest('a')
    expect(news).not.toBe(shorts)
    expect(news).toHaveTextContent('6')
    expect(shorts).toHaveTextContent('13')
    // ikkalasi ham admin yangiliklar sahifasiga olib boradi (Shorts o'sha yerda boshqariladi)
    expect(news).toHaveAttribute('href', '/admin/news')
    expect(shorts).toHaveAttribute('href', '/admin/news')
  })

  it('token bo\'lsa so\'rov Authorization header bilan yuboriladi', async () => {
    localStorage.setItem('kiu_token', 'tok')
    const { calls } = mockApi({ 'GET /stats': { newsCount: 1 } })
    setup()
    await screen.findByText('1')
    expect(calls[0].headers.Authorization).toBe('Bearer tok')
  })

  it('fetch xatosi (tarmoq) — xato xabari ko\'rsatiladi, abadiy yuklanmoqda holatida qolmaydi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    setup()
    expect(await screen.findByText(/xatolik yuz berdi/)).toBeInTheDocument()
    expect(screen.queryByText('Yuklanmoqda...')).not.toBeInTheDocument()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('kartalar to\'g\'ri sahifalarga havola qiladi', async () => {
    mockApi({ 'GET /stats': { newsCount: 1 } })
    setup()
    await screen.findByText('1')
    expect(screen.getByText('Vakansiya arizalari').closest('a')).toHaveAttribute('href', '/admin/vacancies')
    expect(screen.getByText('Qabul arizalari').closest('a')).toHaveAttribute('href', '/admin/applications')
    expect(screen.getByText('Galereya').closest('a')).toHaveAttribute('href', '/admin/gallery')
  })

  it('"Tezkor havolalar" bo\'limi endi ko\'rsatilmaydi', async () => {
    mockApi({ 'GET /stats': { newsCount: 1 } })
    setup()
    await screen.findByText('1')
    expect(screen.queryByText('Tezkor havolalar')).not.toBeInTheDocument()
    // Har bir karta nomi endi faqat bir marta chiqadi (tezkor havolalar bilan dublikat yo'q)
    expect(screen.getAllByText('Galereya')).toHaveLength(1)
    expect(screen.getAllByText('Qabul arizalari')).toHaveLength(1)
  })
})

// Band 6: admin statistika dashboard'iga qo'shilgan 4 ta yangi bo'lim
// (arizalar trendi, top-yangiliklar, top-tadbirlar, SortingHat fakultetlari).
describe('Stats — batafsil statistika (band 6)', () => {
  it('Arizalar trendi standart "kun" granularity bilan so\'raladi va grafik chiziladi', async () => {
    const { calls } = mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    setup()
    await screen.findByText('Arizalar trendi')
    await waitFor(() => expect(document.querySelectorAll('svg').length).toBeGreaterThan(0))
    expect(calls.some(c => c.path === '/stats/applications-trend?granularity=day')).toBe(true)
    // "Qabul arizalari" matni ham statistika kartasida, ham trend legendasida
    // chiqadi — shuning uchun getAllByText (>=2 ta kutiladi)
    expect(screen.getAllByText('Qabul arizalari').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Vakansiya arizalari').length).toBeGreaterThanOrEqual(2)
  })

  it('"Hafta" tugmasi bosilganda granularity=week bilan qayta so\'raladi', async () => {
    const { calls } = mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/applications-trend?granularity=week': TREND_WEEK,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    setup()
    await screen.findByText('Arizalar trendi')
    await waitFor(() => expect(calls.some(c => c.path === '/stats/applications-trend?granularity=day')).toBe(true))

    fireEvent.click(screen.getByRole('button', { name: "Haftalik ko'rinish" }))

    await waitFor(() => expect(calls.some(c => c.path === '/stats/applications-trend?granularity=week')).toBe(true))
    expect(screen.getByRole('button', { name: "Haftalik ko'rinish" })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: "Kunlik ko'rinish" })).toHaveAttribute('aria-pressed', 'false')
  })

  it('Eng ko\'p ko\'rilgan yangiliklar sarlavhalari ko\'rsatiladi', async () => {
    mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    setup()
    expect(await screen.findByText('Ochiq eshiklar kuni haqida')).toBeInTheDocument()
    expect(screen.getByText('Yangi fakultet ochildi')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('Eng ko\'p ko\'rilgan tadbirlar sarlavhalari ko\'rsatiladi', async () => {
    mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    setup()
    expect(await screen.findByText('Bitiruv marosimi')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('SortingHat fakultetlari reytingi va jami murojaatlar soni ko\'rsatiladi', async () => {
    mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    setup()
    expect(await screen.findByText('Informatika')).toBeInTheDocument()
    expect(screen.getByText('Iqtisodiyot')).toBeInTheDocument()
    expect(screen.getByText('Jami: 7 ta murojaat')).toBeInTheDocument()
  })

  it("SortingHat kartasi \"Sehrli shlyapa yo'nalish tavsiyalari\" deb nomlanadi", async () => {
    mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    setup()
    expect(await screen.findByText("Sehrli shlyapa yo'nalish tavsiyalari")).toBeInTheDocument()
  })

  it("Eng ko'p ariza tushgan yo'nalishlar kartasi reyting va jami arizalar sonini ko'rsatadi", async () => {
    localStorage.setItem('kiu_token', 'tok')
    const { calls } = mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    setup()
    expect(await screen.findByText("Eng ko'p ariza tushgan yo'nalishlar")).toBeInTheDocument()
    expect(await screen.findByText('Pedagogika')).toBeInTheDocument()
    expect(screen.getByText('Tarix')).toBeInTheDocument()
    expect(screen.getByText('Jami: 9 ta ariza')).toBeInTheDocument()
    // Admin endpoint — token bilan so'raladi
    const call = calls.find(c => c.path === '/stats/applications-faculties')
    expect(call?.headers.Authorization).toBe('Bearer tok')
  })

  it("4 ta ranked karta 2 ustunli setkada (2 qator x 2 ustun) joylashadi", async () => {
    mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    setup()
    const title = await screen.findByText("Eng ko'p ariza tushgan yo'nalishlar")
    // sarlavha -> karta -> setka. Bosqich 6b: ustunlar endi inline emas, `.adm-rank-grid` klassida
    // (jsdom stylesheet'ni hisoblamaydi) — shuning uchun klass va CSS qoidasi alohida tekshiriladi.
    const grid = title.closest('.adm-rank-grid')
    expect(grid).not.toBeNull()
    expect(grid.children).toHaveLength(4)
    const rule = readFileSync(resolve(process.cwd(), 'src/styles/admin.css'), 'utf8').match(/\.adm-rank-grid \{[^}]*\}/)?.[0] ?? ''
    expect(rule).toContain('display: grid')
    expect(rule).toContain('calc(50% - 8px)')
  })

  it("Ariza yo'nalishlari xato bersa faqat shu karta xato ko'rsatadi, qolganlari ishlaydi", async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn((url) => {
      const path = String(url).replace('http://api.test/api', '')
      if (path === '/stats/applications-faculties') return Promise.reject(new Error('net'))
      const body =
        path === '/stats' ? { newsCount: 1 } :
        path === '/stats/applications-trend?granularity=day' ? TREND_DAY :
        path === '/stats/top-news?limit=10' ? TOP_NEWS :
        path === '/stats/top-events?limit=10' ? TOP_EVENTS :
        path === '/stats/sortinghat-faculties' ? SORTINGHAT : {}
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
    }))
    setup()
    await screen.findByText('Informatika')
    expect(await screen.findByText('Yuklashda xatolik yuz berdi.')).toBeInTheDocument()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('bo\'lim ma\'lumoti bo\'sh bo\'lsa "Ma\'lumot yo\'q" ko\'rsatiladi', async () => {
    mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': { granularity: 'day', buckets: [] },
      'GET /stats/top-news?limit=10': [],
      'GET /stats/top-events?limit=10': [],
      'GET /stats/sortinghat-faculties': { total: 0, faculties: [] },
      'GET /stats/applications-faculties': { total: 0, faculties: [] },
    })
    setup()
    await screen.findByText('Arizalar trendi')
    // findAllByText birinchi topilgan zahoti qaytadi (trend darhol, RankedBarChart'lar esa
    // ParentSize'ning async ResizeObserver orqali kengligini olgach) — shu sababli barcha 5 ta
    // paydo bo'lishini waitFor bilan kutamiz, birinchi moslikda emas.
    await waitFor(() => expect(screen.getAllByText("Ma'lumot yo'q")).toHaveLength(5)) // trendi + 4 ranked karta
  })

  it("top-yangiliklar va top-tadbirlar 10 tadan (limit=10) so'raladi", async () => {
    const { calls } = mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    setup()
    await screen.findByText('Bitiruv marosimi')
    expect(calls.some(c => c.path === '/stats/top-news?limit=10')).toBe(true)
    expect(calls.some(c => c.path === '/stats/top-events?limit=10')).toBe(true)
  })

  it('bitta bo\'lim (top-news) xato bersa ham, qolgan bo\'limlar baribir ko\'rsatiladi', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn((url) => {
      const path = String(url).replace('http://api.test/api', '')
      if (path === '/stats/top-news?limit=10') return Promise.reject(new Error('net'))
      const body =
        path === '/stats' ? { newsCount: 1 } :
        path === '/stats/applications-trend?granularity=day' ? TREND_DAY :
        path === '/stats/top-events?limit=10' ? TOP_EVENTS :
        path === '/stats/sortinghat-faculties' ? SORTINGHAT : {}
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
    }))
    setup()
    await screen.findByText('Bitiruv marosimi') // top-events muvaffaqiyatli
    await screen.findByText('Informatika')       // sortingHat muvaffaqiyatli
    expect(await screen.findByText('Yuklashda xatolik yuz berdi.')).toBeInTheDocument() // faqat top-news xato
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it("KPI kartalari: har biri o'z `data-tone` rangida (4.4), qiymat matn rangida, inline stil yo'q", async () => {
    mockApi({
      'GET /stats': { newsCount: 5, shortsCount: 8, eventsCount: 2, teachersCount: 10, appsCount: 3, vacancyApps: 1, galleryCount: 4 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    const { container } = setup()
    await screen.findByText("Eng ko'p ariza tushgan yo'nalishlar")
    const tones = [...container.querySelectorAll('.adm-kpi')].map(k => [k.querySelector('.adm-kpi-label').textContent, k.dataset.tone])
    expect(tones).toEqual([
      ['Yangiliklar', 'blue'], ['Youtube shorts', 'orange'], ['Tadbirlar', 'emerald'], ["O'qituvchilar", 'indigo'],
      ['Qabul arizalari', 'amber'], ['Vakansiya arizalari', 'cyan'], ['Galereya', 'lime'],
    ])
    // Faqat grafik geometriyasi (`width/height`) inline qoladi; rang, joylashuv va hover — CSS da
    expect([...container.querySelectorAll('[style]')].filter(el => /color|background|border|display|flex|grid/.test(el.getAttribute('style')))).toHaveLength(0)
  })

  it("reyting grafiklari va trend o'z `--stat-*` rangida (4.4: Yangiliklar ko'k, Tadbirlar zumrad, Sehrli shlyapa binafsha, Qabul amber)", async () => {
    mockApi({
      'GET /stats': { newsCount: 1 },
      'GET /stats/applications-trend?granularity=day': TREND_DAY,
      'GET /stats/top-news?limit=10': TOP_NEWS,
      'GET /stats/top-events?limit=10': TOP_EVENTS,
      'GET /stats/sortinghat-faculties': SORTINGHAT,
      'GET /stats/applications-faculties': APP_FACULTIES,
    })
    const { container } = setup()
    await screen.findByText("Eng ko'p ariza tushgan yo'nalishlar")
    const titles = [...container.querySelectorAll('.adm-rank-grid .adm-card-title')].map(t => [t.textContent, t.dataset.tone])
    expect(titles).toEqual([
      ["Eng ko'p ko'rilgan yangiliklar", 'blue'], ["Eng ko'p ko'rilgan tadbirlar", 'emerald'],
      ["Sehrli shlyapa yo'nalish tavsiyalari", 'violet'], ["Eng ko'p ariza tushgan yo'nalishlar", 'amber'],
    ])
    // Trend legend dog'lari seriya ranglari bilan mos (oldin `--color-success`/`--color-brand-hover` edi — chiziqdan farq qilardi)
    expect([...container.querySelectorAll('.adm-legend-item')].map(i => [i.textContent, i.dataset.tone])).toEqual([['Qabul arizalari', 'amber'], ['Vakansiya arizalari', 'cyan']])
  })
})
