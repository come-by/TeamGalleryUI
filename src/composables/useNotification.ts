import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'

let pollTimer: ReturnType<typeof setInterval> | null = null

/**
 * 通知组合式函数
 * 提供通知轮询、弹窗和导航功能
 *
 * @returns 通知相关状态和方法
 */
export function useNotification() {
  const notificationStore = useNotificationStore()
  const userStore = useUserStore()
  const router = useRouter()
  const popoverVisible = ref(false)

  const startPolling = (intervalMs = 30000) => {
    stopPolling()
    if (userStore.isLoggedIn) {
      notificationStore.fetchUnreadCount()
      pollTimer = setInterval(() => {
        notificationStore.fetchUnreadCount()
      }, intervalMs)
    }
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  const goToNotifications = async () => {
    popoverVisible.value = false
    await notificationStore.markAllRead()
    router.push('/notifications')
  }

  onMounted(() => {
    if (userStore.isLoggedIn) {
      startPolling()
    }
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    popoverVisible,
    startPolling,
    stopPolling,
    goToNotifications,
    notificationStore,
  }
}
