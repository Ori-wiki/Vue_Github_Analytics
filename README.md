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
- GitHub GraphQL API for contribution calendar when a token is available
- Chart.js + vue-chartjs for charts
- Vitest + Vue Test Utils + jsdom for tests
- Playwright for E2E smoke tests
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
- Comparison v2 with popularity, activity, maintenance and total scores
- Shareable user pages at `/user/:username`
- Runtime GitHub token setup screen
- Rate limit indicator with remaining requests, reset time and auth mode
- Skeleton loading states
- Recent searches, pinned profiles and quick compare
- Command palette with `Ctrl+K`
- Dashboard presets: Overview, Activity, Repositories, Compare, Saved
- Advanced repository filters
- Repository health score
- Organization analytics at `/org/:org`
- Full report JSON export
- Export visible repositories as JSON or CSV
- Optional GitHub token support through `.env`
- API response cache for repeated requests
- Request cancellation for fast profile switching

## Run

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test:run
```

## E2E

```bash
npm run test:e2e
```

## GitHub API Token

Public API requests work without a token, but GitHub rate limits them more aggressively.

Create `.env` from `.env.example`:

```bash
VITE_GITHUB_TOKEN=your_github_token
```

You can also add a token from the in-app setup panel. The runtime token is stored in `localStorage` and overrides `.env` for local use.

## Project Structure

```txt
src/
  api/                 GitHub API client
  components/          UI blocks and chart components
  composables/          Feature composables
  config/              Runtime env helpers
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
