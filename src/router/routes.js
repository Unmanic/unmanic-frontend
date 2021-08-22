const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Dashboard.vue') }
    ],
    beforeEnter() {
      location.href = '/ui/dashboard'
    }
  },
  {
    path: '/ui/trigger',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Trigger.vue') }
    ]
  },
  {
    path: '/ui/dashboard',
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

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
