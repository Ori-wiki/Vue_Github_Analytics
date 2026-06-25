import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { githubQueryClient } from './queries/queryClient'

async function enableMocking() {
  if (import.meta.env.VITE_USE_MSW !== 'true') {
    return
  }

  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

void enableMocking().then(() => {
  createApp(App)
    .use(createPinia())
    .use(VueQueryPlugin, { queryClient: githubQueryClient })
    .use(router)
    .mount('#app')
})
