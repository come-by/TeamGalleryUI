import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserStore } from '@/stores/user'

// Mock token 工具：使任意 token 字符串不会被判定为过期
vi.mock('@/utils/token', () => ({
  decodeToken: vi.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 })),
  isTokenExpired: vi.fn(() => false),
  willTokenExpireSoon: vi.fn(() => false),
}))

// Mock API 模块
vi.mock('@/api/user', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
  logoutApi: vi.fn(),
  refreshToken: vi.fn(),
}))

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该初始化为空状态', () => {
      const store = useUserStore()
      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
      expect(store.user).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(store.isAdmin).toBe(false)
      expect(store.isAccessTokenExpired).toBe(false)
      expect(store.isRefreshTokenValid).toBe(false)
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
            phone: '13800001111',
            role: 'user',
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
            phone: '13800001111',
            role: 'user',
            created_at: '2024-01-01T00:00:00Z',
          },
        },
      })

      const store = useUserStore()
      await store.login({ username: 'test', password: '123456' })
      expect(store.isLoggedIn).toBe(true)

      await store.logout()
      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
      expect(store.user).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })

    it('应该在登出时调用服务端 logoutApi', async () => {
      const { logoutApi } = await import('@/api/user')
      vi.mocked(logoutApi).mockResolvedValue({ success: true })

      const store = useUserStore()
      store.token = 'test-token'
      store.refreshToken = 'test-refresh-token'

      await store.logout()
      expect(logoutApi).toHaveBeenCalledWith('test-refresh-token')
    })

    it('应该在 logoutApi 失败时也清除本地状态', async () => {
      const { logoutApi } = await import('@/api/user')
      vi.mocked(logoutApi).mockRejectedValue(new Error('Network error'))

      const store = useUserStore()
      store.token = 'test-token'
      store.refreshToken = 'test-refresh-token'

      await store.logout()
      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
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
        phone: '13800000001',
        role: 'admin',
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
        phone: '13800000002',
        role: 'user',
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
        phone: '13800001111',
        role: 'user',
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
        phone: '13800001111',
        role: 'user',
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
        phone: '13800001111',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(store.nickname).toBe('testuser')
    })
  })

  describe('checkTokenValidity', () => {
    it('无 token 时应返回 invalid', () => {
      const store = useUserStore()
      expect(store.checkTokenValidity()).toBe('invalid')
    })

    it('token 有效时应返回 valid', () => {
      const store = useUserStore()
      store.token = 'valid-token'
      store.refreshToken = 'valid-refresh'
      expect(store.checkTokenValidity()).toBe('valid')
    })
  })

  describe('forceLogout', () => {
    it('应该清除 token 并保留 reason', () => {
      const store = useUserStore()
      store.token = 'test-token'
      store.refreshToken = 'test-refresh'

      store.forceLogout('自定义原因')
      expect(store.token).toBe('')
      expect(store.refreshToken).toBe('')
      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })

  describe('setTokens / clearTokens', () => {
    it('setTokens 应该更新状态和 storage', () => {
      const store = useUserStore()
      store.setTokens('acc', 'ref')
      expect(store.token).toBe('acc')
      expect(store.refreshToken).toBe('ref')
      expect(localStorage.getItem('access_token')).toBe('acc')
    })

    it('clearTokens 应该清除状态和 storage', () => {
      localStorage.setItem('access_token', 'acc')
      localStorage.setItem('refresh_token', 'ref')
      setActivePinia(createPinia())
      const store = useUserStore()
      store.clearTokens()
      expect(store.token).toBe('')
      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })

  describe('注册', () => {
    it('应该成功注册', async () => {
      const { register } = await import('@/api/user')
      vi.mocked(register).mockResolvedValue({
        success: true,
        data: { message: '注册成功' },
      })

      const store = useUserStore()
      const res = await store.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password123',
      })

      expect(res.success).toBe(true)
      expect(register).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password123',
      })
    })

    it('应该处理注册失败', async () => {
      const { register } = await import('@/api/user')
      vi.mocked(register).mockResolvedValue({
        success: false,
        error: { code: 'USER_EXISTS', message: '用户名已存在' },
      })

      const store = useUserStore()
      const res = await store.register({
        username: 'existing',
        email: 'existing@example.com',
        password: 'Password123',
      })

      expect(res.success).toBe(false)
      expect(res.error?.code).toBe('USER_EXISTS')
    })

    it('应该处理注册异常', async () => {
      const { register } = await import('@/api/user')
      vi.mocked(register).mockRejectedValue(new Error('Network error'))

      const store = useUserStore()
      await expect(
        store.register({ username: 'test', email: 'test@example.com', password: 'Password123' }),
      ).rejects.toThrow('Network error')
    })
  })

  describe('fetchProfile', () => {
    it('应该成功获取用户资料', async () => {
      const { getProfile } = await import('@/api/user')
      vi.mocked(getProfile).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          nickname: 'Test',
          phone: '13800001111',
          role: 'user',
          created_at: '2024-01-01T00:00:00Z',
        },
      })

      const store = useUserStore()
      store.token = 'valid-token'
      await store.fetchProfile()

      expect(store.user?.username).toBe('testuser')
      expect(getProfile).toHaveBeenCalled()
    })

    it('无 token 时不应该请求', async () => {
      const store = useUserStore()
      await store.fetchProfile()

      expect(store.user).toBeNull()
    })

    it('应该处理获取资料失败', async () => {
      const { getProfile } = await import('@/api/user')
      vi.mocked(getProfile).mockResolvedValue({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '未授权' },
      })

      const store = useUserStore()
      store.token = 'expired-token'
      await store.fetchProfile()

      expect(store.user).toBeNull()
    })

    it('应该处理获取资料异常', async () => {
      const { getProfile } = await import('@/api/user')
      vi.mocked(getProfile).mockRejectedValue(new Error('Network error'))

      const store = useUserStore()
      store.token = 'valid-token'
      await store.fetchProfile()

      // 异常不应抛出，静默处理
      expect(store.user).toBeNull()
    })

    it('API 返回成功但无 data 时应保留 null', async () => {
      const { getProfile } = await import('@/api/user')
      vi.mocked(getProfile).mockResolvedValue({
        success: true,
        data: undefined,
      })

      const store = useUserStore()
      store.token = 'valid-token'
      await store.fetchProfile()

      expect(store.user).toBeNull()
    })
  })

  describe('login 错误处理', () => {
    it('应该处理登录异常', async () => {
      const { login } = await import('@/api/user')
      vi.mocked(login).mockRejectedValue(new Error('Network error'))

      const store = useUserStore()
      await expect(store.login({ username: 'test', password: '123456' })).rejects.toThrow(
        'Network error',
      )
      expect(store.token).toBe('')
      expect(store.isLoggedIn).toBe(false)
    })
  })
})
