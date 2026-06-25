<script setup lang="ts">
import { Search } from '@lucide/vue'

defineProps<{
  isLoading: boolean
}>()

const model = defineModel<string>({ required: true })

defineEmits<{
  submit: []
}>()
</script>

<template>
  <form class="flex w-full flex-col gap-3 sm:flex-row" @submit.prevent="$emit('submit')">
    <label class="relative flex-1">
      <Search class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
      <input
        v-model="model"
        class="h-12 w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        placeholder="github username"
        type="search"
      />
    </label>

    <button
      class="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      :disabled="isLoading"
      type="submit"
    >
      {{ isLoading ? 'Loading...' : 'Analyze' }}
    </button>
  </form>
</template>
