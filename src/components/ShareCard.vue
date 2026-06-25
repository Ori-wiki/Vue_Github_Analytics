<script setup lang="ts">
import { ImageDown } from '@lucide/vue'
import type { GithubUser, LanguageStat } from '../types/github'
import { formatNumber } from '../utils/format'

const props = defineProps<{
  user: GithubUser
  repositories: number
  stars: number
  languages: LanguageStat[]
}>()

async function downloadShareCard() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return
  }

  canvas.width = 1200
  canvas.height = 630
  ctx.fillStyle = '#0b1120'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#111827'
  ctx.fillRect(48, 48, 1104, 534)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2
  ctx.strokeRect(48, 48, 1104, 534)

  ctx.fillStyle = '#34d399'
  ctx.font = '700 28px Inter, sans-serif'
  ctx.fillText('GitHub Analytics', 88, 110)

  ctx.fillStyle = '#f8fafc'
  ctx.font = '900 72px Inter, sans-serif'
  ctx.fillText(`@${props.user.login}`, 88, 220)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 30px Inter, sans-serif'
  ctx.fillText(props.user.bio ?? 'Developer profile summary', 88, 280)

  const topLanguage = props.languages[0]?.name ?? 'Unknown'
  const metrics = [
    ['Repos', formatNumber(props.repositories)],
    ['Stars', formatNumber(props.stars)],
    ['Followers', formatNumber(props.user.followers)],
    ['Top language', topLanguage],
  ]

  metrics.forEach(([label, value], index) => {
    const x = 88 + index * 260
    ctx.fillStyle = '#94a3b8'
    ctx.font = '700 22px Inter, sans-serif'
    ctx.fillText(label, x, 420)
    ctx.fillStyle = '#f8fafc'
    ctx.font = '900 38px Inter, sans-serif'
    ctx.fillText(value, x, 470)
  })

  const link = document.createElement('a')
  link.download = `${props.user.login}-github-summary.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<template>
  <button class="btn-secondary" type="button" @click="downloadShareCard">
    <ImageDown class="size-4" />
    Share image
  </button>
</template>
