<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  description: string
  icon: Component
  tone?: 'info' | 'warning' | 'error'
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <section
    class="rounded-lg border p-6 shadow-sm"
    :class="{
      'border-slate-200 bg-white text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.08)]': !tone || tone === 'info',
      'border-amber-200 bg-amber-50 text-amber-800': tone === 'warning',
      'border-red-200 bg-red-50 text-red-800': tone === 'error',
    }"
  >
    <div class="flex items-start gap-4">
      <div
        class="grid size-11 shrink-0 place-items-center rounded-md"
        :class="{
          'bg-slate-100 text-slate-600': !tone || tone === 'info',
          'bg-amber-100 text-amber-700': tone === 'warning',
          'bg-red-100 text-red-700': tone === 'error',
        }"
      >
        <component :is="icon" class="size-5" />
      </div>

      <div class="flex-1">
        <h2 class="text-base font-bold">{{ title }}</h2>
        <p class="mt-1 text-sm leading-6 opacity-80">{{ description }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button class="btn-secondary h-9 px-3" type="button" @click="$emit('retry')">
            Retry
          </button>
          <slot name="actions" />
        </div>
      </div>
    </div>
  </section>
</template>
