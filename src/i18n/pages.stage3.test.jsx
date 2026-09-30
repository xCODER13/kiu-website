import { describe, it, expect, vi } from 'vitest'
import { render, screen, act, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import LocaleProvider from './LocaleProvider'
import uz from './locales/uz.json'
import en from './locales/en.json'
import { mockApi } from '../test/helpers'
import Achievements from '../pages/Achievements'
import Testimonials from '../pages/Testimonials'
import Map from '../pages/Map'
import QRCode from '../pages/QRCode'
import Gallery from '../pages/Gallery'
import Teachers from '../pages/Teachers'
import Events from '../pages/Events'
import Vacancies from '../pages/Vacancies'
import News from '../pages/News'
import SortingHat from '../pages/SortingHat'
import Search from '../components/Search'
import ApplyModal from '../components/ApplyModal'
import { QUESTIONS, FACULTIES } from '../pages/sortinghat/Data'

const NOTE = 'This content is published in Uzbek.'
const at = (path, ui) => render(<MemoryRouter initialEntries={[path]}><LocaleProvider>{ui}</LocaleProvider></MemoryRouter>)
const okFetch = () => vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })))

function Loc() { return <div data-testid="loc">{useLocation().pathname}</div> }

describe('Statik sahifalar (EN)', () => {
  it('Achievements: sarlavha va mukofotlar inglizcha', () => {
    at('/en/achievements', <Achievements />)
    expect(screen.getByText('Achievements and awards')).toBeInTheDocument()
    expect(screen.getByText('Prize Winner of the "Recognition of the Year – 2023" Contest')).toBeInTheDocument()
    expect(screen.queryByText('Yutuqlar va mukofotlar')).not.toBeInTheDocument()
  })

  it('Testimonials: sarlavha, yo\'nalish nomi va kurs yorlig\'i inglizcha', () => {
    at('/en/testimonials', <Testimonials />)
    expect(screen.getByText('Student reviews')).toBeInTheDocument()
    expect(screen.getAllByText(/· Year \d/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/-kurs/)).not.toBeInTheDocument()
  })

  it('Map: sarlavha inglizcha', () => {
    at('/en/map', <Map />)
    expect(screen.getByText('Campus map')).toBeInTheDocument()
    expect(screen.getByText('Campus 1')).toBeInTheDocument()
    expect(screen.getByText(en.university.address1)).toBeInTheDocument()
    expect(screen.queryByText(/ko'chasi/)).not.toBeInTheDocument()
  })

  it('QRCode: sarlavha, tavsif va yo\'riqnoma inglizcha; havolalar o\'zgarmagan', () => {
    at('/en/qrcode', <QRCode />)
    expect(screen.getByText('QR codes')).toBeInTheDocument()
    expect(screen.getByText('Official Telegram channel')).toBeInTheDocument()
    expect(screen.getByText('How to use')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to Telegram' }).getAttribute('href')).toMatch(/^https:\/\//)
  })
})

describe('Bazadan keladigan sahifalar (EN): interfeys inglizcha, kontent o\'zbekcha', () => {
  it('Gallery: sarlavha va izoh inglizcha, albom nomi o\'zgarishsiz (lang=uz)', async () => {
    mockApi({ 'GET /gallery': [{ _id: 'a1', title: '1-kampus', desc: 'Kampus binosi', images: ['https://s/1.jpg'] }] })
    at('/en/gallery', <Gallery />)
    expect(await screen.findByText('Photo gallery')).toBeInTheDocument()
    expect(screen.getByText(NOTE)).toBeInTheDocument()
    expect(screen.getByText('Kampus binosi')).toHaveAttribute('lang', 'uz')
    expect(screen.queryByText('Yuklanmoqda...')).not.toBeInTheDocument()
  })

  it('Gallery: bo\'sh holat inglizcha', async () => {
    mockApi({ 'GET /gallery': [] })
    at('/en/gallery', <Gallery />)
    expect(await screen.findByText('Real photos will be added soon')).toBeInTheDocument()
  })

  it('Teachers: sarlavha, filtr, "1 person" (birlik) va izoh; ism o\'zgarishsiz', async () => {
    mockApi({ 'GET /teachers': [{ _id: 't1', name: 'Ali Valiyev', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi' }] })
    at('/en/teachers', <Teachers />)
    expect(await screen.findByText('Ali Valiyev')).toBeInTheDocument()
    expect(screen.getByText('Ali Valiyev')).toHaveAttribute('lang', 'uz')
    expect(screen.getByText('Professor and Teachers')).toBeInTheDocument()
    expect(screen.getByText('All teachers')).toBeInTheDocument()
    await userEvent.setup().click(screen.getAllByText('Aniq fanlar kafedrasi')[0])
    expect(screen.getByText(/— 1 person/)).toBeInTheDocument()
    expect(screen.getByText(NOTE)).toBeInTheDocument()
  })

  it('Teachers: server xatosida inglizcha banner', async () => {
    mockApi({ 'GET /teachers': { status: 500, body: {} } })
    at('/en/teachers', <Teachers />)
    expect(await screen.findByText(/showing saved data/)).toBeInTheDocument()
  })

  it('Events: tur yorlig\'i va sana inglizcha, sarlavha o\'zbekcha', async () => {
    mockApi({ 'GET /events': [{ _id: 'e1', eventDate: '2026-03-05', title: 'Ochiq eshiklar', desc: 'Tanishuv kuni', type: 'open' }] })
    at('/en/events', <Events />)
    expect(await screen.findByText('Ochiq eshiklar')).toHaveAttribute('lang', 'uz')
    expect(screen.getByText('Events calendar')).toBeInTheDocument()
    expect(screen.getByText('Open day')).toBeInTheDocument()
    expect(screen.getByText(NOTE)).toBeInTheDocument()
    expect(screen.queryByText('Ochiq kun')).not.toBeInTheDocument()
    expect(screen.queryByText(/Mart|mart/)).not.toBeInTheDocument()
  })

  it("News: kategoriya inglizcha, sarlavha lang=uz, izoh bor; batafsil tugmasi /en/news/:id ga olib boradi", async () => {
    mockApi({ 'GET /news': [
      { _id: 'n1', title: 'Birinchi yangilik', category: 'umumiy', createdAt: '2026-01-05' },
      { _id: 'n2', title: 'Ikkinchi yangilik', category: "ta'lim", createdAt: '2026-01-02' },
    ] })
    const user = userEvent.setup()
    at('/en/news', <><News /><Loc /></>)
    expect((await screen.findAllByText('Birinchi yangilik'))[0]).toHaveAttribute('lang', 'uz')
    expect(screen.getByText(NOTE)).toBeInTheDocument()
    expect(screen.getAllByText('General').length).toBeGreaterThan(0)
    expect(screen.queryByText('Yangiliklar')).not.toBeInTheDocument()
    await user.click(screen.getAllByText('Read more →')[0])
    expect(screen.getByTestId('loc').textContent).toMatch(/^\/en\/news\/n[12]$/)
  })
})

describe('Vacancies (EN)', () => {
  const goToForm = user => user.click(screen.getByRole('button', { name: 'Apply' }))

  it('tablar inglizcha; forma yorliqlari inglizcha', async () => {
    const user = userEvent.setup()
    at('/en/vacancies', <Vacancies />)
    expect(screen.getByText('Join our team!')).toBeInTheDocument()
    expect(screen.getByText('Why KIU?')).toBeInTheDocument()
    await goToForm(user)
    expect(screen.getByText('Job application form')).toBeInTheDocument()
    expect(screen.queryByText('Nima uchun KIU?')).not.toBeInTheDocument()
  })

  it('bo\'sh forma — xatolar inglizcha, so\'rov yuborilmaydi', async () => {
    okFetch()
    const user = userEvent.setup()
    at('/en/vacancies', <Vacancies />)
    await goToForm(user)
    await user.click(screen.getByRole('button', { name: 'Submit application' }))
    expect(screen.queryByText('Tanlang')).not.toBeInTheDocument()
    expect(screen.getAllByText('Select').length).toBe(4)
    expect(screen.getAllByText('This field is required')).toHaveLength(2)
    expect(screen.getByText('Position is required')).toBeInTheDocument()
    expect(screen.getByText('Work experience is required')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('inglizcha tanlovlar ko\'rinadi, lekin backend\'ga O\'ZBEKCHA qiymat yuboriladi', async () => {
    okFetch()
    const user = userEvent.setup()
    at('/en/vacancies', <Vacancies />)
    await goToForm(user)
    await user.type(screen.getByPlaceholderText('Last name, first name, patronymic'), 'Ali Valiyev')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '+998 90 123 45 67')
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'Teacher')
    await user.selectOptions(selects[1], 'Department of Exact Sciences')
    await user.selectOptions(selects[2], "Master's")
    await user.selectOptions(selects[3], '1–3 years')
    await user.click(screen.getByRole('button', { name: 'Submit application' }))
    expect(await screen.findByText('Your application has been received!')).toBeInTheDocument()
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body).toMatchObject({ position: "O'qituvchi", faculty: 'Aniq fanlar kafedrasi', education: 'Magistr', experience: '1–3 yil' })
  })
})

describe('SortingHat (EN)', () => {
  const startEn = async user => {
    at('/en/sorting-hat', <SortingHat />)
    await user.click(screen.getByRole('button', { name: /Start the test/ }))
    await user.type(screen.getByPlaceholderText(/Ali Valiyev/), 'Ali Valiyev')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '+998 90 123 45 67')
    await user.click(screen.getByRole('button', { name: /Start the test/ }))
  }

  it('hero va intro inglizcha; "Qabul sahifasi" havolasi /en prefiksli', () => {
    at('/en/sorting-hat', <SortingHat />)
    expect(screen.getByText('Which program is right for you?')).toBeInTheDocument()
    expect(screen.getByText(`${QUESTIONS.length} questions`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Admission page/ })).toHaveAttribute('href', '/en/admission')
    expect(screen.queryByText(/savol/i)).not.toBeInTheDocument()
  })

  it('register: xatolar inglizcha', async () => {
    const user = userEvent.setup()
    at('/en/sorting-hat', <SortingHat />)
    await user.click(screen.getByRole('button', { name: /Start the test/ }))
    await user.type(screen.getByPlaceholderText(/Ali Valiyev/), 'Ali')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '12')
    await user.click(screen.getByRole('button', { name: /Start the test/ }))
    expect(screen.getByText('Enter your first and last name in full')).toBeInTheDocument()
    expect(screen.getByText(/Invalid phone number/)).toBeInTheDocument()
  })

  it('to\'liq oqim: savollar va natija inglizcha, lekin backend\'ga o\'zbekcha yo\'nalish nomlari ketadi', async () => {
    okFetch()
    const user = userEvent.setup()
    await startEn(user)
    expect(screen.getByText(new RegExp(`Question 1 / ${QUESTIONS.length}`))).toBeInTheDocument()
    expect(screen.getByText(en.sortingHat.questions[QUESTIONS[0].id].q)).toBeInTheDocument()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      for (let i = 0; i < QUESTIONS.length; i++) {
        fireEvent.click(screen.getByText(en.sortingHat.questions[QUESTIONS[i].id].opts.a))
        await act(async () => { await vi.advanceTimersByTimeAsync(500) })
      }
      expect(screen.getByText('Analysis complete!')).toBeInTheDocument()
    } finally { vi.useRealTimers() }

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.faculties).toHaveLength(3)
    body.faculties.forEach(n => expect(Object.values(FACULTIES).map(f => f.name)).toContain(n))
    // ko'rsatilgan nom inglizcha, backend nomi o'zbekcha
    const key = Object.keys(FACULTIES).find(k => FACULTIES[k].name === body.faculties[0])
    expect(screen.getByText(en.sortingHat.faculties[key].name, { selector: 'h3' })).toBeInTheDocument()
    expect(screen.queryByText(body.faculties[0], { selector: 'h3' })).not.toBeInTheDocument()
    expect(screen.getByText('First recommendation')).toBeInTheDocument()
    expect(screen.getByText('Best match')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View programs/ })).toHaveAttribute('href', '/en/faculty')
    expect(screen.getByRole('link', { name: /Apply now/ })).toHaveAttribute('href', '/en/admission')
  })
})

