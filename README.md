# GitHub Analytics

Vue 3 + TypeScript + Vite template for a GitHub analytics dashboard.

## Stack

- Vue 3 Composition API
- TypeScript
- Vite
- Tailwind CSS 4
- Pinia for state management
- Vue Router for shareable routes
- Axios for GitHub REST API
- Chart.js + vue-chartjs for charts
- Vitest + Vue Test Utils + jsdom for tests
- date-fns for date formatting
- @lucide/vue for icons

`zustand` is a React-first state manager. In Vue projects, Pinia is the native fit.

## Features

- Search by GitHub username
- Profile metrics: repositories, stars, followers, following
- Repository table with search, language filter and sorting
- Repository detail page at `/repositories/:owner/:repo`
- Language distribution chart
- Recent public activity chart
- Commit chart from public push events
- Strong user comparison at `/compare/:username/:compareUsername`
- Shareable user pages at `/user/:username`
- Export visible repositories as JSON or CSV
- Optional GitHub token support through `.env`

## Run

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test:run
```

## GitHub API Token

Public API requests work without a token, but GitHub rate limits them more aggressively.

Create `.env` from `.env.example`:

```bash
VITE_GITHUB_TOKEN=your_github_token
```

## Project Structure

```txt
src/
  api/                 GitHub API client
  components/          UI blocks and chart components
  stores/              Pinia stores
  types/               Domain types
  utils/               Analytics and formatting helpers
  test/                Vitest setup
```

## Next Ideas

- Use GitHub GraphQL API for the official contribution calendar
- Add saved comparisons in local storage
- Add repository detail drawer
- Add organization analytics
- Add route-based pages with Vue Router
- Add E2E tests with Playwright
