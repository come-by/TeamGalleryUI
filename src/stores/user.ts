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
import { isTokenExpired, willTokenExpireSoon } from '@/utils/token'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('access_token') || '')
  const refreshToken = ref(localStorage.getItem('refresh_token') || '')
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

  /** refresh token 是否还有效 */
  const isRefreshTokenValid = computed(() => {
    return !!refreshToken.value && !isTokenExpired(refreshToken.value)
  })

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

  /**
   * 校验 token 有效期。
   *
   * 返回场景：
   * - 'valid'    — access token 有效，无需操作
   * - 'refresh'  — access token 即将过期，应主动刷新
   * - 'expired'  — access token 已过期，需用 refresh token
   * - 'invalid'  — 两个 token 都无效，必须重新登录
   *
   * @returns 校验结果：valid / refresh / expired / invalid
   */
  function checkTokenValidity(): 'valid' | 'refresh' | 'expired' | 'invalid' {
    if (!token.value) return 'invalid'

    if (isTokenExpired(token.value)) {
      // access token 已过期，看 refresh token
      if (refreshToken.value && !isTokenExpired(refreshToken.value)) {
        return 'expired'
      }
      return 'invalid'
    }

    // access token 即将过期，建议刷新
    if (willTokenExpireSoon(token.value, 300)) {
      return 'refresh'
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
   * 企业要求：登出必须同时撤销服务端 refresh token，防止 token 泄漏后被滥用。
   * 先调后端 /auth/logout 撤销 refresh token，再清除本地存储。
   */
  const logout = async (): Promise<void> => {
    if (refreshToken.value) {
      try {
        await logoutApi(refreshToken.value)
      } catch {
        // 即使后端调用失败也应清除本地状态（网络不可达等场景）
      }
    }
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
    isAccessTokenExpired,
    isRefreshTokenValid,
    checkTokenValidity,
    forceLogout,
    setTokens,
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