describe('Search (EN)', () => {
  it('sarlavha/kategoriya inglizcha bo\'yicha qidiradi, son birlik/ko\'plik, natija /en ga olib boradi', async () => {
    const user = userEvent.setup()
    at('/en', <><Search /><Loc /></>)
    await user.click(screen.getByLabelText('Search'))
    const input = screen.getByPlaceholderText(/Search\.\.\./)
    expect(screen.getByText('Quick links')).toBeInTheDocument()
    await user.type(input, 'admission')
    expect(screen.getByText('4 results found')).toBeInTheDocument()
    expect(screen.getByText('Grants and scholarships')).toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'hemis')
    expect(screen.getByText('1 result found')).toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'admission')
    await user.click(screen.getByText('Document submission'))
    expect(screen.getByTestId('loc')).toHaveTextContent('/en/admission')
  })

  it('o\'zbekcha so\'z EN qidiruvda topilmaydi (til bo\'yicha ajratilgan); bo\'sh natija xabari inglizcha', async () => {
    const user = userEvent.setup()
    at('/en', <Search />)
    await user.click(screen.getByLabelText('Search'))
    await user.type(screen.getByPlaceholderText(/Search\.\.\./), 'yangiliklar')
    expect(screen.getByText('Nothing found')).toBeInTheDocument()
    expect(screen.getByText('No results for "yangiliklar"')).toBeInTheDocument()
  })
})

