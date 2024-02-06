
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MainDashboard.vue') }
    ],
    beforeEnter() {
      location.href = '/ui/dashboard'
    }
  },
  {
    name: 'trigger',
    path: '/ui/trigger',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ActionTrigger.vue') }
    ]
  },
  {
    name: 'dashboard',
    path: '/ui/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MainDashboard.vue') }
    ],
    meta: {
      showHome: false,
      showMainNavDrawer: true,
    }
  },
  {
    name: 'data-panels',
    path: '/ui/data-panels',
    props: true,
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DataPanels.vue') }
    ],
    meta: {
      showHome: true,
      showDataPanelsDrawer: true,
    }
  },
  {
    path: '/ui/settings-library',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SettingsLibrary.vue') }
    ],
    meta: {
      showHome: true,
      showSettingsDrawer: true,
    }
  },
  {
    path: '/ui/settings-workers',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SettingsWorkers.vue') }
    ],
    meta: {
      showHome: true,
      showSettingsDrawer: true,
    }
  },
  {
    path: '/ui/settings-plugins',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SettingsPlugins.vue') }
    ],
    meta: {
      showHome: true,
      showSettingsDrawer: true,
    }
  },
  {
    path: '/ui/settings-link',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SettingsLink.vue') }
    ],
    meta: {
      showHome: true,
      showSettingsDrawer: true,
    }
  },
  {
    path: '/ui/settings-support',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SettingsSupport.vue') }
    ],
    meta: {
      showHome: true,
      showSettingsDrawer: true,
    }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
