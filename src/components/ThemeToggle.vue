<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    type="button"
    @click="toggleTheme"
  >
    <Sun v-if="isDark" class="size-4" />
    <Moon v-else class="size-4" />
  </button>
</template>
