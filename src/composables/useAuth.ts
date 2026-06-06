import { computed } from 'vue'

import { useUserStore } from '@/stores/user'

/**
 * 认证状态管理组合式函数
 * 提供登录状态、管理员权限和路由守卫功能
 *
 * @returns 认证状态和路由守卫方法
 */
export function useAuth() {
  const userStore = useUserStore()

  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const isAdmin = computed(() => userStore.isAdmin)
  const currentUser = computed(() => userStore.user)
  const nickname = computed(() => userStore.nickname)

  function requireAuth(redirectPath = '/login') {
    if (!isLoggedIn.value) {
      return { path: redirectPath, query: { redirect: window.location.pathname } }
    }
    return null
  }

  function requireAdmin(redirectPath = '/') {
    if (!isAdmin.value) {
      return { path: redirectPath }
    }
    return null
  }

  return {
    isLoggedIn,
    isAdmin,
    currentUser,
    nickname,
    requireAuth,
    requireAdmin,
  }
}
