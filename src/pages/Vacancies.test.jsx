import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Vacancies from './Vacancies'

const okFetch = () => vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })))

async function goToForm(user) {
  await user.click(screen.getByRole('button', { name: 'Ariza topshirish' }))
}

async function fillValid(user) {
  await goToForm(user)
  await user.type(screen.getByPlaceholderText('Familiya Ism Otasining ismi'), 'Ali Valiyev')
  await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '+998 90 123 45 67')
  await user.type(screen.getByPlaceholderText('email@example.com'), 'ali@example.com')
  const selects = screen.getAllByRole('combobox')
  await user.selectOptions(selects[0], "O'qituvchi")
  await user.selectOptions(selects[1], 'Aniq fanlar kafedrasi')
  await user.selectOptions(selects[2], 'Magistr')
  await user.selectOptions(selects[3], '1–3 yil')
}

describe('Vacancies', () => {
  it('default holatda "Ma\'lumot" tabi ko\'rinadi, forma yashiringan', () => {
    render(<Vacancies />)
    expect(screen.getByText('Nima uchun KIU?')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Familiya Ism Otasining ismi')).not.toBeInTheDocument()
  })

  it('"Ariza topshirish" tabiga o\'tish formani ko\'rsatadi', async () => {
    const user = userEvent.setup()
    render(<Vacancies />)
    await goToForm(user)
    expect(screen.getByText("Ishga joylashish uchun so'rovnoma")).toBeInTheDocument()
  })

  it('info tabidagi "Online ariza topshirish" tugmasi ham formaga o\'tkazadi', async () => {
    const user = userEvent.setup()
    render(<Vacancies />)
    await user.click(screen.getByText(/Online ariza topshirish/))
    expect(screen.getByText("Ishga joylashish uchun so'rovnoma")).toBeInTheDocument()
  })

  it('bo\'sh forma — barcha majburiy xatolar ko\'rinadi, so\'rov yuborilmaydi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<Vacancies />)
    await goToForm(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    expect(screen.getAllByText('Bu maydon majburiy')).toHaveLength(2) // fullName, phone (email endi ixtiyoriy)
    expect(screen.getByText('Lavozim majburiy')).toBeInTheDocument()
    expect(screen.getByText("Bo'lim/Kafedra majburiy")).toBeInTheDocument()
    expect(screen.getByText("Ta'lim darajasi majburiy")).toBeInTheDocument()
    expect(screen.getByText('Ish tajribasi majburiy')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('to\'g\'ri ma\'lumot — type:"vacancy" bilan yuboradi va muvaffaqiyat ekranini ko\'rsatadi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))

    expect(await screen.findByText('Arizangiz qabul qilindi!')).toBeInTheDocument()
    expect(screen.getByText('Ali Valiyev')).toBeInTheDocument()

    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('http://api.test/api/applications')
    expect(opts.method).toBe('POST')
    const body = JSON.parse(opts.body)
    expect(body).toMatchObject({
      fullName: 'Ali Valiyev',
      name: 'Ali Valiyev',
      phone: '+998 90 123 45 67',
      email: 'ali@example.com',
      position: "O'qituvchi",
      faculty: 'Aniq fanlar kafedrasi',
      education: 'Magistr',
      experience: '1–3 yil',
      hasPortfolio: false,
      type: 'vacancy',
    })
  })

  it('email bo\'sh qoldirilsa ham forma yuboriladi (ixtiyoriy maydon)', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<Vacancies />)
    await goToForm(user)
    await user.type(screen.getByPlaceholderText('Familiya Ism Otasining ismi'), 'Ali Valiyev')
    await user.type(screen.getByPlaceholderText('+998 90 123 45 67'), '+998 90 123 45 67')
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], "O'qituvchi")
    await user.selectOptions(selects[1], 'Aniq fanlar kafedrasi')
    await user.selectOptions(selects[2], 'Magistr')
    await user.selectOptions(selects[3], '1–3 yil')
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    expect(await screen.findByText('Arizangiz qabul qilindi!')).toBeInTheDocument()
    expect(JSON.parse(fetch.mock.calls[0][1].body).email).toBe('')
  })

  it('"Portfelim mavjud" belgilansa hasPortfolio:true yuboriladi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    await screen.findByText('Arizangiz qabul qilindi!')
    expect(JSON.parse(fetch.mock.calls[0][1].body).hasPortfolio).toBe(true)
  })

  it('server xatosi (ok:false) — xato xabari, forma ma\'lumoti saqlanadi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })))
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    expect(await screen.findByText(/xatolik yuz berdi/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Familiya Ism Otasining ismi')).toHaveValue('Ali Valiyev')
  })

  it('tarmoq xatosi — xato xabari ko\'rinadi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('net'))))
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    expect(await screen.findByText(/xatolik yuz berdi/)).toBeInTheDocument()
  })

  it('yuborish paytida tugma bloklanadi (ikki marta yuborishdan himoya)', async () => {
    let resolve
    vi.stubGlobal('fetch', vi.fn(() => new Promise(r => { resolve = r })))
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    expect(screen.getByText('Yuborilmoqda...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Yuborilmoqda/ })).toBeDisabled()
    resolve({ ok: true })
    await screen.findByText('Arizangiz qabul qilindi!')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('"Yangi ariza" formani tozalab qayta ko\'rsatadi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    await screen.findByText('Arizangiz qabul qilindi!')
    await user.click(screen.getByRole('button', { name: 'Yangi ariza' }))
    expect(screen.getByPlaceholderText('Familiya Ism Otasining ismi')).toHaveValue('')
  })

  it('"Ma\'lumotlarga qaytish" info tabiga qaytaradi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    await screen.findByText('Arizangiz qabul qilindi!')
    await user.click(screen.getByRole('button', { name: "Ma'lumotlarga qaytish" }))
    expect(screen.getByText('Nima uchun KIU?')).toBeInTheDocument()
  })

  it('XSS: xabar matni HTML sifatida DOM ga tushmaydi', async () => {
    okFetch()
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.type(screen.getByPlaceholderText(/Tajribangiz/), '<img src=x onerror=alert(1)>')
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    await screen.findByText('Arizangiz qabul qilindi!')
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })
})

