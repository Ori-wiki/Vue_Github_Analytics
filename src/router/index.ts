import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import OrganizationView from '../views/OrganizationView.vue'
import RepositoryDetailView from '../views/RepositoryDetailView.vue'
import { routeNames } from './routes'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/user/vuejs',
    },
    {
      path: '/user/:username',
      name: routeNames.user,
      component: DashboardView,
    },
    {
      path: '/compare/:username/:compareUsername',
      name: routeNames.compare,
      component: DashboardView,
    },
    {
      path: '/org/:org',
      name: routeNames.organization,
      component: OrganizationView,
    },
    {
      path: '/repositories/:owner/:repo',
      name: routeNames.repositoryDetail,
      component: RepositoryDetailView,
    },
  ],
})
