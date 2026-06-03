import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { handleApiError } from '@/utils/error'
import { login as loginApi, register as registerApi, getProfile } from '@/api/user'
import type { User, LoginParams, RegisterParams, LoginResponse, ApiResponse } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('access_token') || '')
  const refreshToken = ref(localStorage.getItem('refresh_token') || '')
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const username = computed(() => user.value?.username || '')
  const nickname = computed(() => user.value?.nickname || user.value?.username || '')

  const setTokens = (accessToken: string, newRefreshToken: string): void => {
    token.value = accessToken
    refreshToken.value = newRefreshToken
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', newRefreshToken)
  }

  const clearTokens = (): void => {
    token.value = ''
    refreshToken.value = ''
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const login = async (credentials: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    try {
      const res = await loginApi(credentials)
      if (res.success && res.data?.access_token) {
        setTokens(res.data.access_token, res.data.refresh_token)
        await fetchProfile()
        ElMessage.success('登录成功')
      } else {
        handleApiError(res.error)
      }
      return res
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  const register = async (data: RegisterParams): Promise<ApiResponse> => {
    try {
      const res = await registerApi(data)
      if (res.success) {
        ElMessage.success('注册成功')
      } else {
        handleApiError(res.error)
      }
      return res
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  const fetchProfile = async (): Promise<void> => {
    if (!token.value) return
    try {
      const res = await getProfile()
      if (res.success) {
        user.value = res.data || null
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
    }
  }

  const logout = (): void => {
    token.value = ''
    refreshToken.value = ''
    user.value = null
    clearTokens()
  }

  return {
    token,
    refreshToken,
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
