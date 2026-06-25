<script setup lang="ts">
import { computed, ref } from 'vue'
import { KeyRound, Trash2 } from '@lucide/vue'
import { clearGithubCache, getGithubUser } from '../api/github'
import { getRuntimeGithubToken, saveRuntimeGithubToken } from '../config/env'
import { clearGithubQueryCache } from '../queries/githubQueries'
import { useRateLimitStore } from '../stores/rateLimit'
import { useToastsStore } from '../stores/toasts'

const emit = defineEmits<{
  saved: []
}>()

const token = ref(getRuntimeGithubToken())
const isExpanded = ref(!token.value)
const tokenStatus = ref('')
const hasToken = computed(() => Boolean(token.value.trim()))
const rateLimitStore = useRateLimitStore()
const toastsStore = useToastsStore()

function saveToken() {
  saveRuntimeGithubToken(token.value)
  clearGithubCache()
  clearGithubQueryCache()
  rateLimitStore.refreshAuthMode()
  isExpanded.value = false
  tokenStatus.value = hasToken.value ? 'Token saved. Run test to verify access.' : 'Token removed.'
  toastsStore.push(hasToken.value ? 'Token saved' : 'Token removed', tokenStatus.value, 'success')
  emit('saved')
}

function clearToken() {
  token.value = ''
  saveToken()
}

async function testToken() {
  saveRuntimeGithubToken(token.value)
  clearGithubCache()
  clearGithubQueryCache()
  rateLimitStore.refreshAuthMode()

  try {
    await getGithubUser('octocat')
    tokenStatus.value = 'Token works. GraphQL and higher rate limits should be available.'
    toastsStore.push('Token works', 'Authenticated GitHub API mode is available.', 'success')
    emit('saved')
  } catch {
    tokenStatus.value = 'Token test failed. Check the token value and permissions.'
    toastsStore.push('Token test failed', tokenStatus.value, 'error')
  }
}
</script>

<template>
  <section class="surface p-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex gap-3">
        <div class="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700">
          <KeyRound class="size-5" />
        </div>
        <div>
          <h2 class="title-lg">GitHub token setup</h2>
          <p class="muted mt-1 text-sm leading-6">
            Без токена GitHub дает около 60 запросов в час. Токен повышает лимит до 5 000 запросов в час и включает
            настоящий contribution calendar через GraphQL.
          </p>
        </div>
      </div>

      <button class="btn-secondary" type="button" @click="isExpanded = !isExpanded">
        {{ isExpanded ? 'Hide setup' : hasToken ? 'Update token' : 'Add token' }}
      </button>
    </div>

    <div v-if="isExpanded" class="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
      <input v-model="token" class="control px-3 text-sm" placeholder="github_pat_..." type="password" />
      <button class="btn-primary" type="button" @click="saveToken">Save token</button>
      <button class="btn-secondary" type="button" @click="testToken">Test token</button>
      <button class="btn-secondary" type="button" @click="clearToken">
        <Trash2 class="size-4" />
        Clear
      </button>
      <p class="muted lg:col-span-4 text-xs leading-5">
        Создай fine-grained token в GitHub Settings -> Developer settings -> Personal access tokens. Для публичных
        данных достаточно read-only доступа.
      </p>
      <p
        v-if="tokenStatus"
        class="lg:col-span-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
      >
        {{ tokenStatus }}
      </p>
    </div>
  </section>
</template>
