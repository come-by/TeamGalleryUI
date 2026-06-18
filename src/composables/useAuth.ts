import { computed } from 'vue'

import { useUserStore } from '@/stores/user'

/**
 * 认证状态管理组合式函数
 * 提供登录状态、管理员权限、token 校验和路由守卫功能
 *
 * @returns 认证状态和路由守卫方法
 */
export function useAuth() {
  const userStore = useUserStore()

  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const isAccessTokenExpired = computed(() => userStore.isAccessTokenExpired)
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

  /**
   * 校验 token 有效期。
   *
   * @returns 校验结果：valid / expired / missing
   */
  function checkTokenValidity() {
    return userStore.checkTokenValidity()
  }

  /**
   * 强制登出（会话过期）。
   *
   * @param reason - 登出原因，默认为"登录已过期，请重新登录"
   */
  function forceLogout(reason?: string) {
    userStore.forceLogout(reason)
  }

  return {
    isLoggedIn,
    isAccessTokenExpired,
    isAdmin,
    currentUser,
    nickname,
    requireAuth,
    requireAdmin,
    checkTokenValidity,
    forceLogout,
  }
}
