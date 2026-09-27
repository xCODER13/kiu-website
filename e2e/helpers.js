import { E2E_ADMIN_USERNAME, E2E_ADMIN_PASSWORD } from './config.js'

// Admin panelga haqiqiy login orqali kiradi (backend + Mongo bilan haqiqiy so'rov).
export async function loginAsAdmin(page) {
  await page.goto('/admin/login')
  await page.getByPlaceholder('Login').fill(E2E_ADMIN_USERNAME)
  await page.getByPlaceholder('Parol').fill(E2E_ADMIN_PASSWORD)
  await Promise.all([
    page.waitForURL('**/admin'),
    page.getByRole('button', { name: 'Kirish' }).click(),
  ])
}