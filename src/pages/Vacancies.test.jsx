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