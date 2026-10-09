import { describe, it, expect, vi } from 'vitest'
import { render, screen, act, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import LocaleProvider from './LocaleProvider'
import uz from './locales/uz.json'
import ru from './locales/ru.json'
import i18n from './index'
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

const NOTE = 'Этот материал опубликован на узбекском языке.'
const at = (path, ui) => render(<MemoryRouter initialEntries={[path]}><LocaleProvider>{ui}</LocaleProvider></MemoryRouter>)
const okFetch = () => vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })))

function Loc() { return <div data-testid="loc">{useLocation().pathname}</div> }

describe('Statik sahifalar (RU)', () => {
  it('Achievements: sarlavha va mukofotlar ruscha', () => {
    at('/ru/achievements', <Achievements />)
    expect(screen.getByText('Достижения и награды')).toBeInTheDocument()
    expect(screen.getByText('Призёр конкурса «ПРИЗНАНИЕ ГОДА – 2023»')).toBeInTheDocument()
    expect(screen.queryByText('Yutuqlar va mukofotlar')).not.toBeInTheDocument()
  })

  it("Testimonials: sarlavha, yo'nalish nomi va kurs yorlig'i ruscha", () => {
    at('/ru/testimonials', <Testimonials />)
    expect(screen.getByText('Отзывы студентов')).toBeInTheDocument()
    expect(screen.getAllByText(/· \d-й курс/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Выпускник/)).toBeInTheDocument()
    expect(screen.queryByText(/-kurs/)).not.toBeInTheDocument()
  })

  it('Map: sarlavha ruscha, manzil ruscha', () => {
    at('/ru/map', <Map />)
    expect(screen.getByText('Карта кампуса')).toBeInTheDocument()
    expect(screen.getByText('Кампус 1')).toBeInTheDocument()
    expect(screen.getByText(ru.university.address1)).toBeInTheDocument()
    expect(screen.queryByText(/ko'chasi/)).not.toBeInTheDocument()
  })

  it("QRCode: sarlavha, tavsif va yo'riqnoma ruscha; havolalar o'zgarmagan", () => {
    at('/ru/qrcode', <QRCode />)
    expect(screen.getByText('QR-коды')).toBeInTheDocument()
    expect(screen.getByText('Официальный Telegram-канал')).toBeInTheDocument()
    expect(screen.getByText('Как пользоваться?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Перейти в Telegram' }).getAttribute('href')).toMatch(/^https:\/\//)
  })
})

describe("Bazadan keladigan sahifalar (RU): interfeys ruscha, kontent o'zbekcha", () => {
  it("Gallery: sarlavha va izoh ruscha, albom nomi o'zgarishsiz (lang=uz)", async () => {
    mockApi({ 'GET /gallery': [{ _id: 'a1', title: '1-kampus', desc: 'Kampus binosi', images: ['https://s/1.jpg'] }] })
    at('/ru/student-life', <Gallery />)
    expect(await screen.findByText('Студенческая жизнь')).toBeInTheDocument()
    expect(screen.getByText(NOTE)).toBeInTheDocument()
    expect(screen.getByText('Kampus binosi')).toHaveAttribute('lang', 'uz')
  })

  it("Gallery: bo'sh holat ruscha", async () => {
    mockApi({ 'GET /gallery': [] })
    at('/ru/student-life', <Gallery />)
    expect(await screen.findByText('Настоящие фотографии скоро появятся')).toBeInTheDocument()
  })

  it("Teachers: sarlavha, filtr, '1 человек' (birlik) va izoh; ism o'zgarishsiz", async () => {
    mockApi({ 'GET /teachers': [{ _id: 't1', name: 'Ali Valiyev', role: "O'qituvchi", dept: 'Aniq fanlar kafedrasi' }] })
    at('/ru/teachers', <Teachers />)
    expect(await screen.findByText('Ali Valiyev')).toBeInTheDocument()
    expect(screen.getByText('Ali Valiyev')).toHaveAttribute('lang', 'uz')
    expect(screen.getByText('Профессорско-преподавательский состав')).toBeInTheDocument()
    expect(screen.getByText('Все преподаватели')).toBeInTheDocument()
    await userEvent.setup().click(screen.getAllByText('Aniq fanlar kafedrasi')[0])
    expect(screen.getByText(/— 1 человек$/)).toBeInTheDocument()
    expect(screen.getByText(NOTE)).toBeInTheDocument()
  })

  it('Teachers: server xatosida ruscha banner', async () => {
    mockApi({ 'GET /teachers': { status: 500, body: {} } })
    at('/ru/teachers', <Teachers />)
    expect(await screen.findByText(/Не удалось подключиться к серверу/)).toBeInTheDocument()
  })

  it("Events: tur yorlig'i va sana ruscha (genitiv: '5 марта 2026'), sarlavha o'zbekcha", async () => {
    mockApi({ 'GET /events': [{ _id: 'e1', eventDate: '2026-03-05', title: 'Ochiq eshiklar', desc: 'Tanishuv kuni', type: 'open' }] })
    at('/ru/events', <Events />)
    expect(await screen.findByText('Ochiq eshiklar')).toHaveAttribute('lang', 'uz')
    expect(screen.getByText('Календарь мероприятий')).toBeInTheDocument()
    expect(screen.getByText('День открытых дверей')).toBeInTheDocument()
    expect(screen.getByText('мар')).toBeInTheDocument() // kartochkadagi qisqa oy nishonchasi
    expect(screen.getByText(NOTE)).toBeInTheDocument()
    expect(screen.queryByText('Ochiq kun')).not.toBeInTheDocument()
    expect(screen.queryByText(/Mart|mart$/)).not.toBeInTheDocument()
    // 6.11c3: to'liq sana (genitiv) endi kartada ham ko'rinadi; modal ochilganda ikkinchi nusxa paydo bo'ladi
    expect(screen.getAllByText('5 марта 2026')).toHaveLength(1)
    await userEvent.setup().click(screen.getByText('Ochiq eshiklar'))
    expect(await screen.findAllByText('5 марта 2026')).toHaveLength(2)
  })

  it("News: kategoriya ruscha, sarlavha lang=uz, izoh bor; batafsil tugmasi /ru/news/:id ga olib boradi", async () => {
    mockApi({ 'GET /news': [
      { _id: 'n1', title: 'Birinchi yangilik', category: 'umumiy', createdAt: '2026-01-05' },
      { _id: 'n2', title: 'Ikkinchi yangilik', category: "ta'lim", createdAt: '2026-01-02' },
    ] })
    const user = userEvent.setup()
    at('/ru/news', <><News /><Loc /></>)
    expect((await screen.findAllByText('Birinchi yangilik'))[0]).toHaveAttribute('lang', 'uz')
    expect(screen.getByText(NOTE)).toBeInTheDocument()
    expect(screen.getAllByText('Общие').length).toBeGreaterThan(0)
    expect(screen.queryByText('Yangiliklar')).not.toBeInTheDocument()
    await user.click(screen.getAllByText('Подробнее')[0])
    expect(screen.getByTestId('loc').textContent).toMatch(/^\/ru\/news\/n[12]$/)
  })
})

describe('Vacancies (RU)', () => {
  const goToForm = user => user.click(screen.getByRole('button', { name: 'Подать заявку' }))

  it('tablar ruscha; forma yorliqlari ruscha', async () => {
    const user = userEvent.setup()
    at('/ru/vacancies', <Vacancies />)
    expect(screen.getByText('Присоединяйтесь к нашей команде!')).toBeInTheDocument()
    expect(screen.getByText('Почему KIU?')).toBeInTheDocument()
    await goToForm(user)
    expect(screen.getByText('Анкета для трудоустройства')).toBeInTheDocument()
    expect(screen.queryByText('Nima uchun KIU?')).not.toBeInTheDocument()
  })

  it("bo'sh forma — xatolar ruscha, so'rov yuborilmaydi", async () => {
    okFetch()
    const user = userEvent.setup()
    at('/ru/vacancies', <Vacancies />)
    await goToForm(user)
    await user.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(screen.queryByText('Tanlang')).not.toBeInTheDocument()
    expect(screen.getAllByText('Выберите').length).toBe(4)
    expect(screen.getAllByText('Это поле обязательно')).toHaveLength(2)
    expect(screen.getByText('Поле «Должность» обязательно')).toBeInTheDocument()
    expect(screen.getByText('Поле «Опыт работы» обязательно')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("ruscha tanlovlar ko'rinadi, lekin backend'ga O'ZBEKCHA qiymat yuboriladi", async () => {
    okFetch()
    const user = userEvent.setup()
    at('/ru/vacancies', <Vacancies />)
    await goToForm(user)
    await user.type(screen.getByPlaceholderText('Фамилия Имя Отчество'), 'Ali Valiyev')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '+998 90 123 45 67')
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'Преподаватель')
    await user.selectOptions(selects[1], 'Кафедра точных наук')
    await user.selectOptions(selects[2], 'Магистр')
    await user.selectOptions(selects[3], '1–3 года')
    await user.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByText('Ваша заявка принята!')).toBeInTheDocument()
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body).toMatchObject({ position: "O'qituvchi", faculty: 'Aniq fanlar kafedrasi', education: 'Magistr', experience: '1–3 yil' })
  })
})

describe('SortingHat (RU)', () => {
  const startRu = async user => {
    at('/ru/sorting-hat', <SortingHat />)
    await user.click(screen.getByRole('button', { name: /Начать тест/ }))
    await user.type(screen.getByPlaceholderText(/Али Валиев/), 'Ali Valiyev')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '+998 90 123 45 67')
    await user.click(screen.getByRole('button', { name: /Начать тест/ }))
  }

  it('hero va intro ruscha; "Страница приёма" havolasi /ru prefiksli', () => {
    at('/ru/sorting-hat', <SortingHat />)
    expect(screen.getByText('Какое направление подходит именно вам?')).toBeInTheDocument()
    expect(screen.getByText(`Вопросов: ${QUESTIONS.length}`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Страница приёма/ })).toHaveAttribute('href', '/ru/admission')
    expect(screen.queryByText(/savol/i)).not.toBeInTheDocument()
  })

  it('register: xatolar ruscha', async () => {
    const user = userEvent.setup()
    at('/ru/sorting-hat', <SortingHat />)
    await user.click(screen.getByRole('button', { name: /Начать тест/ }))
    await user.type(screen.getByPlaceholderText(/Али Валиев/), 'Ali')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '12')
    await user.click(screen.getByRole('button', { name: /Начать тест/ }))
    expect(screen.getByText('Введите имя и фамилию полностью')).toBeInTheDocument()
    expect(screen.getByText(/Неверный номер телефона/)).toBeInTheDocument()
  })

  it("to'liq oqim: savollar va natija ruscha, lekin backend'ga o'zbekcha yo'nalish nomlari ketadi", async () => {
    okFetch()
    const user = userEvent.setup()
    await startRu(user)
    expect(screen.getByText(new RegExp(`Вопрос 1 / ${QUESTIONS.length}`))).toBeInTheDocument()
    expect(screen.getByText(ru.sortingHat.questions[QUESTIONS[0].id].q)).toBeInTheDocument()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      for (let i = 0; i < QUESTIONS.length; i++) {
        fireEvent.click(screen.getByText(ru.sortingHat.questions[QUESTIONS[i].id].opts.a))
        await act(async () => { await vi.advanceTimersByTimeAsync(500) })
      }
      expect(screen.getByText('Анализ готов!')).toBeInTheDocument()
    } finally { vi.useRealTimers() }

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.faculties).toHaveLength(3)
    body.faculties.forEach(n => expect(Object.values(FACULTIES).map(f => f.name)).toContain(n))
    const key = Object.keys(FACULTIES).find(k => FACULTIES[k].name === body.faculties[0])
    expect(screen.getByText(ru.sortingHat.faculties[key].name, { selector: 'h3' })).toBeInTheDocument()
    expect(screen.queryByText(body.faculties[0], { selector: 'h3' })).not.toBeInTheDocument()
    expect(screen.getByText('Первая рекомендация')).toBeInTheDocument()
    expect(screen.getByText('Лучшее совпадение')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Посмотреть направления/ })).toHaveAttribute('href', '/ru/faculty')
    expect(screen.getByRole('link', { name: /Подать заявку/ })).toHaveAttribute('href', '/ru/admission')
  })
})

