import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  getProfile,
  login as loginApi,
  logoutApi,
  register as registerApi,
  updateProfile as updateProfileApi,
} from '@/api/user'
import type {
  ApiResponse,
  LoginParams,
  LoginResponse,
  ProfileUpdateParams,
  RegisterParams,
  User,
} from '@/types'
import { handleApiError } from '@/utils/error'
import { isTokenExpired } from '@/utils/token'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('access_token') || '')
  const user = ref<User | null>(null)

  /**
   * 当前是否处于登录状态。
   *
   * 企业要求：仅 token 字符串非空不够，必须 token 未过期才算已登录。
   * 这确保过期后页面不会继续展示受保护内容。
   */
  const isLoggedIn = computed(() => {
    if (!token.value) return false
    // 客户端主动校验 exp，不等 API 返回 401
    return !isTokenExpired(token.value)
  })

  /** token 是否已过期（已登录但 token 到期） */
  const isAccessTokenExpired = computed(() => {
    return !!token.value && isTokenExpired(token.value)
  })

  const isAdmin = computed(() => user.value?.role === 'admin')
  const username = computed(() => user.value?.username || '')
  const nickname = computed(() => user.value?.nickname || user.value?.username || '')
  const avatar = computed(() => user.value?.avatar || '')

  const setAccessToken = (accessToken: string): void => {
    token.value = accessToken
    localStorage.setItem('access_token', accessToken)
  }

  const clearTokens = (): void => {
    token.value = ''
    localStorage.removeItem('access_token')
  }

  /**
   * 校验 token 有效期。
   *
   * 注：RefreshToken 是 HttpOnly Cookie，前端无法解码校验。
   * 因此只能判断 access_token 状态。
   *
   * @returns 校验结果：valid / expired / missing
   */
  function checkTokenValidity(): 'valid' | 'expired' | 'missing' {
    if (!token.value) return 'missing'

    if (isTokenExpired(token.value)) {
      return 'expired'
    }

    return 'valid'
  }

  /**
   * 强制登出（会话过期）。
   *
   * 区别于手动登出：会显示"登录已过期"提示。
   *
   * @param reason - 登出原因，默认为"登录已过期，请重新登录"
   */
  function forceLogout(reason = '登录已过期，请重新登录'): void {
    clearTokens()
    user.value = null
    ElMessage.warning(reason)
  }

  const login = async (credentials: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    const res = await loginApi(credentials)
    if (res.success && res.data?.access_token) {
      setAccessToken(res.data.access_token)
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
        const data = res.data as unknown as Record<string, unknown> | null
        if (data && data.username) {
          // ProfileResponse 直接包含 username/email/nickname/phone 等字段
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

  const updateProfile = async (data: ProfileUpdateParams): Promise<ApiResponse<User>> => {
    const res = await updateProfileApi(data)
    if (res.success) {
      ElMessage.success('资料更新成功')
      // 更新本地用户状态
      await fetchProfile()
    } else {
      handleApiError(res.error)
    }
    return res
  }

  /**
   * 登出。
   *
   * 企业要求：登出必须调用后端 /auth/logout 清除 HttpOnly Cookie + 撤销 Refresh Token。
   * 即使后端调用失败也清除本地状态（网络不可达等场景）。
   */
  const logout = async (): Promise<void> => {
    try {
      await logoutApi()
    } catch {
      // 即使后端调用失败也应清除本地状态
    }
    clearTokens()
    user.value = null
  }

  return {
    token,
    user,
    isLoggedIn,
    isAccessTokenExpired,
    checkTokenValidity,
    forceLogout,
    setAccessToken,
    clearTokens,
    isAdmin,
    username,
    nickname,
    avatar,
    login,
    register,
    fetchProfile,
    updateProfile,
    logout,
  }
})
