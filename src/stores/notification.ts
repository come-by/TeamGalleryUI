import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getUnreadCount, markAllRead as markAllReadApi } from '@/api/notification'
import { addBreadcrumb } from '@/utils/error-report'

/**
 * 通知状态管理 Store
 * 管理未读通知数量、加载状态和已读标记操作
 */
export const useNotificationStore = defineStore('notification', () => {
  /** 未读通知数量 */
  const unreadCount = ref(0)
  /** 加载状态 */
  const loading = ref(false)

  /** 是否有未读通知 */
  const hasUnread = computed(() => unreadCount.value > 0)

  /**
   * 获取未读通知数量
   */
  const fetchUnreadCount = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await getUnreadCount()
      if (res.success && res.data) {
        unreadCount.value = res.data.unread_count
      }
    } catch (error) {
      addBreadcrumb('获取未读通知数失败', 'notification.fetchUnreadCount', 'warning')
    } finally {
      loading.value = false
    }
  }

  /**
   * 标记全部通知为已读
   */
  const markAllRead = async (): Promise<void> => {
    try {
      const res = await markAllReadApi()
      if (res.success) {
        unreadCount.value = 0
      }
    } catch (error) {
      addBreadcrumb('标记全部已读失败', 'notification.markAllRead', 'warning')
    }
  }

  return {
    unreadCount,
    loading,
    hasUnread,
    fetchUnreadCount,
    markAllRead,
  }
})
