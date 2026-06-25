<template>
  <RouterView />
  <ToastHost />
  <VueQueryDevtools v-if="appEnv.isDev" />
</template>

<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import ToastHost from './components/ToastHost.vue'
import { appEnv } from './config/env'
</script>
