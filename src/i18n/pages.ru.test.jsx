import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LocaleProvider from './LocaleProvider'
import i18n from './index'
import uz from './locales/uz.json'
import ru from './locales/ru.json'
import config from '../config'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Home from '../pages/Home'
import Admission from '../pages/Admission'
import Faculty from '../pages/Faculty'
import FAQ from '../pages/FAQ'
import About from '../pages/About'
import International from '../pages/International'
import Contact from '../pages/Contact'
import Hemis from '../pages/Hemis'
import Documents from '../pages/Documents'
import TelegramPanel from '../components/TelegramPanel'
import { BAKALAVR, MAGISTRATURA } from '../pages/faculty/data'
import { mockApi } from '../test/helpers'

vi.mock('../components/Search', () => ({ default: () => null }))

const N1 = { _id: 'n1', title: 'Birinchi yangilik', category: 'umumiy', createdAt: '2026-01-05' }
const N2 = { _id: 'n2', title: 'Ikkinchi yangilik', category: "ta'lim", createdAt: '2026-01-02' }

const at = (path, ui) => render(<MemoryRouter initialEntries={[path]}><LocaleProvider>{ui}</LocaleProvider></MemoryRouter>)
// NBSP (U+00A0) ni oddiy bo'shliqqa almashtirib taqqoslaymiz
const norm = s => s.replace(/\u00a0/g, ' ')