describe('Search (RU)', () => {
  it("sarlavha/kategoriya bo'yicha ruscha qidiradi, natija /ru ga olib boradi", async () => {
    const user = userEvent.setup()
    at('/ru', <><Search /><Loc /></>)
    await user.click(screen.getByLabelText('Поиск'))
    const input = screen.getByPlaceholderText(/Поиск\.\.\./)
    expect(screen.getByText('Быстрые ссылки')).toBeInTheDocument()
    await user.type(input, 'hemis')
    expect(screen.getByText('Найден 1 результат')).toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'приём')
    expect(screen.getByText(/^Найдено? \d+ результат/)).toBeInTheDocument()
    expect(screen.getByText('Гранты и стипендии')).toBeInTheDocument()
    await user.click(screen.getByText('Подача документов'))
    expect(screen.getByTestId('loc')).toHaveTextContent('/ru/admission')
  })

  it("o'zbekcha so'z RU qidiruvda topilmaydi (til bo'yicha ajratilgan); bo'sh natija xabari ruscha", async () => {
    const user = userEvent.setup()
    at('/ru', <Search />)
    await user.click(screen.getByLabelText('Поиск'))
    await user.type(screen.getByPlaceholderText(/Поиск\.\.\./), 'yangiliklar')
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
    expect(screen.getByText('По запросу «yangiliklar» ничего не найдено')).toBeInTheDocument()
  })
})

