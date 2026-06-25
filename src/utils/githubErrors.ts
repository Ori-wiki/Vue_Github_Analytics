import { isAxiosError } from 'axios'
import type { AppStatus } from '../types/github'

export function getGithubErrorStatus(error: unknown): AppStatus {
  if (!isAxiosError(error)) {
    return 'error'
  }

  if (!error.response) {
    return 'network-error'
  }

  if (error.response.status === 404) {
    return 'user-not-found'
  }

  if (error.response.status === 403 || error.response.status === 429) {
    return 'rate-limit'
  }

  return 'error'
}

export function getStatusMessage(status: AppStatus) {
  const messages: Record<AppStatus, string> = {
    idle: '',
    loading: 'Loading GitHub profile...',
    ready: '',
    'user-not-found': 'Пользователь не найден. Проверь username и попробуй еще раз.',
    'rate-limit': 'Превышен лимит GitHub API. Добавь VITE_GITHUB_TOKEN в .env или попробуй позже.',
    'network-error': 'Ошибка сети. Проверь подключение к интернету и повтори запрос.',
    error: 'Что-то пошло не так при запросе к GitHub API.',
  }

  return messages[status]
}

export function getGithubErrorMessage(error: unknown, fallback = 'Не удалось загрузить данные GitHub.') {
  const status = getGithubErrorStatus(error)

  if (status !== 'rate-limit' || !isAxiosError(error)) {
    return getStatusMessage(status) || fallback
  }

  const resetHeader = error.response?.headers?.['x-ratelimit-reset']
  const resetAt =
    typeof resetHeader === 'string'
      ? new Date(Number(resetHeader) * 1000).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null

  return resetAt
    ? `Превышен лимит GitHub API. Лимит обновится примерно в ${resetAt}. Добавь VITE_GITHUB_TOKEN в .env, чтобы увеличить лимит.`
    : getStatusMessage('rate-limit')
}
