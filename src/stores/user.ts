import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, getProfile } from '@/api/user'
import type { User, LoginParams, RegisterParams, LoginResponse, ApiResponse } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const username = computed(() => user.value?.username || '')
  const nickname = computed(() => user.value?.nickname || user.value?.username || '')

  const login = async (credentials: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    const res = await loginApi(credentials)
    if (res.success && res.data?.token) {
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      await fetchProfile()
    }
    return res
  }

  const register = async (data: RegisterParams): Promise<ApiResponse> => {
    return await registerApi(data)
  }

  const fetchProfile = async (): Promise<void> => {
    if (!token.value) return
    try {
      const res = await getProfile()
      if (res.success) {
        user.value = res.data || null
      }
    } catch (error) {
      console.error('获取用户资料失败:', error)
    }
  }

  const logout = (): void => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    username,
    nickname,
    login,
    register,
    fetchProfile,
    logout,
  }
})
