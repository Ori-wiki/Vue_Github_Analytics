import { http, HttpResponse } from 'msw'
import {
  createMockCommits,
  createMockContributors,
  createMockEvents,
  createMockIssues,
  createMockOrganization,
  createMockReadme,
  createMockReleases,
  createMockRepository,
  createMockUser,
  createMockWorkflowRuns,
  githubMockHeaders,
} from './githubFixtures'

const jsonOptions = {
  headers: githubMockHeaders,
}

export const handlers = [
  http.get('https://api.github.com/users/:username', ({ params, request }) => {
    const scenario = request.headers.get('x-msw-scenario')

    if (scenario === 'network-error') {
      return HttpResponse.error()
    }

    if (scenario === 'rate-limit') {
      return rateLimitResponse()
    }

    if (scenario === 'user-not-found') {
      return HttpResponse.json({ message: 'Not Found' }, { status: 404, headers: githubMockHeaders })
    }

    return HttpResponse.json(createMockUser(String(params.username)), jsonOptions)
  }),

  http.get('https://api.github.com/users/:username/repos', ({ params, request }) => {
    const scenario = request.headers.get('x-msw-scenario')

    if (scenario === 'empty-repos') {
      return HttpResponse.json([], jsonOptions)
    }

    if (scenario === 'rate-limit') {
      return rateLimitResponse()
    }

    return HttpResponse.json([createMockRepository(String(params.username))], jsonOptions)
  }),

  http.get('https://api.github.com/users/:username/events/public', ({ params, request }) => {
    const scenario = request.headers.get('x-msw-scenario')

    if (scenario === 'no-events') {
      return HttpResponse.json([], jsonOptions)
    }

    return HttpResponse.json(createMockEvents(String(params.username)), jsonOptions)
  }),

  http.get('https://api.github.com/search/users', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.split(' ')[0] || 'vue'

    return HttpResponse.json(
      {
        total_count: 2,
        incomplete_results: false,
        items: [
          { ...createMockUser(query), id: 1, type: 'User' },
          { ...createMockOrganization(query), id: 2, type: 'Organization' },
        ],
      },
      jsonOptions,
    )
  }),

  http.get('https://api.github.com/search/repositories', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.split(' ')[0] || 'vue'

    return HttpResponse.json(
      {
        total_count: 1,
        incomplete_results: false,
        items: [createMockRepository(query, 'core')],
      },
      jsonOptions,
    )
  }),

  http.get('https://api.github.com/orgs/:org', ({ params }) => {
    return HttpResponse.json(createMockOrganization(String(params.org)), jsonOptions)
  }),

  http.get('https://api.github.com/orgs/:org/repos', ({ params }) => {
    return HttpResponse.json([createMockRepository(String(params.org))], jsonOptions)
  }),

  http.get('https://api.github.com/repos/:owner/:repo', ({ params }) => {
    return HttpResponse.json(createMockRepository(String(params.owner), String(params.repo)), jsonOptions)
  }),

  http.get('https://api.github.com/repos/:owner/:repo/readme', () => {
    return HttpResponse.json(createMockReadme(), jsonOptions)
  }),

  http.get('https://api.github.com/repos/:owner/:repo/releases', () => {
    return HttpResponse.json(createMockReleases(), jsonOptions)
  }),

  http.get('https://api.github.com/repos/:owner/:repo/contributors', () => {
    return HttpResponse.json(createMockContributors(), jsonOptions)
  }),

  http.get('https://api.github.com/repos/:owner/:repo/issues', () => {
    return HttpResponse.json(createMockIssues(), jsonOptions)
  }),

  http.get('https://api.github.com/repos/:owner/:repo/commits', () => {
    return HttpResponse.json(createMockCommits(), jsonOptions)
  }),

  http.get('https://api.github.com/repos/:owner/:repo/actions/runs', () => {
    return HttpResponse.json({ workflow_runs: createMockWorkflowRuns() }, jsonOptions)
  }),

  http.post('https://api.github.com/graphql', () => {
    return HttpResponse.json(
      {
        data: {
          user: {
            contributionsCollection: {
              commitContributionsByRepository: [
                {
                  repository: { nameWithOwner: 'vuejs/core' },
                  contributions: { totalCount: 12 },
                },
              ],
              contributionCalendar: {
                weeks: [
                  {
                    contributionDays: [
                      { date: new Date().toISOString().slice(0, 10), contributionCount: 3 },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      jsonOptions,
    )
  }),
]

function rateLimitResponse() {
  return HttpResponse.json(
    { message: 'API rate limit exceeded' },
    {
      status: 403,
      headers: {
        ...githubMockHeaders,
        'x-ratelimit-remaining': '0',
      },
    },
  )
}
