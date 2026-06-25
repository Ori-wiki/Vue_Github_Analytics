<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Command, GitCompareArrows, Search } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { routeNames } from '../router/routes'
import { useFavoritesStore } from '../stores/favorites'

const props = defineProps<{
  currentUsername: string
  repositories: Array<{ name: string; full_name: string }>
}>()

const router = useRouter()
const favoritesStore = useFavoritesStore()
const { recentProfiles, pinnedProfiles, quickComparePair } = storeToRefs(favoritesStore)
const isOpen = ref(false)
const query = ref('')

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

function openPalette(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    isOpen.value = true
  }

  if (event.key === 'Escape') {
    isOpen.value = false
  }
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

function searchUser() {
  const username = query.value.trim()

  if (username) {
    openUser(username)
  }
}

onMounted(() => window.addEventListener('keydown', openPalette))
onBeforeUnmount(() => window.removeEventListener('keydown', openPalette))
</script>

<template>
  <button class="btn-secondary" type="button" @click="isOpen = true">
    <Command class="size-4" />
    Ctrl+K
  </button>

  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/50 p-4" @click.self="isOpen = false">
      <section class="surface mx-auto mt-24 max-w-2xl overflow-hidden">
        <div class="flex items-center gap-3 border-b border-slate-200 p-4">
          <Search class="size-5 text-slate-400" />
          <input
            v-model="query"
            class="w-full bg-transparent text-base font-semibold text-slate-950 outline-none"
            placeholder="Search user, recent profile, repository..."
            type="search"
            @keydown.enter="searchUser"
          />
        </div>

        <div class="max-h-96 overflow-auto p-2">
          <button class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50" @click="searchUser">
            <Search class="size-4 text-emerald-600" />
            <span>Open user {{ query || currentUsername }}</span>
          </button>

          <button
            v-if="quickComparePair.length === 2"
            class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
            @click="openCompare"
          >
            <GitCompareArrows class="size-4 text-emerald-600" />
            <span>Quick compare @{{ quickComparePair[0] }} vs @{{ quickComparePair[1] }}</span>
          </button>

          <p class="metric-label px-3 pb-1 pt-3">Profiles</p>
          <button
            v-for="profile in profileSuggestions"
            :key="profile"
            class="flex w-full rounded-md px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50"
            @click="openUser(profile)"
          >
            @{{ profile }}
          </button>

          <p class="metric-label px-3 pb-1 pt-3">Repositories</p>
          <button
            v-for="repository in repositorySuggestions"
            :key="repository.full_name"
            class="flex w-full rounded-md px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50"
            @click="openRepository(repository.full_name)"
          >
            {{ repository.full_name }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
