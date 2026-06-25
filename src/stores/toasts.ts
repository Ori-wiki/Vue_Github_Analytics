import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastTone = 'success' | 'warning' | 'error' | 'info'

export type ToastMessage = {
  id: number
  title: string
  description?: string
  tone: ToastTone
}

export const useToastsStore = defineStore('toasts', () => {
  const messages = ref<ToastMessage[]>([])
  let nextId = 1

  function push(title: string, description?: string, tone: ToastTone = 'info') {
    const id = nextId++
    messages.value.push({ id, title, description, tone })
    window.setTimeout(() => remove(id), 4200)
  }

  function remove(id: number) {
    messages.value = messages.value.filter((message) => message.id !== id)
  }

  return {
    messages,
    push,
    remove,
  }
})