// Bosqich 5b: inline stillar → klasslar (vacancies/styles.js obyektlari → klass nomlari).
describe('Vacancies — inline stillar klassga ko\'chirilgan (Bosqich 5b)', () => {
  it("`<style>` teglari va inline stil yo'q — Info tab", () => {
    const { container } = render(<Vacancies />)
    expect(document.querySelectorAll('style')).toHaveLength(0)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it("tablar: faol holat `data-active` da va almashadi (rol `button` o'zgarmagan)", async () => {
    const user = userEvent.setup()
    render(<Vacancies />)
    const info = screen.getByRole('button', { name: "Ma'lumot" })
    const form = screen.getByRole('button', { name: /Ariza topshirish/ })
    // 6.11c4: eski `.tab` o'rniga Fakultet bilan umumiy pill-tab (`kiu-tab-btn`) + `aria-pressed`
    expect(info).toHaveClass('kiu-tab-btn')
    expect(info).toHaveAttribute('data-active', 'true')
    expect(info).toHaveAttribute('aria-pressed', 'true')
    expect(form).toHaveAttribute('data-active', 'false')
    expect(form).toHaveAttribute('aria-pressed', 'false')
    await user.click(form)
    expect(form).toHaveAttribute('data-active', 'true')
    expect(form).toHaveAttribute('aria-pressed', 'true')
    expect(info).toHaveAttribute('data-active', 'false')
  })

  it("Forma tabi: inline stil yo'q, maydonlar `.input` klassida", async () => {
    const user = userEvent.setup()
    const { container } = render(<Vacancies />)
    await goToForm(user)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    expect(screen.getByPlaceholderText('Familiya Ism Otasining ismi')).toHaveClass('input', 'input--lg')  // 6.11c4: yangi forma tizimi
    expect(container.querySelectorAll('.panel')).toHaveLength(3)
    expect(container.querySelectorAll('select.input')).toHaveLength(4)
  })

  it("validatsiya xatosi: maydon `aria-invalid=\"true\"` oladi (ramka CSS da), xato matni `.field-error`, inline yo'q", async () => {
    const user = userEvent.setup()
    const { container } = render(<Vacancies />)
    await goToForm(user)
    const name = screen.getByPlaceholderText('Familiya Ism Otasining ismi')
    expect(name).toHaveAttribute('aria-invalid', 'false')
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByPlaceholderText('email@example.com')).toHaveAttribute('aria-invalid', 'false') // email ixtiyoriy
    expect(container.querySelectorAll('.field-error').length).toBe(6)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it("server xatosi banneri va muvaffaqiyat ekrani ham inline'siz", async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })))
    const user = userEvent.setup()
    const { container, unmount } = render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    await screen.findByText(/xatolik yuz berdi/)
    expect(container.querySelector('.vac-alert')).not.toBeNull()
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
    unmount()

    okFetch()
    const user2 = userEvent.setup()
    const r = render(<Vacancies />)
    await fillValid(user2)
    await user2.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    await screen.findByText('Arizangiz qabul qilindi!')
    expect(r.container.querySelector('.vac-success')).not.toBeNull()
    expect(r.container.querySelectorAll('[style]')).toHaveLength(0)
  })
})