describe('Navbar (RU)', () => {
  const props = { dark: false, setDark: () => {}, onApply: () => {} }

  it('brend, havolalar va tugmalar ruscha; havolalar /ru prefiksli; o\'zbekcha matn yo\'q', () => {
    at('/ru/faculty', <Navbar {...props} />)
    expect(screen.getByText('Каршинский международный университет')).toBeInTheDocument()
    expect(screen.getByText(`${config.university.website} — Официальный сайт`)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Направления' })[0]).toHaveAttribute('href', '/ru/faculty')
    expect(screen.getAllByRole('link', { name: 'Приём' })[0]).toHaveAttribute('href', '/ru/admission')
    expect(screen.getAllByRole('button', { name: 'Подать заявку' }).length).toBeGreaterThan(0)
    expect(screen.queryByText('Ariza topshirish')).not.toBeInTheDocument()
  })

  it('logotip /ru ga olib boradi', () => {
    at('/ru/faculty', <Navbar {...props} />)
    expect(screen.getAllByRole('link').find(a => a.querySelector('svg[role="img"]'))).toHaveAttribute('href', '/ru')
  })

  it("til almashtirgich: RU'da UZ va EN havolalari to'g'ri (UZ prefikssiz, EN /en)", () => {
    at('/ru/faculty', <Navbar {...props} />)
    screen.getAllByRole('link', { name: "O'zbekcha" }).forEach(a => expect(a).toHaveAttribute('href', '/faculty'))
    screen.getAllByRole('link', { name: 'English' }).forEach(a => expect(a).toHaveAttribute('href', '/en/faculty'))
  })
})

describe('Footer (RU)', () => {
  it("matnlar ruscha, havolalar /ru prefiksli, aloqa ma'lumotlari va ijtimoiy tarmoqlar o'zgarishsiz", () => {
    at('/ru', <Footer />)
    expect(screen.getByText('Каршинский международный университет')).toBeInTheDocument()
    expect(screen.getByText(/Качественное образование в Кашкадарьинской области с 2022 года/)).toBeInTheDocument()
    expect(screen.getByText('Пн–Сб: 09:00–20:00')).toBeInTheDocument()
    expect(screen.getByText('© 2026 Каршинский международный университет. Все права защищены.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Подбор направления' })).toHaveAttribute('href', '/ru/sorting-hat')
    expect(screen.getByRole('link', { name: 'Фотогалерея' })).toHaveAttribute('href', '/ru/gallery')
    expect(screen.getByText(config.contact.phone)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Telegram' })).toHaveAttribute('href', config.social.telegram)
  })
})

describe('Home (RU)', () => {
  it('hero, "haqida" bo\'limi va statistika yorliqlari ruscha', () => {
    mockApi({ 'GET /news': [] })
    at('/ru', <Home />)
    expect(screen.getByRole('heading', { level: 1, name: 'Каршинский международный университет' })).toBeInTheDocument()
    expect(screen.getByText('Приём 2026–2027 открыт')).toBeInTheDocument()
    expect(screen.getByText('О Каршинском международном университете')).toBeInTheDocument()
    for (const label of ['Студентов', 'Преподавателей', 'Направлений', 'Год основания']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('link', { name: 'Подробнее' })).toHaveAttribute('href', '/ru/about')
    expect(screen.getByRole('link', { name: 'О приёме' })).toHaveAttribute('href', '/ru/admission')
    expect(screen.queryByText('Qabul haqida')).not.toBeInTheDocument()
  })

  it("yangiliklar: bo'lim ruscha, sarlavhalar o'zbekcha (lang=uz) va izoh bor, sana ru-RU, havolalar /ru/news/:id", async () => {
    mockApi({ 'GET /news': [N1, N2] })
    at('/ru', <Home />)
    expect(await screen.findByText('Последние новости')).toBeInTheDocument()
    expect(screen.getByText('Этот материал опубликован на узбекском языке.')).toBeInTheDocument()
    expect(screen.getAllByText('Birinchi yangilik')[0]).toHaveAttribute('lang', 'uz')
    expect(screen.getByText('02.01.2026')).toBeInTheDocument()
    const detailLinks = screen.getAllByRole('link').filter(a => a.getAttribute('href')?.includes('/news/'))
    expect(detailLinks.length).toBeGreaterThan(0)
    detailLinks.forEach(a => expect(a.getAttribute('href')).toMatch(/^\/ru\/news\/n[12]$/))
  })

  it("xato va bo'sh holat xabarlari ruscha", async () => {
    mockApi({ 'GET /news': { status: 500, body: {} } })
    const { unmount } = at('/ru', <Home />)
    expect(await screen.findByText('Не удалось подключиться к серверу новостей.')).toBeInTheDocument()
    unmount()
    mockApi({ 'GET /news': [] })
    at('/ru', <Home />)
    expect(await screen.findByText('Новостей пока нет.')).toBeInTheDocument()
  })
})

describe('Admission (RU)', () => {
  it('sarlavha, bosqichlar, muddat ruscha; tugma ishlaydi; havola /ru prefiksli', async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()
    at('/ru/admission', <Admission onApply={onApply} />)
    expect(screen.getByText('Порядок подачи документов и условия поступления')).toBeInTheDocument()
    for (const n of [1, 2, 3, 4]) expect(screen.getByText(`Шаг ${n}`)).toBeInTheDocument()
    expect(screen.getByText(/Срок: с 1 июля по 20 августа 2026 года/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Подать заявку/ }))
    expect(onApply).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('link', { name: /Подобрать направление/ })).toHaveAttribute('href', '/ru/sorting-hat')
    expect(screen.queryByText(/qadam/)).not.toBeInTheDocument()
  })
})

