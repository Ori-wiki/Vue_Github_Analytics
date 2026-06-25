import type { AppError, AppErrorCode } from '../types/github'
import { getGithubErrorMessage, getGithubErrorStatus } from './githubErrors'

export function toAppError(error: unknown, fallback = 'Something went wrong.'): AppError {
  const status = getGithubErrorStatus(error)
  const code = toAppErrorCode(status)

  return {
    code,
    message: getGithubErrorMessage(error, fallback),
    action: code === 'rate-limit' ? 'add-token' : code === 'network' ? 'retry' : undefined,
  }
}

export function toAppErrorCode(status: string): AppErrorCode {
  if (status === 'user-not-found') {
    return 'not-found'
  }

  if (status === 'rate-limit') {
    return 'rate-limit'
  }

  if (status === 'network-error') {
    return 'network'
  }

  return 'unknown'
}
