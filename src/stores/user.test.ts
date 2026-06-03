import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'

// Mock API 模块
vi.mock('@/api/user', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
}))

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('初始化状态', () => {
    it('应该初始化为空状态', () => {
      const store = useUserStore()
      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
      expect(store.user).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(store.isAdmin).toBe(false)
    })

    it('应该从 localStorage 恢复 token', () => {
      localStorage.setItem('access_token', 'existing-token')
      localStorage.setItem('refresh_token', 'existing-refresh-token')
      setActivePinia(createPinia())
      const store = useUserStore()
      expect(store.token).toBe('existing-token')
      expect(store.refreshToken).toBe('existing-refresh-token')
    })
  })

  describe('登录', () => {
    it('应该成功登录并保存双 token', async () => {
      const { login } = await import('@/api/user')
      vi.mocked(login).mockResolvedValue({
        success: true,
        data: {
          access_token: 'new-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          user: {
            id: 1,
            username: 'test',
            email: 'test@example.com',
            nickname: 'Test',
            role: 'user',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
          },
        },
      })

      const store = useUserStore()
      await store.login({ username: 'test', password: '123456' })

      expect(store.token).toBe('new-token')
      expect(store.refreshToken).toBe('new-refresh-token')
      expect(store.isLoggedIn).toBe(true)
      expect(localStorage.getItem('access_token')).toBe('new-token')
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token')
    })

    it('应该处理登录失败', async () => {
      const { login } = await import('@/api/user')
      vi.mocked(login).mockResolvedValue({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' },
      })

      const store = useUserStore()
      await store.login({ username: 'test', password: 'wrong' })

      expect(store.token).toBe('')
      expect(store.isLoggedIn).toBe(false)
    })
  })

  describe('登出', () => {
    it('应该清除所有状态和 token', async () => {
      const { login } = await import('@/api/user')
      vi.mocked(login).mockResolvedValue({
        success: true,
        data: {
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          user: {
            id: 1,
            username: 'test',
            email: 'test@example.com',
            nickname: 'Test',
            role: 'user',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
          },
        },
      })

      const store = useUserStore()
      await store.login({ username: 'test', password: '123456' })
      expect(store.isLoggedIn).toBe(true)

      store.logout()
      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
      expect(store.user).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('用户角色', () => {
    it('应该识别管理员用户', () => {
      const store = useUserStore()
      store.user = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        nickname: 'Admin',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(store.isAdmin).toBe(true)
    })

    it('应该识别普通用户', () => {
      const store = useUserStore()
      store.user = {
        id: 1,
        username: 'user',
        email: 'user@example.com',
        nickname: 'User',
        role: 'user',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(store.isAdmin).toBe(false)
    })
  })

  describe('计算属性', () => {
    it('应该正确返回 username', () => {
      const store = useUserStore()
      store.user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        nickname: 'Test',
        role: 'user',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(store.username).toBe('testuser')
    })

    it('应该优先返回 nickname', () => {
      const store = useUserStore()
      store.user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        nickname: 'Test Nickname',
        role: 'user',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(store.nickname).toBe('Test Nickname')
    })

    it('应该在没有 nickname 时返回 username', () => {
      const store = useUserStore()
      store.user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(store.nickname).toBe('testuser')
    })
  })
})
