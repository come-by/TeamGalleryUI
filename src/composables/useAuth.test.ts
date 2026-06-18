import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

// Mock token 工具：使任意 token 字符串不会被判定为过期
vi.mock('@/utils/token', () => ({
  decodeToken: vi.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 })),
  isTokenExpired: vi.fn(() => false),
  willTokenExpireSoon: vi.fn(() => false),
}))

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should return not logged in state initially', () => {
    const auth = useAuth()
    expect(auth.isLoggedIn.value).toBe(false)
    expect(auth.isAdmin.value).toBe(false)
    expect(auth.currentUser.value).toBeNull()
  })

  it('should return logged in state after login', () => {
    const userStore = useUserStore()
    userStore.user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      nickname: 'Test User',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
    }
    userStore.token = 'test-token'

    const auth = useAuth()
    expect(auth.isLoggedIn.value).toBe(true)
    expect(auth.isAdmin.value).toBe(false)
    expect(auth.currentUser.value?.username).toBe('testuser')
    expect(auth.nickname.value).toBe('Test User')
  })

  it('should return admin state for admin user', () => {
    const userStore = useUserStore()
    userStore.user = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      nickname: 'Admin',
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z',
    }
    userStore.token = 'admin-token'

    const auth = useAuth()
    expect(auth.isAdmin.value).toBe(true)
  })

  it('should expose isAccessTokenExpired', () => {
    const auth = useAuth()
    expect(auth.isAccessTokenExpired.value).toBe(false)
  })

  it('checkTokenValidity should delegate to userStore', () => {
    const auth = useAuth()
    expect(auth.checkTokenValidity()).toBe('missing')
  })

  it('should require auth when not logged in', () => {
    const auth = useAuth()
    const result = auth.requireAuth()
    expect(result).not.toBeNull()
    expect(result?.path).toBe('/login')
    expect(result?.query?.redirect).toBeDefined()
  })

  it('should not require auth when logged in', () => {
    const userStore = useUserStore()
    userStore.user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      nickname: 'Test',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
    }
    userStore.token = 'token'

    const auth = useAuth()
    expect(auth.requireAuth()).toBeNull()
  })

  it('should require admin when not admin', () => {
    const userStore = useUserStore()
    userStore.user = {
      id: 1,
      username: 'user',
      email: 'user@example.com',
      nickname: 'User',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
    }
    userStore.token = 'token'

    const auth = useAuth()
    const result = auth.requireAdmin()
    expect(result).not.toBeNull()
    expect(result?.path).toBe('/')
  })

  it('should not require admin when is admin', () => {
    const userStore = useUserStore()
    userStore.user = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      nickname: 'Admin',
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z',
    }
    userStore.token = 'token'

    const auth = useAuth()
    expect(auth.requireAdmin()).toBeNull()
  })
})
