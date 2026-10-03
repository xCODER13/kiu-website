// en/ru tarjimalari lazy yuklanadi (kirish faylida faqat uz): yuklash, takroriy so'rov, til almashtirish, xatoda fallback.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n, { isLocaleLoaded, loadLocale } from './index'
import LocaleProvider from './LocaleProvider'
import LanguageSwitcher from './LanguageSwitcher'
import uz from './locales/uz.json'
import ru from './locales/ru.json'
import en from './locales/en.json'

// setup.js en/ru ni oldindan qo'shadi — bu fayldagi testlar "yuklanmagan" holatni o'zi yaratadi
const drop = lng => i18n.removeResourceBundle(lng, 'translation')
afterEach(() => {
  i18n.addResourceBundle('en', 'translation', en)
  i18n.addResourceBundle('ru', 'translation', ru)
})

function Probe() {
  const { t } = useTranslation()
  return <p data-testid="probe">{t('common.loading')}</p>
}

describe('loadLocale', () => {
  it("yuklanmagan til paketini qo'shadi; yuklangan bo'lsa qayta so'ramaydi", async () => {
    drop('ru')
    expect(isLocaleLoaded('ru')).toBe(false)
    expect(isLocaleLoaded('uz')).toBe(true)
    const p1 = loadLocale('ru')
    expect(loadLocale('ru')).toBe(p1) // bitta so'rov
    await p1
    expect(isLocaleLoaded('ru')).toBe(true)
    expect(i18n.getResource('ru', 'translation', 'common.loading') ?? i18n.getResourceBundle('ru', 'translation').common.loading).toBe(ru.common.loading)
    await expect(loadLocale('ru')).resolves.toBeUndefined()
  })

  it("noma'lum til va standart til uchun hech narsa qilmaydi", async () => {
    await expect(loadLocale('uz')).resolves.toBeUndefined()
    await expect(loadLocale('de')).resolves.toBeUndefined()
  })
})

describe('LocaleProvider: lazy til', () => {
  it("yuklangan tilda (en) — darhol, birinchi render'da", () => {
    render(<MemoryRouter initialEntries={['/en/faq']}><LocaleProvider><Probe /></LocaleProvider></MemoryRouter>)
    expect(screen.getByTestId('probe')).toHaveTextContent(en.common.loading)
  })

  it("yuklanmagan til (ru): paket kelgach ruscha matn chiqadi", async () => {
    drop('ru')
    render(<MemoryRouter initialEntries={['/ru/faq']}><LocaleProvider><Probe /></LocaleProvider></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent(ru.common.loading))
  })

  it("til almashtirish: ru paketi kelguncha oldingi til (uz) ko'rinib turadi, keyin almashadi", async () => {
    drop('ru')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/faq']}>
        <LocaleProvider><LanguageSwitcher /><Probe /></LocaleProvider>
      </MemoryRouter>
    )
    expect(screen.getByTestId('probe')).toHaveTextContent(uz.common.loading)
    await user.click(screen.getByRole('link', { name: ru.lang.ru }))
    await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent(ru.common.loading))
    expect(isLocaleLoaded('ru')).toBe(true)
  })

  it("almashtirgich ustiga kelganda (hover) paket oldindan yuklanadi", async () => {
    drop('en')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/faq']}>
        <LocaleProvider><LanguageSwitcher /></LocaleProvider>
      </MemoryRouter>
    )
    expect(isLocaleLoaded('en')).toBe(false)
    await user.hover(screen.getByRole('link', { name: en.lang.en }))
    await waitFor(() => expect(isLocaleLoaded('en')).toBe(true))
  })

  it("yuklash xatosida sahifa bo'sh qolmaydi: uz fallback matn", async () => {
    drop('ru')
    const spy = vi.spyOn(i18n, 'addResourceBundle').mockImplementation(() => { throw new Error('tarmoq') })
    render(<MemoryRouter initialEntries={['/ru/faq']}><LocaleProvider><Probe /></LocaleProvider></MemoryRouter>)
    await waitFor(() => expect(spy).toHaveBeenCalled())
    expect(screen.getByTestId('probe')).toHaveTextContent(uz.common.loading)
    spy.mockRestore()
  })
})
