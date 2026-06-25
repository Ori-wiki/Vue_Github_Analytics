import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { hasGithubToken } from '../config/env'

export const useRateLimitStore = defineStore('rateLimit', () => {
  const limit = ref<number | null>(null)
  const remaining = ref<number | null>(null)
  const used = ref<number | null>(null)
  const resetAt = ref<Date | null>(null)
  const resource = ref('')
  const lastUpdatedAt = ref<Date | null>(null)
  const tokenVersion = ref(0)

  const authMode = computed(() => {
    void tokenVersion.value
    return hasGithubToken() ? 'authenticated' : 'unauthenticated'
  })
  const resetTime = computed(() =>
    resetAt.value
      ? resetAt.value.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      : 'unknown',
  )

  function updateFromHeaders(headers: Record<string, unknown>) {
    const nextLimit = readNumberHeader(headers, 'x-ratelimit-limit')
    const nextRemaining = readNumberHeader(headers, 'x-ratelimit-remaining')
    const nextUsed = readNumberHeader(headers, 'x-ratelimit-used')
    const nextReset = readNumberHeader(headers, 'x-ratelimit-reset')
    const nextResource = readStringHeader(headers, 'x-ratelimit-resource')

    if (nextLimit !== null) {
      limit.value = nextLimit
    }

    if (nextRemaining !== null) {
      remaining.value = nextRemaining
    }

    if (nextUsed !== null) {
      used.value = nextUsed
    }

    if (nextReset !== null) {
      resetAt.value = new Date(nextReset * 1000)
    }

    if (nextResource) {
      resource.value = nextResource
    }

    lastUpdatedAt.value = new Date()
  }

  function refreshAuthMode() {
    tokenVersion.value += 1
  }

  return {
    limit,
    remaining,
    used,
    resetAt,
    resetTime,
    resource,
    lastUpdatedAt,
    tokenVersion,
    authMode,
    updateFromHeaders,
    refreshAuthMode,
  }
})

function readNumberHeader(headers: Record<string, unknown>, key: string) {
  const value = headers[key]
  const parsed = typeof value === 'string' ? Number(value) : null
  return Number.isFinite(parsed) ? parsed : null
}

function readStringHeader(headers: Record<string, unknown>, key: string) {
  const value = headers[key]
  return typeof value === 'string' ? value : ''
}
