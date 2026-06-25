import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { getGithubErrorStatus } from './githubErrors'

describe('github error states', () => {
  it('detects not found users', () => {
    expect(getGithubErrorStatus(createAxiosError(404))).toBe('user-not-found')
  })

  it('detects API rate limit errors', () => {
    expect(getGithubErrorStatus(createAxiosError(403))).toBe('rate-limit')
    expect(getGithubErrorStatus(createAxiosError(429))).toBe('rate-limit')
  })

  it('detects network errors', () => {
    expect(getGithubErrorStatus(new AxiosError('Network Error'))).toBe('network-error')
  })
})

function createAxiosError(status: number) {
  return new AxiosError('GitHub error', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data: {},
  })
}
