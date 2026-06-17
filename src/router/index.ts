import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from 'vue-router'

import { refreshToken } from '@/api/user'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useUserStore } from '@/stores/user'
import { isTokenExpired } from '@/utils/token'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        redirect: '/projects',
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
        meta: { keepAlive: true },
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
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/project/ProjectListView.vue'),
        meta: { keepAlive: true },
      },
      {
        path: 'projects/create',
        name: 'CreateProject',
        component: () => import('@/views/project/CreateProjectView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/project/ProjectDetailView.vue'),
      },
      {
        path: 'projects/:id/edit',
        name: 'EditProject',
        component: () => import('@/views/project/EditProjectView.vue'),
        meta: { requiresAuth: true },
      },
      // 操作手册路由（公开）
      {
        path: 'manuals',
        name: 'Manuals',
        component: () => import('@/views/manual/ManualListView.vue'),
        meta: { keepAlive: true },
      },
      {
        path: 'manuals/:id',
        name: 'ManualDetail',
        component: () => import('@/views/manual/ManualDetailView.vue'),
      },
      // 通知路由（需登录）
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/notification/NotificationListView.vue'),
        meta: { requiresAuth: true, keepAlive: true },
      },
      {
        path: 'notifications/:id',
        name: 'NotificationDetail',
        component: () => import('@/views/notification/NotificationDetailView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/search/SearchView.vue'),
        meta: { keepAlive: true },
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
        meta: { requiresAuth: true, keepAlive: true },
      },
      {
        path: 'likes',
        name: 'Likes',
        component: () => import('@/views/user/LikesView.vue'),
        meta: { requiresAuth: true, keepAlive: true },
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
        meta: { keepAlive: true },
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('@/views/admin/CommentsView.vue'),
        meta: { keepAlive: true },
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

/**
 * 处理 token 过期：主动检测 access token 是否过期，尝试静默刷新。
 *
 * 企业要求：不等到 API 返回 401 才拦截，路由跳转时就要检查。
 * 这样即使用户停留在页面上不动，下次导航时也会立即被拦截。
 *
 * @returns 是否已处理（重定向），调用方应直接 return
 */
async function handleTokenExpiry(): Promise<boolean> {
  const userStore = useUserStore()

  const accessExpired = isTokenExpired(userStore.token)
  const refreshValid = userStore.refreshToken && !isTokenExpired(userStore.refreshToken)

  if (!accessExpired) return false

  if (refreshValid) {
    const refreshed = await tryRefreshToken(userStore)
    if (!refreshed) {
      userStore.forceLogout()
      return false // 让 checkRoutePermissions 处理重定向
    }
    return false
  }

  // 两个 token 都过期 → 清除残留 token
  userStore.forceLogout()
  return false
}

/**
 * 尝试用 refresh token 换取新 access token。
 *
 * @param userStore - 用户状态 store 实例
 * @returns 是否刷新成功
 */
async function tryRefreshToken(userStore: ReturnType<typeof useUserStore>): Promise<boolean> {
  try {
    const res = await refreshToken()
    if (res.success && res.data?.access_token) {
      userStore.setTokens(res.data.access_token, res.data.refresh_token || userStore.refreshToken)
      return true
    }
  } catch {
    // 刷新失败
  }
  return false
}

/**
 * 根据路由元信息进行权限校验。
 *
 * @param to - 目标路由
 * @param _from - 来源路由
 * @param next - 导航守卫 next 回调
 */
function checkRoutePermissions(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.guest && userStore.isLoggedIn) {
    next({ name: 'Projects' })
    return
  }

  if (to.meta.requiresAdmin && userStore.user?.role !== 'admin') {
    next({ name: 'Projects' })
    return
  }

  next()
}

router.beforeEach(async (to, from, next) => {
  const handled = await handleTokenExpiry()
  if (handled) return
  checkRoutePermissions(to, from, next)
})

export default router
