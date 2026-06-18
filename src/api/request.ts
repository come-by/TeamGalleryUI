import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

import router from '@/router'
import type { ApiError, ApiResponse, PaginatedResponse, User } from '@/types'
import {
  handleApiError,
  handleValidationError,
  isUnauthorized,
  isValidationError,
} from '@/utils/error'
import { reportApiError } from '@/utils/error-report'

export type { ApiResponse, PaginatedResponse, User }

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求共享：相同请求共享同一个 Promise
const pendingRequests = new Map<string, Promise<unknown>>()

const generateRequestKey = (config: AxiosRequestConfig): string => {
  return `${config.method || 'get'}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`
}

// Token 刷新相关
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const setAccessToken = (token: string): void => {
  localStorage.setItem('access_token', token)
}

const clearAuth = (): void => {
  localStorage.removeItem('access_token')
}

/**
 * 刷新 Access Token
 *
 * RefreshToken 通过 HttpOnly Cookie 自动携带，无需手动管理。
 *
 * @returns 新的 AccessToken 字符串
 */
const refreshAccessToken = async (): Promise<string> => {
  const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`)

  if (response.data?.success && response.data.data?.access_token) {
    const { access_token } = response.data.data
    setAccessToken(access_token)
    return access_token
  }

  throw new Error('Token refresh failed')
}

// 网络重试
const MAX_RETRIES = 2
const RETRY_DELAY = 1000

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  // eslint-disable-next-line complexity
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    const originalRequest = error.config

    // 网络错误重试
    if (originalRequest && !originalRequest._retry && originalRequest._retryCount < MAX_RETRIES) {
      const isNetworkError =
        !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error'

      if (isNetworkError) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
        originalRequest._retry = true

        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * originalRequest._retryCount),
        )

        return request(originalRequest)
      }
    }

    if (error.response) {
      const { status, data } = error.response
      const apiError: ApiError = data?.error || { code: 'UNKNOWN', message: '请求失败' }

      // 登录/注册/刷新/登出接口的 401 是认证失败，不需要刷新 token
      const isAuthEndpoint =
        originalRequest?.url?.endsWith('/login') ||
        originalRequest?.url?.endsWith('/register') ||
        originalRequest?.url?.endsWith('/auth/refresh') ||
        originalRequest?.url?.endsWith('/auth/logout')

      // 401 尝试刷新 token（跳过登录和注册接口）
      if (isUnauthorized(apiError) && !originalRequest._retry && !isAuthEndpoint) {
        if (!isRefreshing) {
          isRefreshing = true
          originalRequest._retry = true

          try {
            const newToken = await refreshAccessToken()
            processQueue(null, newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return request(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError, null)
            clearAuth()
            ElMessage.error('登录已过期，请重新登录')
            router.push('/login')
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        } else {
          // 正在刷新 token，将请求加入队列
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return request(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        }
      }

      if (isValidationError(apiError)) {
        handleValidationError(apiError.details)
      } else if (!isUnauthorized(apiError) || isAuthEndpoint) {
        // 非认证接口的 401 由 token 刷新处理，不显示错误
        // 认证接口（登录/注册）的 401 需要显示错误
        handleApiError(apiError)
      }

      // 上报 API 错误到 Sentry
      reportApiError(apiError, {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status,
      })

      return Promise.reject(data || error.message)
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络连接')
    } else {
      ElMessage.error('网络连接失败')
    }
    return Promise.reject(error.message)
  },
)

// 核心请求函数：处理请求共享
const request = <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
  const requestKey = generateRequestKey(config)

  // 如果已有相同请求在进行中，返回共享的 Promise
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey) as Promise<T>
  }

  // 发起新请求
  const promise = axiosInstance(config).finally(() => {
    pendingRequests.delete(requestKey)
  })

  pendingRequests.set(requestKey, promise)
  return promise as Promise<T>
}

// 定义请求方法类型
interface RequestMethod {
  <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
}

interface ParamsMethod {
  <T = unknown>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T>
}

// 创建请求方法
const createPostMethod = (): RequestMethod => {
  return <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ url, method: 'post', data, ...config })
  }
}

const createPutMethod = (): RequestMethod => {
  return <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ url, method: 'put', data, ...config })
  }
}

const createPatchMethod = (): RequestMethod => {
  return <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ url, method: 'patch', data, ...config })
  }
}

const createGetMethod = (): ParamsMethod => {
  return <T = unknown>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ url, method: 'get', params, ...config })
  }
}

const createDeleteMethod = (): ParamsMethod => {
  return <T = unknown>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ url, method: 'delete', params, ...config })
  }
}

const createHeadMethod = (): ParamsMethod => {
  return <T = unknown>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ url, method: 'head', params, ...config })
  }
}

const createOptionsMethod = (): ParamsMethod => {
  return <T = unknown>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ url, method: 'options', params, ...config })
  }
}

// 扩展 request 对象
const extendedRequest = Object.assign(request, {
  get: createGetMethod(),
  delete: createDeleteMethod(),
  head: createHeadMethod(),
  options: createOptionsMethod(),
  post: createPostMethod(),
  put: createPutMethod(),
  patch: createPatchMethod(),
})

export const cancelAllRequests = (): void => {
  pendingRequests.clear()
}

export default extendedRequest