describe('ApplyModal (RU)', () => {
  it("yorliqlar va xatolar ruscha; yo'nalish ruscha ko'rinadi, backend'ga o'zbekcha nom ketadi", async () => {
    okFetch()
    const user = userEvent.setup()
    at('/ru', <ApplyModal onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Подать заявку' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Отправить' }))
    expect(screen.getAllByText('Это поле обязательно')).toHaveLength(2)
    expect(fetch).not.toHaveBeenCalled()

    await user.type(screen.getByPlaceholderText('Имя Фамилия'), 'Ali Valiyev')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '+998 90 123 45 67')
    await user.selectOptions(screen.getByRole('combobox'), 'Экономика')
    await user.click(screen.getByRole('button', { name: 'Отправить' }))
    expect(await screen.findByText('Заявка отправлена!')).toBeInTheDocument()
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ faculty: 'Iqtisodiyot', type: 'admission' })
  })

  it("DRIFT: ro'yxatda ko'rinadigan matn ruscha, qiymat (backend) esa uz.json bilan bir xil o'zbekcha", () => {
    at('/ru', <ApplyModal onClose={() => {}} />)
    const opts = within(screen.getByRole('combobox')).getAllByRole('option').filter(o => o.value)
    expect(opts.map(o => o.textContent)).toEqual(Object.values(ru.applyModal.programs))
    expect(opts.map(o => o.value)).toEqual(Object.values(uz.applyModal.programs))
  })
})

