import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import RepositoryDetailView from '../views/RepositoryDetailView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/user/vuejs',
    },
    {
      path: '/user/:username',
      name: 'user',
      component: DashboardView,
    },
    {
      path: '/compare/:username/:compareUsername',
      name: 'compare',
      component: DashboardView,
    },
    {
      path: '/repositories/:owner/:repo',
      name: 'repository-detail',
      component: RepositoryDetailView,
    },
  ],
})
