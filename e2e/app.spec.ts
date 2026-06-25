import { expect, test } from '@playwright/test'

test('opens user dashboard and toggles theme', async ({ page }) => {
  await page.goto('/user/vuejs')
  await expect(page.getByText('GitHub Analytics')).toBeVisible()
  await page.getByRole('button', { name: /switch to/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/)
})

test('opens compare route', async ({ page }) => {
  await page.goto('/compare/vuejs/torvalds')
  await expect(page.getByText('User A vs User B')).toBeVisible()
  await expect(page.getByText(/wins overall|evenly matched/i)).toBeVisible()
})

test('opens repository detail route', async ({ page }) => {
  await page.goto('/repositories/vuejs/core')
  await expect(page.getByText('Back to @vuejs')).toBeVisible()
  await expect(page.getByText('README preview')).toBeVisible()
  await expect(page.getByText('GitHub Actions / CI status')).toBeVisible()
})

test('opens organization route', async ({ page }) => {
  await page.goto('/org/vuejs')
  await expect(page.getByText('Organization', { exact: true })).toBeVisible()
  await expect(page.getByText('vuejs')).toBeVisible()
})

test('opens GitHub search page', async ({ page }) => {
  await page.goto('/search?q=vue')
  await expect(page.getByText('Users and organizations')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Repositories', exact: true })).toBeVisible()
})

test('shows user not found state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('msw-scenario', 'user-not-found'))
  await page.goto('/user/missing-user')
  await expect(page.getByRole('heading', { name: 'Пользователь не найден' })).toBeVisible()
})

test('shows rate limit state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('msw-scenario', 'rate-limit'))
  await page.goto('/user/vuejs')
  await expect(page.getByRole('heading', { name: 'Превышен лимит GitHub API' })).toBeVisible()
})

test('shows network error state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('msw-scenario', 'network-error'))
  await page.goto('/user/vuejs')
  await expect(page.getByRole('heading', { name: 'Ошибка сети' })).toBeVisible()
})

test('shows empty repositories state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('msw-scenario', 'empty-repos'))
  await page.goto('/user/vuejs?tab=repositories')
  await expect(page.getByText('У пользователя нет репозиториев')).toBeVisible()
})

test('shows no public events state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('msw-scenario', 'no-events'))
  await page.goto('/user/vuejs?tab=activity')
  await expect(page.getByText('No public events')).toBeVisible()
})
