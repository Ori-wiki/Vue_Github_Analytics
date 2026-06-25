import { expect, type Page, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await mockGithubApi(page)
})

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
})

test('opens organization route', async ({ page }) => {
  await page.goto('/org/vuejs')
  await expect(page.getByText('Organization', { exact: true })).toBeVisible()
  await expect(page.getByText('vuejs')).toBeVisible()
})

async function mockGithubApi(page: Page) {
  await page.route('https://api.github.com/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    const headers = {
      'content-type': 'application/json',
      'x-ratelimit-limit': '5000',
      'x-ratelimit-remaining': '4990',
      'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
    }

    if (path === '/users/vuejs' || path === '/users/torvalds') {
      const login = path.split('/').at(-1) ?? 'vuejs'
      await route.fulfill({
        headers,
        json: {
          login,
          avatar_url: 'https://example.com/avatar.png',
          html_url: `https://github.com/${login}`,
          name: login,
          bio: 'Mock profile',
          company: null,
          location: null,
          blog: '',
          followers: login === 'torvalds' ? 1000 : 500,
          following: 1,
          public_repos: 1,
          created_at: '2020-01-01T00:00:00Z',
        },
      })
      return
    }

    if (path.endsWith('/repos')) {
      const owner = path.split('/')[2]
      await route.fulfill({
        headers,
        json: [createRepository(owner, 'core')],
      })
      return
    }

    if (path.endsWith('/events/public')) {
      const owner = path.split('/')[2]
      await route.fulfill({
        headers,
        json: [
          {
            id: '1',
            type: 'PushEvent',
            created_at: new Date().toISOString(),
            repo: { name: `${owner}/core` },
            payload: { commits: [{ sha: '1', message: 'feat' }] },
          },
        ],
      })
      return
    }

    if (path === '/repos/vuejs/core') {
      await route.fulfill({ headers, json: createRepository('vuejs', 'core') })
      return
    }

    if (path === '/repos/vuejs/core/readme') {
      await route.fulfill({
        headers,
        json: {
          html_url: 'https://github.com/vuejs/core/blob/main/README.md',
          download_url: null,
          content: btoa('# Vue Core\nMock README'),
          encoding: 'base64',
        },
      })
      return
    }

    if (path === '/repos/vuejs/core/releases') {
      await route.fulfill({ headers, json: [] })
      return
    }

    if (path === '/repos/vuejs/core/contributors') {
      await route.fulfill({ headers, json: [] })
      return
    }

    if (path === '/repos/vuejs/core/issues') {
      await route.fulfill({ headers, json: [] })
      return
    }

    if (path === '/repos/vuejs/core/commits') {
      await route.fulfill({
        headers,
        json: [
          {
            sha: '1',
            html_url: 'https://github.com/vuejs/core/commit/1',
            commit: {
              message: 'feat: mock commit',
              author: { name: 'Mock', date: new Date().toISOString() },
            },
          },
        ],
      })
      return
    }

    if (path === '/orgs/vuejs') {
      await route.fulfill({
        headers,
        json: {
          login: 'vuejs',
          avatar_url: 'https://example.com/org.png',
          html_url: 'https://github.com/vuejs',
          name: 'vuejs',
          description: 'Mock organization',
          public_repos: 1,
          followers: 100,
          location: null,
          created_at: '2020-01-01T00:00:00Z',
        },
      })
      return
    }

    if (path === '/orgs/vuejs/repos') {
      await route.fulfill({ headers, json: [createRepository('vuejs', 'core')] })
      return
    }

    await route.fulfill({ headers, json: {} })
  })
}

function createRepository(owner: string, name: string) {
  return {
    id: 1,
    name,
    owner: { login: owner },
    full_name: `${owner}/${name}`,
    html_url: `https://github.com/${owner}/${name}`,
    description: 'Mock repository',
    language: 'TypeScript',
    stargazers_count: owner === 'torvalds' ? 200 : 100,
    forks_count: 10,
    open_issues_count: 2,
    watchers_count: 100,
    topics: ['vue', 'typescript'],
    pushed_at: new Date().toISOString(),
    created_at: '2020-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    license: { name: 'MIT', spdx_id: 'MIT' },
    default_branch: 'main',
  }
}
