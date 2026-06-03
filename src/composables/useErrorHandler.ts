import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  handleApiError as handleApiErrorUtil,
  isUnauthorized,
  isForbidden,
  isNotFound,
  isValidationError,
} from '@/utils/error'
import { reportError, addBreadcrumb } from '@/utils/error-report'
import type { ApiError } from '@/types'

export interface ErrorState {
  error: Ref<Error | null>
  errorCode: Ref<string | null>
  errorMessage: Ref<string>
  hasError: Ref<boolean>
}

/**
 * 错误处理组合式函数
 * 提供统一的错误状态管理和展示
 */
export const useErrorHandler = (): ErrorState & {
  setError: (error: unknown, context?: Record<string, unknown>) => void
  clearError: () => void
  handleApiError: (error: unknown) => void
} => {
  const error = ref<Error | null>(null)
  const errorCode = ref<string | null>(null)
  const errorMessage = ref('')
  const hasError = ref(false)

  const setError = (err: unknown, context?: Record<string, unknown>): void => {
    error.value = err instanceof Error ? err : new Error(String(err))
    hasError.value = true

    // 提取错误码
    if (err && typeof err === 'object' && 'code' in err) {
      errorCode.value = String(err.code)
    }

    errorMessage.value = error.value.message || '未知错误'

    // 上报错误
    reportError(err, {
      type: 'useErrorHandler',
      ...context,
    })
  }

  const clearError = (): void => {
    error.value = null
    errorCode.value = null
    errorMessage.value = ''
    hasError.value = false
  }

  const handleApiError = (err: unknown): void => {
    // 先显示用户提示
    handleApiErrorUtil(err)

    // 根据错误类型设置状态
    if (err && typeof err === 'object') {
      const apiError = err as ApiError

      if (isUnauthorized(apiError)) {
        // 401 由拦截器处理，这里不重复
        return
      }

      if (isForbidden(apiError)) {
        setError(err, { type: 'forbidden' })
        return
      }

      if (isNotFound(apiError)) {
        setError(err, { type: 'not-found' })
        return
      }

      if (isValidationError(apiError)) {
        // 验证错误不设置全局错误状态，已由 handleApiError 处理
        addBreadcrumb('表单验证错误', 'validation', 'warning')
        return
      }
    }

    // 其他错误
    setError(err, { type: 'api-error' })
  }

  return {
    error,
    errorCode,
    errorMessage,
    hasError,
    setError,
    clearError,
    handleApiError,
  }
}

/**
 * 异步操作错误处理
 * 自动管理 loading 和 error 状态
 */
export const useAsyncError = <T>(
  asyncFn: () => Promise<T>
): {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: () => Promise<void>
} => {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      data.value = await asyncFn()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      reportError(err, { type: 'async-error' })
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
