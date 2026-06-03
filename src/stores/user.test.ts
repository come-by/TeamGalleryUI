import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'

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

  it('should initialize with empty state', () => {
    const store = useUserStore()
    expect(store.token).toBe('')
    expect(store.user).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(store.isAdmin).toBe(false)
  })

  it('should set token from localStorage on init', () => {
    localStorage.setItem('access_token', 'existing-token')
    localStorage.setItem('refresh_token', 'existing-refresh-token')
    setActivePinia(createPinia())
    const store = useUserStore()
    expect(store.token).toBe('existing-token')
    expect(store.refreshToken).toBe('existing-refresh-token')
  })

  it('should login successfully', async () => {
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

  it('should handle login failure', async () => {
    const { login } = await import('@/api/user')
    vi.mocked(login).mockResolvedValue({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
    })

    const store = useUserStore()
    await store.login({ username: 'test', password: 'wrong' })

    expect(store.token).toBe('')
    expect(store.isLoggedIn).toBe(false)
  })

  it('should logout and clear state', async () => {
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

  it('should identify admin user', () => {
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

  it('should identify regular user', () => {
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
