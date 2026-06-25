import axios from 'axios'
import type { GithubEvent, GithubRepository, GithubUser } from '../types/github'

const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
  },
})

github.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export async function getGithubUser(username: string) {
  const { data } = await github.get<GithubUser>(`/users/${username}`)
  return data
}

export async function getGithubRepositories(username: string) {
  const { data } = await github.get<GithubRepository[]>(`/users/${username}/repos`, {
    params: {
      per_page: 100,
      sort: 'updated',
      direction: 'desc',
    },
  })

  return data
}

export async function getGithubEvents(username: string) {
  const { data } = await github.get<GithubEvent[]>(`/users/${username}/events/public`, {
    params: {
      per_page: 100,
    },
  })

  return data
}
