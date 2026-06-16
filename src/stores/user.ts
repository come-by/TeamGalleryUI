import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getProfile, login as loginApi, register as registerApi } from '@/api/user'
import type { ApiResponse, LoginParams, LoginResponse, RegisterParams, User } from '@/types'
import { handleApiError } from '@/utils/error'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('access_token') || '')
  const refreshToken = ref(localStorage.getItem('refresh_token') || '')
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const username = computed(() => user.value?.username || '')
  const nickname = computed(() => user.value?.nickname || user.value?.username || '')
  const avatar = computed(() => user.value?.avatar || '')

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
    const res = await loginApi(credentials)
    if (res.success && res.data?.access_token) {
      setTokens(res.data.access_token, res.data.refresh_token)
      // 直接使用登录响应中的用户信息
      if (res.data.user) {
        user.value = res.data.user as User
      }
      // 异步获取完整用户资料，不阻塞登录流程
      fetchProfile()
      ElMessage.success('登录成功')
    } else {
      handleApiError(res.error)
    }
    return res
  }

  const register = async (data: RegisterParams): Promise<ApiResponse> => {
    const res = await registerApi(data)
    if (res.success) {
      ElMessage.success('注册成功')
    } else {
      handleApiError(res.error)
    }
    return res
  }

  const fetchProfile = async (): Promise<void> => {
    if (!token.value) return
    try {
      const res = await getProfile()
      if (res.success) {
        // Go 后端 GetProfile 可能返回 UserProfile 嵌套结构，提取内层 user
        const data = res.data as unknown as Record<string, unknown> | null
        if (data && data.user) {
          user.value = data.user as User
        } else if (data && data.username) {
          user.value = data as unknown as User
        } else {
          user.value = null
        }
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
    avatar,
    login,
    register,
    fetchProfile,
    logout,
  }
})
