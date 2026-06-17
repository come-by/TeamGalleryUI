/**
 * 会话监控
 *
 * 企业安全要求：
 * - 定时校验 token 有效期，过期则自动登出
 * - 页面从后台切回前台时重新校验，防止用户离开后 session 过期仍显示旧内容
 * - access token 即将过期时主动静默刷新
 */

import { onMounted, onUnmounted } from 'vue'

import { refreshToken } from '@/api/user'
import router from '@/router'
import { useUserStore } from '@/stores/user'

/** token 定时校验间隔（毫秒） */
const CHECK_INTERVAL = 60_000 // 60 秒

/**
 * 尝试刷新 token 并更新 store，失败不抛异常。
 *
 * @param userStore - 用户状态 store 实例
 * @param silent - true: 静默失败不登出 / false: 失败后返回 false 由调用方处理登出
 * @returns true 表示刷新成功；silent 模式下失败也返回 true
 */
async function tryRefresh(userStore: ReturnType<typeof useUserStore>, silent: boolean) {
  try {
    const res = await refreshToken()
    if (res.success && res.data?.access_token) {
      userStore.setTokens(res.data.access_token, res.data.refresh_token || userStore.refreshToken)
      return true
    }
  } catch {
    // 静默刷新失败不登出，等下次 API 401 处理
  }
  return !silent
}

/**
 * 会话监控组合式函数。
 *
 * 适合在受保护的 Layout 中调用（DefaultLayout / AdminLayout）。
 */
export function useSessionMonitor() {
  const userStore = useUserStore()
  let intervalId: ReturnType<typeof setInterval> | null = null

  /** 校验并尝试刷新 token */
  async function checkAndRefresh() {
    if (!userStore.isLoggedIn) return

    const state = userStore.checkTokenValidity()

    if (state === 'valid') return

    if (state === 'refresh') {
      await tryRefresh(userStore, true)
      return
    }

    if (state === 'expired') {
      const refreshed = await tryRefresh(userStore, false)
      if (!refreshed) {
        userStore.forceLogout()
        router.push('/login')
      }
      return
    }

    // invalid
    userStore.forceLogout()
    router.push('/login')
  }

  /** 页面可见性变化时校验 */
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      checkAndRefresh()
    }
  }

  onMounted(() => {
    checkAndRefresh()
    intervalId = setInterval(checkAndRefresh, CHECK_INTERVAL)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
}
