<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Command, GitCompareArrows, Search } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { routeNames } from '../router/routes'
import { useFavoritesStore } from '../stores/favorites'

const props = defineProps<{
  currentUsername: string
  repositories: Array<{ name: string; full_name: string }>
}>()

type PaletteAction = {
  id: string
  label: string
  icon: 'search' | 'compare'
  run: () => void
}

const router = useRouter()
const favoritesStore = useFavoritesStore()
const { recentProfiles, pinnedProfiles, quickComparePair } = storeToRefs(favoritesStore)
const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const paletteRef = ref<HTMLElement | null>(null)

const profileSuggestions = computed(() => {
  const source = [...pinnedProfiles.value, ...recentProfiles.value]
  return Array.from(new Set(source)).filter((item) =>
    item.toLowerCase().includes(query.value.trim().toLowerCase()),
  )
})

const repositorySuggestions = computed(() =>
  props.repositories
    .filter((repository) => repository.name.toLowerCase().includes(query.value.trim().toLowerCase()))
    .slice(0, 6),
)

const actions = computed<PaletteAction[]>(() => {
  const normalizedQuery = query.value.trim()
  const nextActions: PaletteAction[] = [
    {
      id: 'search',
      label: `Search GitHub for ${normalizedQuery || props.currentUsername}`,
      icon: 'search',
      run: () => openSearch(normalizedQuery || props.currentUsername),
    },
  ]

  if (quickComparePair.value.length === 2) {
    nextActions.push({
      id: 'compare',
      label: `Quick compare @${quickComparePair.value[0]} vs @${quickComparePair.value[1]}`,
      icon: 'compare',
      run: openCompare,
    })
  }

  for (const profile of profileSuggestions.value) {
    nextActions.push({
      id: `profile-${profile}`,
      label: `Open @${profile}`,
      icon: 'search',
      run: () => openUser(profile),
    })
  }

  for (const repository of repositorySuggestions.value) {
    nextActions.push({
      id: `repo-${repository.full_name}`,
      label: repository.full_name,
      icon: 'search',
      run: () => openRepository(repository.full_name),
    })
  }

  return nextActions
})

watch(isOpen, async (value) => {
  if (!value) {
    activeIndex.value = 0
    return
  }

  await nextTick()
  inputRef.value?.focus()
})

watch(actions, () => {
  activeIndex.value = Math.min(activeIndex.value, Math.max(actions.value.length - 1, 0))
})

function handleGlobalKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    isOpen.value = true
  }
}

function handlePaletteKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    isOpen.value = false
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % actions.value.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + actions.value.length) % actions.value.length
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    actions.value[activeIndex.value]?.run()
    return
  }

  if (event.key === 'Tab') {
    trapFocus(event)
  }
}

function trapFocus(event: KeyboardEvent) {
  const focusable = Array.from(
    paletteRef.value?.querySelectorAll<HTMLElement>('input, button, [href], [tabindex]:not([tabindex="-1"])') ?? [],
  )

  if (!focusable.length) {
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function openSearch(value: string) {
  isOpen.value = false
  void router.push({ name: routeNames.search, query: { q: value } })
}

function openUser(username: string) {
  isOpen.value = false
  void router.push({ name: routeNames.user, params: { username } })
}

function openRepository(fullName: string) {
  const [owner, repo] = fullName.split('/')
  isOpen.value = false
  void router.push({ name: routeNames.repositoryDetail, params: { owner, repo } })
}

function openCompare() {
  if (quickComparePair.value.length === 2) {
    isOpen.value = false
    void router.push({
      name: routeNames.compare,
      params: { username: quickComparePair.value[0], compareUsername: quickComparePair.value[1] },
    })
  }
}

onMounted(() => window.addEventListener('keydown', handleGlobalKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleGlobalKeydown))
</script>

<template>
  <button class="btn-secondary" type="button" aria-haspopup="dialog" @click="isOpen = true">
    <Command class="size-4" />
    Ctrl+K
  </button>

  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      @click.self="isOpen = false"
      @keydown="handlePaletteKeydown"
    >
      <section ref="paletteRef" class="surface mx-auto mt-24 max-w-2xl overflow-hidden">
        <div class="flex items-center gap-3 border-b border-slate-200 p-4">
          <Search class="size-5 text-slate-400" />
          <input
            ref="inputRef"
            v-model="query"
            class="w-full bg-transparent text-base font-semibold text-slate-950 outline-none"
            placeholder="Search GitHub, recent profile, repository..."
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-actions"
            :aria-activedescendant="actions[activeIndex]?.id"
            type="search"
          />
        </div>

        <div id="command-palette-actions" class="max-h-96 overflow-auto p-2" role="listbox">
          <button
            v-for="(action, index) in actions"
            :id="action.id"
            :key="action.id"
            class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold"
            :class="index === activeIndex ? 'bg-slate-100 text-slate-950' : 'hover:bg-slate-50'"
            role="option"
            :aria-selected="index === activeIndex"
            type="button"
            @mouseenter="activeIndex = index"
            @click="action.run"
          >
            <GitCompareArrows v-if="action.icon === 'compare'" class="size-4 text-emerald-600" />
            <Search v-else class="size-4 text-emerald-600" />
            <span>{{ action.label }}</span>
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
