import type { GithubRepository } from '../types/github'

export function exportRepositoriesAsJson(repositories: GithubRepository[], username: string) {
  downloadFile(
    `${username}-repositories.json`,
    JSON.stringify(repositories.map(toExportRow), null, 2),
    'application/json',
  )
}

export function exportRepositoriesAsCsv(repositories: GithubRepository[], username: string) {
  downloadFile(`${username}-repositories.csv`, createRepositoriesCsv(repositories), 'text/csv')
}

export function createRepositoriesCsv(repositories: GithubRepository[]) {
  const rows = repositories.map(toExportRow)
  const headers = ['name', 'description', 'language', 'stars', 'forks', 'issues', 'url', 'created_at', 'updated_at']

  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header as keyof typeof row])).join(',')),
  ].join('\n')
}

function toExportRow(repository: GithubRepository) {
  return {
    name: repository.name,
    description: repository.description ?? '',
    language: repository.language ?? 'Other',
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    issues: repository.open_issues_count,
    url: repository.html_url,
    created_at: repository.created_at,
    updated_at: repository.updated_at,
  }
}

function escapeCsv(value: string | number) {
  const text = String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportJsonFile(filename: string, data: unknown) {
  downloadFile(filename, JSON.stringify(data, null, 2), 'application/json')
}