describe('ApplyModal (EN)', () => {
  it('yorliqlar va xatolar inglizcha; yo\'nalish inglizcha ko\'rinadi, backend\'ga o\'zbekcha nom ketadi', async () => {
    okFetch()
    const user = userEvent.setup()
    at('/en', <ApplyModal onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Apply now' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(screen.getAllByText('This field is required')).toHaveLength(2)
    expect(fetch).not.toHaveBeenCalled()

    await user.type(screen.getByPlaceholderText('First and last name'), 'Ali Valiyev')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '+998 90 123 45 67')
    await user.selectOptions(screen.getByRole('combobox'), 'Economics')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByText('Application submitted!')).toBeInTheDocument()
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ faculty: 'Iqtisodiyot', type: 'admission' })
  })

  it('DRIFT: o\'zbekcha holatda har bir variantning qiymati (backend) ko\'rinadigan matn bilan bir xil', () => {
    at('/', <ApplyModal onClose={() => {}} />)
    const opts = within(screen.getByRole('combobox')).getAllByRole('option').filter(o => o.value)
    expect(opts.length).toBe(Object.keys(uz.applyModal.programs).length)
    opts.forEach(o => expect(o.value).toBe(o.textContent))
  })
})

describe('Drift guard: Stage 3 tarjimalari', () => {
  const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]])

  it('sortingHat / search / applyModal kalitlari ikkala tilda bir xil, inglizchasi bo\'sh emas', () => {
    for (const ns of ['sortingHat', 'search', 'applyModal']) {
      const u = flat(uz[ns]), e = flat(en[ns])
      expect(e.map(x => x[0]), ns).toEqual(u.map(x => x[0]))
      e.forEach(([k, v]) => expect(String(v).trim(), `${ns}.${k}`).not.toBe(''))
    }
  })

  it('inglizcha sortingHat/search/applyModal matnlarida o\'zbekcha qoldiq yo\'q', () => {
    const txt = JSON.stringify([en.sortingHat, en.search, en.applyModal])
    expect(txt).not.toMatch(/yo'nalish|ta'lim|savol|Qabul|bog'lan|ariza/i)
  })

  it('SEARCH: har bir element va kategoriya ikkala tilda mavjud', () => {
    expect(Object.keys(en.search.items).length).toBeGreaterThan(30)
    expect(Object.keys(en.search.categories)).toEqual(Object.keys(uz.search.categories))
  })

  it('SortingHat: yo\'nalish nomi (backend) uz.json bilan mos', () => {
    for (const [k, f] of Object.entries(FACULTIES)) expect(uz.sortingHat.faculties[k].name).toBe(f.name)
  })
})
