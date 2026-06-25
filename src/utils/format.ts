import { formatDistanceToNow } from 'date-fns'

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: value >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDateDistance(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
