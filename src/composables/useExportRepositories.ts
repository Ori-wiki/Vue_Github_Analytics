import type { GithubRepository } from '../types/github'
import { exportRepositoriesAsCsv, exportRepositoriesAsJson } from '../utils/exportRepositories'

export function useExportRepositories() {
  function exportJson(repositories: GithubRepository[], username: string) {
    exportRepositoriesAsJson(repositories, username)
  }

  function exportCsv(repositories: GithubRepository[], username: string) {
    exportRepositoriesAsCsv(repositories, username)
  }

  return {
    exportJson,
    exportCsv,
  }
}