describe("Ko'plik shakllari (RU): _one/_few/_many/_other", () => {
  const t = i18n.getFixedT('ru')
  const cases = {
    'search.found': { 1: 'Найден 1 результат', 2: 'Найдено 2 результата', 5: 'Найдено 5 результатов', 11: 'Найдено 11 результатов', 21: 'Найден 21 результат', 24: 'Найдено 24 результата' },
    'news.views': { 1: '1 просмотр', 3: '3 просмотра', 5: '5 просмотров', 12: '12 просмотров', 101: '101 просмотр' },
    'teachers.count': { 1: '1 человек', 2: '2 человека', 5: '5 человек', 11: '11 человек', 22: '22 человека' },
  }
  for (const [key, table] of Object.entries(cases)) {
    it(key, () => {
      for (const [n, expected] of Object.entries(table)) expect(t(key, { count: Number(n) }), `${key}(${n})`).toBe(expected)
    })
  }
})

describe('Drift guard: Stage 3 ruscha tarjimalari', () => {
  const PLURAL = /_(zero|one|two|few|many|other)$/
  const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]])
  const bases = ns => [...new Set(flat(ns).map(([k]) => k.replace(PLURAL, '')))]

  it("sortingHat / search / applyModal / vacancies / events / news kalitlari uz bilan bir xil, ruscha bo'sh emas", () => {
    for (const ns of ['sortingHat', 'search', 'applyModal', 'vacancies', 'events', 'news']) {
      expect(bases(ru[ns]), ns).toEqual(bases(uz[ns]))
      flat(ru[ns]).forEach(([k, v]) => expect(String(v).trim(), `${ns}.${k}`).not.toBe(''))
    }
  })

  it("ruscha sortingHat/search/applyModal matnlarida o'zbekcha qoldiq yo'q", () => {
    const txt = JSON.stringify([ru.sortingHat, ru.search, ru.applyModal])
    expect(txt).not.toMatch(/yo'nalish|ta'lim|savol|Qabul|bog'lan|ariza/i)
  })

  it("oy nomlari (genitiv) 12 ta, qisqa nomlar 12 ta", () => {
    expect(ru.events.months).toHaveLength(12)
    expect(ru.events.monthsShort).toHaveLength(12)
    expect(ru.events.months[4]).toBe('мая')
  })

  it("SortingHat: yo'nalish nomi (backend) uz.json bilan mos", () => {
    for (const [k, f] of Object.entries(FACULTIES)) expect(uz.sortingHat.faculties[k].name).toBe(f.name)
  })
})