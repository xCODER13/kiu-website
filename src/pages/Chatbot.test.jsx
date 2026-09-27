import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chatbot from './Chatbot'

// jsdom Element.prototype.scrollIntoView'ni implementatsiya qilmagan; Chatbot
// har xabar o'zgarishida shuni chaqiradi.
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

function getInput() {
  return screen.getByPlaceholderText(/Savolingizni yozing/)
}
function getSendButton() {
  return getInput().parentElement.querySelector('button')
}

async function sendViaEnterAndWait(text) {
  const user = userEvent.setup({ delay: null })
  await user.type(getInput(), text)
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  try {
    fireEvent.keyDown(getInput(), { key: 'Enter' })
    await act(async () => { await vi.advanceTimersByTimeAsync(800) })
  } finally { vi.useRealTimers() }
}

describe('Chatbot', () => {
  it('boshlang\'ich salomlashuv xabari ko\'rinadi', () => {
    render(<Chatbot />)
    expect(screen.getByText(/Men KIU AI yordamchisiman/)).toBeInTheDocument()
  })

  it('taklif tugmasi bosilganda savol va javob ko\'rinadi', async () => {
    render(<Chatbot />)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Qabul haqida' }))
      expect(screen.getAllByText('Qabul haqida').length).toBeGreaterThanOrEqual(2) // tugma + xabar pufagi
      await act(async () => { await vi.advanceTimersByTimeAsync(800) })
      expect(screen.getByText(/Qabul 1 iyuldan 20 avgustgacha/)).toBeInTheDocument()
    } finally { vi.useRealTimers() }
  })

  it('matn kiritib Enter bosilsa xabar yuboriladi va input tozalanadi', async () => {
    render(<Chatbot />)
    await sendViaEnterAndWait('Manzil qayerda?')
    expect(screen.getByText('Manzil qayerda?')).toBeInTheDocument()
    expect(screen.getByText(/Qarshi sh\., Bahodir Sherqulov/)).toBeInTheDocument()
    expect(getInput()).toHaveValue('')
  })

  it('yuborish tugmasi orqali ham xabar yuboriladi', async () => {
    render(<Chatbot />)
    const user = userEvent.setup({ delay: null })
    await user.type(getInput(), 'Telefon raqamingiz?')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fireEvent.click(getSendButton())
      await act(async () => { await vi.advanceTimersByTimeAsync(800) })
      expect(screen.getByText(/Ish vaqti: Du-Shan/)).toBeInTheDocument()
    } finally { vi.useRealTimers() }
  })

  it('bo\'sh matn bilan Enter hech narsa yubormaydi', () => {
    render(<Chatbot />)
    fireEvent.keyDown(getInput(), { key: 'Enter' })
    expect(screen.queryByText(/Kechirasiz/)).not.toBeInTheDocument()
    expect(screen.getByText(/Savollaringizga javob berishga tayyorman/)).toBeInTheDocument()
  })

  it('noma\'lum savolga standart javob qaytariladi', async () => {
    render(<Chatbot />)
    await sendViaEnterAndWait('asdqwezxc')
    expect(screen.getByText(/Kechirasiz, bu savolga javob topa olmadim/)).toBeInTheDocument()
  })

  it('bot javobi darrov emas — 800ms kechikish bilan keladi', async () => {
    render(<Chatbot />)
    const user = userEvent.setup({ delay: null })
    await user.type(getInput(), 'salom')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fireEvent.keyDown(getInput(), { key: 'Enter' })
      expect(screen.queryByText(/Sizga qanday yordam bera olaman/)).not.toBeInTheDocument()
      await act(async () => { await vi.advanceTimersByTimeAsync(800) })
      expect(screen.getByText(/Sizga qanday yordam bera olaman/)).toBeInTheDocument()
    } finally { vi.useRealTimers() }
  })

  it('bot javobi kelishidan oldin unmount qilinsa, pending timer tozalanadi (memory leak yo\'q)', async () => {
    // React 18 endi "setState on unmounted component" haqida ogohlantirmaydi,
    // shuning uchun console.error emas, balki clearTimeout chaqirilganini
    // to'g'ridan-to'g'ri tekshiramiz — bu cleanup effekti ishlayotganining isboti.
    const { unmount } = render(<Chatbot />)
    const user = userEvent.setup({ delay: null })
    await user.type(getInput(), 'salom')
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fireEvent.keyDown(getInput(), { key: 'Enter' })
      const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
      unmount()
      expect(clearSpy).toHaveBeenCalled()
    } finally { vi.useRealTimers() }
  })

  it('XSS: foydalanuvchi kiritgan matn HTML sifatida in\'ektsiya qilinmaydi', async () => {
    render(<Chatbot />)
    await sendViaEnterAndWait('<img src=x onerror=alert(1)>')
    expect(document.querySelector('img[src="x"]')).toBeNull()
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
  })
})