// Bosqich 6.11c4: Vakansiyalar qayta dizayni — a11y va semantika.
describe('Vacancies — qayta dizayn (Bosqich 6.11c4)', () => {
  it("tablar hero ichida (pill-tab), inline stil yo'q", () => {
    const { container } = render(<Vacancies />)
    const hero = container.querySelector('.inner-hero')
    expect(hero).not.toBeNull()
    expect(hero.querySelector('.kiu-tab-wrap')).not.toBeNull()
    expect(hero.querySelectorAll('.kiu-tab-btn')).toHaveLength(2)
    expect(container.querySelectorAll('[style]')).toHaveLength(0)
  })

  it("Info tab: telefonlar `tel:`, email `mailto:` havola", () => {
    const { container } = render(<Vacancies />)
    const tels = container.querySelectorAll('a[href^="tel:"]')
    expect(tels).toHaveLength(2)
    tels.forEach((a) => expect(a.getAttribute('href')).toMatch(/^tel:\+998\d+$/))
    expect(container.querySelectorAll('a[href^="mailto:"]').length).toBeGreaterThan(0)
  })

  it("Forma: label↔input bog'langan, `*` aria-hidden, majburiylar `aria-required`, email ixtiyoriy", async () => {
    const user = userEvent.setup()
    const { container } = render(<Vacancies />)
    await goToForm(user)
    const name = screen.getByPlaceholderText('Familiya Ism Otasining ismi')
    expect(name.id).toBe('vac-fullName')
    expect(container.querySelector('label[for="vac-fullName"]')).not.toBeNull()
    expect(name).toHaveAttribute('aria-required', 'true')
    const email = screen.getByPlaceholderText('email@example.com')
    expect(email).not.toHaveAttribute('aria-required', 'true')
    const stars = container.querySelectorAll('.label__req')
    expect(stars.length).toBeGreaterThan(0)
    stars.forEach((s) => expect(s).toHaveAttribute('aria-hidden', 'true'))
    expect(screen.getByPlaceholderText('+998 90 123 45 67')).toHaveAttribute('type', 'tel')
  })

  it("Xato: `aria-describedby` xato elementiga ishora qiladi; selectlar `.select-wrap` ichida", async () => {
    const user = userEvent.setup()
    const { container } = render(<Vacancies />)
    await goToForm(user)
    expect(container.querySelectorAll('.select-wrap select')).toHaveLength(4)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    const name = screen.getByPlaceholderText('Familiya Ism Otasining ismi')
    const errId = name.getAttribute('aria-describedby')
    expect(errId).toBe('vac-fullName-err')
    expect(container.querySelector('#' + errId)).toHaveTextContent('Bu maydon majburiy')
  })

  it("Server xatosi: `role=alert` banner sarlavha bilan", async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })))
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Ariza yuborilmadi.')
  })

  it("Muvaffaqiyat ekrani `role=status`", async () => {
    okFetch()
    const user = userEvent.setup()
    render(<Vacancies />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Ariza yuborish' }))
    await screen.findByText('Arizangiz qabul qilindi!')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
