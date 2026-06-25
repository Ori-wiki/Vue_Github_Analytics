export const runtimeTokenKey = 'github-analytics-token'

export const appEnv = {
  githubToken: import.meta.env.VITE_GITHUB_TOKEN as string | undefined,
  isDev: import.meta.env.DEV,
}

export function getRuntimeGithubToken() {
  return localStorage.getItem(runtimeTokenKey) || ''
}

export function getGithubToken() {
  return getRuntimeGithubToken() || appEnv.githubToken || ''
}

export function hasGithubToken() {
  return Boolean(getGithubToken())
}

export function saveRuntimeGithubToken(token: string) {
  const normalizedToken = token.trim()

  if (normalizedToken) {
    localStorage.setItem(runtimeTokenKey, normalizedToken)
  } else {
    localStorage.removeItem(runtimeTokenKey)
  }
}
