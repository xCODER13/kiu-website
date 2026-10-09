import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudentLifeAdmin from './StudentLifeAdmin'
import { mockApi } from '../../test/helpers'

beforeEach(() => { localStorage.setItem('kiu_token', 'tok') })

describe('StudentLifeAdmin: tablar', () => {
  it("«Albomlar» ochiq; «Bo'limlar» birinchi ochilgunga qadar yuklanmaydi", async () => {
    const api = mockApi({ 'GET /gallery': [], 'GET /student-life': [] })
    render(<StudentLifeAdmin />)
    expect(screen.getByRole('tab', { name: 'Albomlar' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: "Bo'limlar" })).toHaveAttribute('aria-selected', 'false')
    await screen.findByText("Hali albom yo'q")
    expect(api.find('GET', '/student-life')).toHaveLength(0)
  })

  it("tab almashganda ikkala panel DOM'da qoladi (yarim to'ldirilgan forma yo'qolmaydi), qayta yuklanmaydi", async () => {
    const user = userEvent.setup()
    const api = mockApi({ 'GET /gallery': [], 'GET /student-life': [] })
    render(<StudentLifeAdmin />)
    await screen.findByText("Hali albom yo'q")
    await user.click(screen.getAllByRole('button', { name: 'Yangi albom' })[0])
    await user.type(screen.getByLabelText(/^Nomi/), 'Yarim')

    await user.click(screen.getByRole('tab', { name: "Bo'limlar" }))
    expect(await screen.findByText("Hali element yo'q")).toBeInTheDocument()
    expect(screen.getByRole('tabpanel', { name: "Bo'limlar" })).toBeVisible()

    await user.click(screen.getByRole('tab', { name: 'Albomlar' }))
    expect(screen.getByLabelText(/^Nomi/)).toHaveValue('Yarim')
    expect(api.find('GET', '/gallery')).toHaveLength(1)
    expect(api.find('GET', '/student-life')).toHaveLength(1)
  })

  it('klaviatura: → keyingi tabga o\'tadi va fokus unda; Home/End', async () => {
    const user = userEvent.setup()
    mockApi({ 'GET /gallery': [], 'GET /student-life': [] })
    render(<StudentLifeAdmin />)
    await screen.findByText("Hali albom yo'q")
    screen.getByRole('tab', { name: 'Albomlar' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: "Bo'limlar" })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: "Bo'limlar" })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Albomlar' })).toHaveFocus()
  })
})
