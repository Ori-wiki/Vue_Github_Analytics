<script setup lang="ts">
import { X } from '@lucide/vue'
import { useToastsStore } from '../stores/toasts'

const toastsStore = useToastsStore()
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
    <div
      v-for="message in toastsStore.messages"
      :key="message.id"
      class="surface flex gap-3 p-4 shadow-xl shadow-slate-950/10"
      :class="{
        'border-emerald-200': message.tone === 'success',
        'border-amber-200': message.tone === 'warning',
        'border-red-200': message.tone === 'error',
        'border-slate-200': message.tone === 'info',
      }"
    >
      <div
        class="mt-1 size-2 shrink-0 rounded-full"
        :class="{
          'bg-emerald-500': message.tone === 'success',
          'bg-amber-500': message.tone === 'warning',
          'bg-red-500': message.tone === 'error',
          'bg-slate-500': message.tone === 'info',
        }"
      />
      <div class="min-w-0 flex-1">
        <p class="text-sm font-black text-slate-950">{{ message.title }}</p>
        <p v-if="message.description" class="muted mt-1 text-xs leading-5">{{ message.description }}</p>
      </div>
      <button
        class="grid size-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
        type="button"
        :aria-label="`Close ${message.title}`"
        @click="toastsStore.remove(message.id)"
      >
        <X class="size-4" />
      </button>
    </div>
  </div>
</template>
