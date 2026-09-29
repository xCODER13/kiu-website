import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LocaleProvider from './LocaleProvider'
import uz from './locales/uz.json'
import en from './locales/en.json'
import config from '../config'
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

const at = (path, ui) => render(<MemoryRouter initialEntries={[path]}><LocaleProvider>{ui}</LocaleProvider></MemoryRouter>)

describe('Admission (EN)', () => {
  it('sarlavha, bosqichlar, muddat inglizcha; tugma ishlaydi; havola /en prefiksli', async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()
    at('/en/admission', <Admission onApply={onApply} />)
    expect(screen.getByText('Application procedure and requirements')).toBeInTheDocument()
    for (const n of [1, 2, 3, 4]) expect(screen.getByText(`Step ${n}`)).toBeInTheDocument()
    expect(screen.getByText(/Deadline: July 1 – August 20, 2026/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Apply now/ }))
    expect(onApply).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('link', { name: /Find your program/ })).toHaveAttribute('href', '/en/sorting-hat')
    expect(screen.queryByText(/Bosqich/)).not.toBeInTheDocument()
  })
})

describe('Faculty (EN)', () => {
  it("kartalar, narx (UZS, vergul) va statistika inglizcha; o'zbekcha nom yo'q", () => {
    at('/en/faculty', <Faculty />)
    expect(screen.getByText('Preschool Education')).toBeInTheDocument()
    expect(screen.getAllByText('12,850,000 UZS/year').length).toBeGreaterThan(0)
    expect(screen.getAllByText('4 years').length).toBeGreaterThan(0)
    expect(screen.queryByText("Maktabgacha ta'lim")).not.toBeInTheDocument()
    expect(screen.queryByText(/so'm/)).not.toBeInTheDocument()
  })

  it("Master's tabi va modal: matn, fanlar, kasblar inglizcha; Escape yopadi", async () => {
    const user = userEvent.setup()
    at('/en/faculty', <Faculty />)
    await user.click(screen.getByRole('button', { name: /Master's/ }))
    expect(screen.queryByText('Preschool Education')).not.toBeInTheDocument()
    expect(screen.getAllByText('2 years').length).toBeGreaterThan(0)
    const firstTitle = en.faculty.programs[MAGISTRATURA[0].id].name
    await user.click(screen.getByText(firstTitle))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: firstTitle })).toBeInTheDocument()
    expect(within(dialog).getByText(/Tuition fee/)).toBeInTheDocument()
    expect(within(dialog).getByText(/UZS/)).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('FAQ (EN)', () => {
  it("savollar inglizcha, JSON-LD (FAQPage) ham inglizcha", async () => {
    const user = userEvent.setup()
    at('/en/faq', <FAQ />)
    await user.click(screen.getByText('When does admission start?'))
    expect(screen.getByText(/Admission runs every year from July 1 to August 20/)).toBeInTheDocument()
    const ld = JSON.parse(document.head.querySelector('script#jsonld-faq').textContent)
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity).toHaveLength(en.faq.items.length)
    expect(ld.mainEntity[0].name).toBe('When does admission start?')
    expect(JSON.stringify(ld)).not.toMatch(/Qabul/)
  })
})

describe('About (EN)', () => {
  it("matn, raqamlar yorliqlari va rahbariyat inglizcha", () => {
    at('/en/about', <About />)
    expect(screen.getByText('About us')).toBeInTheDocument()
    expect(screen.getByText('Our mission')).toBeInTheDocument()
    expect(screen.getByText('Leadership')).toBeInTheDocument()
    expect(screen.getByText('Rector')).toBeInTheDocument()
    expect(screen.queryByText('Biz haqimizda')).not.toBeInTheDocument()
    expect(screen.queryByText('Rektor')).not.toBeInTheDocument()
  })
})

describe('International (EN)', () => {
  it("sarlavha, statistika va hamkorlar inglizcha", () => {
    at('/en/international', <International />)
    expect(screen.getByText('International cooperation')).toBeInTheDocument()
    expect(screen.getByText('Partner universities')).toBeInTheDocument()
    expect(screen.getByText('Academic mobility')).toBeInTheDocument()
    expect(screen.queryByText('Xalqaro hamkorlik')).not.toBeInTheDocument()
  })
})

describe('Contact + TelegramPanel (EN)', () => {
  it("yorliqlar inglizcha, aloqa ma'lumotlari config'dan o'zgarishsiz", () => {
    at('/en/contact', <Contact />)
    expect(screen.getByText('Get in touch with KIU')).toBeInTheDocument()
    expect(screen.getByText('Working hours')).toBeInTheDocument()
    expect(screen.getByText(config.contact.phone)).toBeInTheDocument()
    expect(screen.getByText(config.contact.email)).toBeInTheDocument()
    expect(screen.getByText('Mon–Sat: 09:00–20:00')).toBeInTheDocument()
    expect(screen.queryByText("Bog'lanish")).not.toBeInTheDocument()
  })

  it("Telegram paneli: demo postlar inglizcha, havola o'zgarishsiz va xavfsiz ochiladi", () => {
    at('/en/contact', <TelegramPanel />)
    expect(screen.getByText('Official Telegram channel')).toBeInTheDocument()
    expect(screen.getByText(/The admission documents package has been updated/)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Subscribe to the channel/ })
    expect(link).toHaveAttribute('href', config.telegram.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toMatch(/noopener/)
  })
})

describe('Hemis (EN)', () => {
  it("bo'limlar inglizcha; yordam matnida telefon va Telegram config'dan", () => {
    at('/en/hemis', <Hemis />)
    expect(screen.getByText('Electronic university')).toBeInTheDocument()
    expect(screen.getByText('For students')).toBeInTheDocument()
    expect(screen.getByText('For teachers')).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`${config.contact.phone.replace(/[+]/g, '\\+')}.*${config.telegram.username}`))).toBeInTheDocument()
    expect(screen.queryByText(/Talabalar uchun/)).not.toBeInTheDocument()
  })
})

describe('Documents (EN)', () => {
  it("sarlavha inglizcha va hujjatlar o'zbekcha ekani haqida izoh bor", () => {
    at('/en/documents', <Documents />)
    expect(screen.getByText('Official documents')).toBeInTheDocument()
    expect(screen.getByText('This content is published in Uzbek.')).toBeInTheDocument()
    expect(screen.queryByText('Normativ hujjatlar')).not.toBeInTheDocument()
  })

  it("o'zbekcha holatda izoh chiqmaydi", () => {
    at('/documents', <Documents />)
    expect(screen.queryByText('This content is published in Uzbek.')).not.toBeInTheDocument()
  })
})

describe('Drift guard: tarjima fayllari va config/data', () => {
  it("admission.deadline uz.json da config.admission.deadline bilan bir xil", () => {
    expect(uz.admission.deadline).toBe(config.admission.deadline)
  })

  it("har bir yo'nalish (data.js id) ikkala tilda ham matnga ega", () => {
    for (const lang of [uz, en]) {
      for (const f of [...BAKALAVR, ...MAGISTRATURA]) {
        const p = lang.faculty.programs[f.id]
        expect(p, `faculty.programs.${f.id}`).toBeTruthy()
        expect(p.name).toBeTruthy()
        expect(Array.isArray(p.subjects) && p.subjects.length).toBeGreaterThan(0)
        expect(Array.isArray(p.career) && p.career.length).toBeGreaterThan(0)
      }
    }
  })

  it("FAQ savollari va rahbarlar soni ikkala tilda teng", () => {
    expect(en.faq.items.length).toBe(uz.faq.items.length)
    expect(Object.keys(en.about.leaders)).toEqual(Object.keys(uz.about.leaders))
  })

  it("inglizcha matnlarda o'zbekcha 'so'm' qolmagan", () => {
    expect(JSON.stringify(en.faculty)).not.toMatch(/so'm/)
  })
})