describe('Faculty (RU)', () => {
  it("kartalar, narx (NBSP ajratgich, 'сум') va muddat (ko'plik) ruscha; o'zbekcha nom yo'q", () => {
    at('/ru/faculty', <Faculty />)
    expect(screen.getByText('Дошкольное образование')).toBeInTheDocument()
    // testing-library bo'shliqlarni normallashtiradi, shuning uchun NBSP'ni textContent orqali alohida tekshiramiz
    const prices = screen.getAllByText(/12 850 000 сум\/год/)
    expect(prices.length).toBeGreaterThan(0)
    expect(prices[0].textContent).toBe('12\u00a0850\u00a0000\u00a0сум/год') // qator ichida uzilib ketmasin
    expect(norm(prices[0].textContent)).toBe('12 850 000 сум/год')
    expect(screen.getAllByText('4 года').length).toBeGreaterThan(0)
    expect(screen.queryByText("Maktabgacha ta'lim")).not.toBeInTheDocument()
    expect(screen.queryByText(/so'm/)).not.toBeInTheDocument()
  })

  it("Magistratura tabi va modal: matn, fanlar, kasblar ruscha; Escape yopadi", async () => {
    const user = userEvent.setup()
    at('/ru/faculty', <Faculty />)
    await user.click(screen.getByRole('button', { name: /Магистратура/ }))
    expect(screen.queryByText('Дошкольное образование')).not.toBeInTheDocument()
    expect(screen.getAllByText('2 года').length).toBeGreaterThan(0)
    const firstTitle = ru.faculty.programs[MAGISTRATURA[0].id].name
    await user.click(screen.getByText(firstTitle))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: firstTitle })).toBeInTheDocument()
    expect(within(dialog).getByText(/Стоимость контракта/)).toBeInTheDocument()
    expect(within(dialog).getByText(/сум/)).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it("rus tilida ko'plik shakllari to'g'ri: 1 год, 2–4 года, 5 лет, 11 лет, 21 год, 22 года", () => {
    const t = i18n.getFixedT('ru')
    const cases = { 1: '1 год', 2: '2 года', 4: '4 года', 5: '5 лет', 11: '11 лет', 12: '12 лет', 21: '21 год', 22: '22 года', 25: '25 лет' }
    for (const [n, expected] of Object.entries(cases)) expect(t('faculty.years', { count: Number(n) }), n).toBe(expected)
  })
})

describe('FAQ (RU)', () => {
  it('savollar ruscha, JSON-LD (FAQPage) ham ruscha', async () => {
    const user = userEvent.setup()
    at('/ru/faq', <FAQ />)
    await user.click(screen.getByText('Когда начинается приём?'))
    expect(screen.getByText(/Приём ежегодно проходит с 1 июля по 20 августа/)).toBeInTheDocument()
    const ld = JSON.parse(document.head.querySelector('script#jsonld-faq').textContent)
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity).toHaveLength(ru.faq.items.length)
    expect(ld.mainEntity[0].name).toBe('Когда начинается приём?')
    expect(JSON.stringify(ld)).not.toMatch(/Qabul/)
  })

  it("FAQ'da Germaniya hamkor sifatida ko'rsatilmagan (faqat haqiqiy hamkor mamlakatlar)", () => {
    const partners = ru.faq.items.find(i => /зарубежными университетами/.test(i.q)).a
    expect(partners).not.toMatch(/Герман/)
    expect(partners).toMatch(/Малайзи.*Росси.*Латви.*Польш.*Итали.*Инди/)
  })
})

describe('About (RU)', () => {
  it('matn, raqamlar yorliqlari va rahbariyat ruscha', () => {
    at('/ru/about', <About />)
    expect(screen.getByText('О нас')).toBeInTheDocument()
    expect(screen.getByText('Наша миссия')).toBeInTheDocument()
    expect(screen.getByText('Руководство')).toBeInTheDocument()
    expect(screen.getByText('Ректор')).toBeInTheDocument()
    expect(screen.queryByText('Biz haqimizda')).not.toBeInTheDocument()
    expect(screen.queryByText('Rektor')).not.toBeInTheDocument()
    // avatar bosh harflari ruscha ismdan olinadi
    for (const initials of ['ПУ', 'НФ', 'РУ', 'ЯА']) expect(screen.getByText(initials)).toBeInTheDocument()
  })

  it("o'zbekchada avatar bosh harflari avvalgidek (PU, NF, RU, YA)", () => {
    at('/about', <About />)
    for (const initials of ['PU', 'NF', 'RU', 'YA']) expect(screen.getByText(initials)).toBeInTheDocument()
  })
})

describe('International (RU)', () => {
  it('sarlavha, statistika va hamkorlar ruscha (7 ta hamkor, INTI ham)', () => {
    at('/ru/international', <International />)
    expect(screen.getByText('Университеты-партнёры')).toBeInTheDocument()
    expect(screen.getByText('Академическая мобильность')).toBeInTheDocument()
    expect(screen.getByText('INTI International University')).toBeInTheDocument()
    expect(screen.getByText('Гданьский университет (University of Gdańsk)')).toBeInTheDocument()
    expect(screen.queryByText('Xalqaro hamkorlik')).not.toBeInTheDocument()
    expect(Object.keys(ru.international.partners)).toEqual(Object.keys(uz.international.partners))
  })
})

