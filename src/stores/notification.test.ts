import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useNotificationStore } from '@/stores/notification'

// Mock notification API
vi.mock('@/api/notification', () => ({
  getUnreadCount: vi.fn(),
  markAllRead: vi.fn(),
}))

describe('useNotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始化状态', () => {
    it('应该初始化为空状态', () => {
      const store = useNotificationStore()
      expect(store.unreadCount).toBe(0)
      expect(store.hasUnread).toBe(false)
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchUnreadCount', () => {
    it('应该成功获取未读数量', async () => {
      const { getUnreadCount } = await import('@/api/notification')
      vi.mocked(getUnreadCount).mockResolvedValue({
        success: true,
        data: { unread_count: 5 },
      })

      const store = useNotificationStore()
      await store.fetchUnreadCount()

      expect(store.unreadCount).toBe(5)
      expect(store.hasUnread).toBe(true)
      expect(store.loading).toBe(false)
    })

    it('应该处理 API 失败静默降级', async () => {
      const { getUnreadCount } = await import('@/api/notification')
      vi.mocked(getUnreadCount).mockRejectedValue(new Error('Network error'))

      const store = useNotificationStore()
      await store.fetchUnreadCount()

      // 静默失败，状态保持不变
      expect(store.unreadCount).toBe(0)
      expect(store.loading).toBe(false)
    })
  })

  describe('markAllRead', () => {
    it('应该成功标记全部已读并清零', async () => {
      const { markAllRead } = await import('@/api/notification')

      // 先设置未读状态
      const { getUnreadCount } = await import('@/api/notification')
      vi.mocked(getUnreadCount).mockResolvedValue({
        success: true,
        data: { unread_count: 3 },
      })

      vi.mocked(markAllRead).mockResolvedValue({ success: true })

      const store = useNotificationStore()
      await store.fetchUnreadCount()
      expect(store.unreadCount).toBe(3)

      await store.markAllRead()
      expect(store.unreadCount).toBe(0)
    })

    it('应该处理标记已读失败静默降级', async () => {
      const { markAllRead } = await import('@/api/notification')
      vi.mocked(markAllRead).mockRejectedValue(new Error('Network error'))

      const store = useNotificationStore()
      // 不应抛出异常
      await expect(store.markAllRead()).resolves.toBeUndefined()
    })
  })
})
