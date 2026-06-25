import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const recentKey = 'github-analytics-recent'
const pinnedKey = 'github-analytics-pinned'
const compareHistoryKey = 'github-analytics-compare-history'
const maxRecent = 8

export const useFavoritesStore = defineStore('favorites', () => {
  const recentProfiles = ref<string[]>(readList(recentKey))
  const pinnedProfiles = ref<string[]>(readList(pinnedKey))
  const compareHistory = ref<Array<[string, string]>>(readPairs(compareHistoryKey))

  const quickComparePair = computed(() => pinnedProfiles.value.slice(0, 2))

  function addRecent(username: string) {
    const normalizedUsername = username.trim()

    if (!normalizedUsername) {
      return
    }

    recentProfiles.value = [
      normalizedUsername,
      ...recentProfiles.value.filter((item) => item.toLowerCase() !== normalizedUsername.toLowerCase()),
    ].slice(0, maxRecent)
    saveList(recentKey, recentProfiles.value)
  }

  function togglePinned(username: string) {
    const normalizedUsername = username.trim()

    if (!normalizedUsername) {
      return
    }

    const exists = isPinned(normalizedUsername)
    pinnedProfiles.value = exists
      ? pinnedProfiles.value.filter((item) => item.toLowerCase() !== normalizedUsername.toLowerCase())
      : [normalizedUsername, ...pinnedProfiles.value]
    saveList(pinnedKey, pinnedProfiles.value)
  }

  function isPinned(username: string) {
    return pinnedProfiles.value.some((item) => item.toLowerCase() === username.toLowerCase())
  }

  function addComparePair(left: string, right: string) {
    const pair: [string, string] = [left.trim(), right.trim()]

    if (!pair[0] || !pair[1]) {
      return
    }

    const pairKey = pair.map((item) => item.toLowerCase()).join(':')
    compareHistory.value = [
      pair,
      ...compareHistory.value.filter(
        (item) => item.map((entry) => entry.toLowerCase()).join(':') !== pairKey,
      ),
    ].slice(0, maxRecent)
    localStorage.setItem(compareHistoryKey, JSON.stringify(compareHistory.value))
  }

  return {
    recentProfiles,
    pinnedProfiles,
    compareHistory,
    quickComparePair,
    addRecent,
    togglePinned,
    isPinned,
    addComparePair,
  }
})

function readList(key: string) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function saveList(key: string, value: string[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

function readPairs(key: string): Array<[string, string]> {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is [string, string] =>
            Array.isArray(item) &&
            typeof item[0] === 'string' &&
            typeof item[1] === 'string',
        )
      : []
  } catch {
    return []
  }
}