describe('Contact + TelegramPanel (RU)', () => {
  it("yorliqlar ruscha, aloqa ma'lumotlari config'dan o'zgarishsiz", () => {
    at('/ru/contact', <Contact />)
    expect(screen.getByText('Свяжитесь с KIU')).toBeInTheDocument()
    expect(screen.getByText('Часы работы')).toBeInTheDocument()
    expect(screen.getByText(config.contact.phone)).toBeInTheDocument()
    expect(screen.getByText(config.contact.email)).toBeInTheDocument()
    expect(screen.getByText('Пн–Сб: 09:00–20:00')).toBeInTheDocument()
    expect(screen.queryByText("Bog'lanish")).not.toBeInTheDocument()
  })

  it("Telegram paneli: demo postlar ruscha, havola o'zgarishsiz va xavfsiz ochiladi", () => {
    at('/ru/contact', <TelegramPanel />)
    expect(screen.getByText('Официальный Telegram-канал')).toBeInTheDocument()
    expect(screen.getByText(/Обновлён пакет документов для поступления/)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Подписаться на канал/ })
    expect(link).toHaveAttribute('href', config.telegram.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toMatch(/noopener/)
  })
})

describe('Hemis + Documents (RU)', () => {
  it("HEMIS: bo'limlar ruscha; yordam matnida telefon va Telegram config'dan", () => {
    at('/ru/hemis', <Hemis />)
    expect(screen.getByText('Вход в информационную систему HEMIS')).toBeInTheDocument()
    expect(screen.getByText('Для студентов')).toBeInTheDocument()
    expect(screen.getByText('Для преподавателей')).toBeInTheDocument()
    // 6.11c2: telefon va Telegram endi havola — matn bitta abzatsda qoladi, alohida havolalar `tel:` va t.me ga
    const help = screen.getByRole('link', { name: config.contact.phone }).closest('p')
    expect(help.textContent).toMatch(new RegExp(`${config.contact.phone.replace(/[+]/g, '\\+')}.*${config.telegram.username}`))
    expect(screen.getByRole('link', { name: config.telegram.username })).toHaveAttribute('href', config.telegram.url)
    expect(screen.queryByText(/Talabalar uchun/)).not.toBeInTheDocument()
  })

  it("Documents: sarlavha ruscha va hujjatlar o'zbekcha ekani haqida izoh bor; o'zbekchada izoh yo'q", () => {
    const { unmount } = at('/ru/documents', <Documents />)
    expect(screen.getByText('Официальные документы и нормативная база')).toBeInTheDocument()
    expect(screen.getByText('Этот материал опубликован на узбекском языке.')).toBeInTheDocument()
    expect(screen.queryByText('Normativ hujjatlar')).not.toBeInTheDocument()
    unmount()
    at('/documents', <Documents />)
    expect(screen.queryByText('Этот материал опубликован на узбекском языке.')).not.toBeInTheDocument()
  })
})

describe('Drift guard (RU)', () => {
  it("har bir yo'nalish (data.js id) ruscha matnga ega", () => {
    for (const f of [...BAKALAVR, ...MAGISTRATURA]) {
      const p = ru.faculty.programs[f.id]
      expect(p, `faculty.programs.${f.id}`).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(Array.isArray(p.subjects) && p.subjects.length).toBe(uz.faculty.programs[f.id].subjects.length)
      expect(Array.isArray(p.career) && p.career.length).toBe(uz.faculty.programs[f.id].career.length)
    }
  })

  it("FAQ savollari va rahbarlar soni uz bilan teng", () => {
    expect(ru.faq.items.length).toBe(uz.faq.items.length)
    expect(Object.keys(ru.about.leaders)).toEqual(Object.keys(uz.about.leaders))
  })

  it("ruscha matnlarda o'zbekcha 'so'm' qolmagan", () => {
    expect(JSON.stringify(ru.faculty)).not.toMatch(/so'm/)
  })
})
