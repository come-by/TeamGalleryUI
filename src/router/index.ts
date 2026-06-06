import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/HomeView.vue'),
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { guest: true },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { guest: true },
      },
      {
        path: 'articles',
        name: 'Articles',
        component: () => import('@/views/article/ArticleListView.vue'),
      },
      {
        path: 'articles/:id',
        name: 'ArticleDetail',
        component: () => import('@/views/article/ArticleDetailView.vue'),
      },
      {
        path: 'articles/create',
        name: 'CreateArticle',
        component: () => import('@/views/article/CreateArticleView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'articles/:id/edit',
        name: 'EditArticle',
        component: () => import('@/views/article/EditArticleView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/search/SearchView.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/ProfileView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('@/views/user/FavoritesView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'likes',
        name: 'Likes',
        component: () => import('@/views/user/LikesView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UsersView.vue'),
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('@/views/admin/CommentsView.vue'),
      },
    ],
  },
  // 错误页面路由
  {
    path: '/error/:code(404|403|500|network)',
    name: 'Error',
    component: () => import('@/views/ErrorView.vue'),
  },
  // 404 通配符路由（必须放在最后）
  {
    path: '/:pathMatch(.*)*',
    redirect: '/error/404',
  },
]

declare module 'vue-router' {
  interface RouteMeta {
    guest?: boolean
    requiresAuth?: boolean
    requiresAdmin?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.guest && userStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }

  if (to.meta.requiresAdmin && userStore.user?.role !== 'admin') {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
