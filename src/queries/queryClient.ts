import { QueryClient } from '@tanstack/vue-query'

export const githubQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        return status === 403 || status === 404 ? false : failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})
