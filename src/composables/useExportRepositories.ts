import type { GithubRepository } from '../types/github'
import { useToastsStore } from '../stores/toasts'
import { exportRepositoriesAsCsv, exportRepositoriesAsJson } from '../utils/exportRepositories'

export function useExportRepositories() {
  const toastsStore = useToastsStore()

  function exportJson(repositories: GithubRepository[], username: string) {
    exportRepositoriesAsJson(repositories, username)
    toastsStore.push('JSON export ready', `${repositories.length} repositories exported.`, 'success')
  }

  function exportCsv(repositories: GithubRepository[], username: string) {
    exportRepositoriesAsCsv(repositories, username)
    toastsStore.push('CSV export ready', `${repositories.length} repositories exported.`, 'success')
  }

  return {
    exportJson,
    exportCsv,
  }
}
