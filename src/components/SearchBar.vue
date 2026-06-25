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
        class="control w-full pl-12 pr-4 text-base"
        placeholder="github username"
        type="search"
      />
    </label>

    <button
      class="btn-primary"
      :disabled="isLoading"
      type="submit"
    >
      {{ isLoading ? 'Loading...' : 'Analyze' }}
    </button>
  </form>
</template>
