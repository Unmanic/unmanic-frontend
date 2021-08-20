const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Dashboard.vue') }
    ],
    meta: {
      showMainNavDrawer: true,
      showHome: false,
    }
  },
  {
    path: '/trigger',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Trigger.vue') }
    ]
  },
  {
    path: '/unmanic-dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Dashboard.vue') }
    ],
    meta: {
      showMainNavDrawer: true,
      showHome: false,
    }
  },
  {
    path: '/unmanic-settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LegacySettings.vue') }
    ],
    meta: {
      showHome: true,
      showSettingsDrawer: true,
    }
  },
  {
    path: '/unmanic-settings-library',
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
    path: '/unmanic-settings-plugins',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SettingsPlugins.vue') }
    ],
    meta: {
      showHome: true,
      showSettingsDrawer: true,
    }
  },

  // TODO: Remove beforeEnter() redirects once the pages are handled by this new frontend
  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Dashboard.vue') }
    ],
    beforeEnter() {
      location.href = '/settings/'
    }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
