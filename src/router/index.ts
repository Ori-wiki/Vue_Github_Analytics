import { createRouter, createWebHistory } from 'vue-router'
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
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/search',
      name: routeNames.search,
      component: () => import('../views/SearchView.vue'),
    },
    {
      path: '/compare/:username/:compareUsername',
      name: routeNames.compare,
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/compare/:username/:compareUsername/report',
      name: routeNames.compareReport,
      component: () => import('../views/CompareReportView.vue'),
    },
    {
      path: '/org/compare/:left/:right',
      name: routeNames.organizationCompare,
      component: () => import('../views/OrganizationCompareView.vue'),
    },
    {
      path: '/org/:org',
      name: routeNames.organization,
      component: () => import('../views/OrganizationView.vue'),
    },
    {
      path: '/repositories/:owner/:repo',
      name: routeNames.repositoryDetail,
      component: () => import('../views/RepositoryDetailView.vue'),
    },
  ],
})
