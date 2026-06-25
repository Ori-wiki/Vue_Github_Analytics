import { computed, ref } from 'vue'

type Theme = 'light' | 'dark'

const storageKey = 'github-analytics-theme'
const theme = ref<Theme>(getInitialTheme())

applyTheme(theme.value)

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    theme.value = isDark.value ? 'light' : 'dark'
    localStorage.setItem(storageKey, theme.value)
    applyTheme(theme.value)
  }

  return {
    theme,
    isDark,
    toggleTheme,
  }
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = localStorage.getItem(storageKey)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(nextTheme: Theme) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = nextTheme
}
