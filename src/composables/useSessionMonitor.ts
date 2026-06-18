/**
 * 会话监控
 *
 * 企业安全要求：
 * - 定时校验 token 有效期，过期则尝试刷新
 * - 页面从后台切回前台时重新校验，防止用户离开后 session 过期仍显示旧内容
 * - access token 即将过期/已过期时主动静默刷新
 *
 * 注：RefreshToken 为 HttpOnly Cookie，前端不可见，刷新请求由浏览器自动携带 Cookie。
 */

import { onMounted, onUnmounted } from 'vue'

import { refreshToken } from '@/api/user'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { willTokenExpireSoon } from '@/utils/token'

/** token 定时校验间隔（毫秒） */
const CHECK_INTERVAL = 60_000 // 60 秒

/**
 * 尝试刷新 token 并更新 store，失败不抛异常。
 *
 * @param userStore - 用户状态 store 实例
 */
async function tryRefresh(userStore: ReturnType<typeof useUserStore>) {
  try {
    const res = await refreshToken()
    if (res.success && res.data?.access_token) {
      userStore.setAccessToken(res.data.access_token)
    }
  } catch {
    // 静默刷新失败，等待 API 401 处理
  }
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

    if (state === 'valid' && !willTokenExpireSoon(userStore.token, 300)) {
      return
    }

    // 即将过期或已过期 → 尝试刷新
    await tryRefresh(userStore)

    // 如果刷新后仍无效（expired），强制登出
    if (userStore.checkTokenValidity() === 'expired') {
      userStore.forceLogout()
      router.push('/login')
    }
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
