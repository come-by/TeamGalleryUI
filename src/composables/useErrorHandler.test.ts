import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useErrorHandler, useAsyncError } from '@/composables/useErrorHandler'

// Mock dependencies
vi.mock('@/utils/error', () => ({
  handleApiError: vi.fn(),
  isUnauthorized: vi.fn((error) => error?.code === 'UNAUTHORIZED'),
  isForbidden: vi.fn((error) => error?.code === 'FORBIDDEN'),
  isNotFound: vi.fn((error) => error?.code === 'NOT_FOUND'),
  isValidationError: vi.fn((error) => error?.code === 'VALIDATION_FAILED'),
}))

vi.mock('@/utils/error-report', () => ({
  reportError: vi.fn(),
  addBreadcrumb: vi.fn(),
}))

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该初始化为无错误状态', () => {
      const { error, errorCode, errorMessage, hasError } = useErrorHandler()
      expect(error.value).toBeNull()
      expect(errorCode.value).toBeNull()
      expect(errorMessage.value).toBe('')
      expect(hasError.value).toBe(false)
    })
  })

  describe('setError', () => {
    it('应该设置 Error 实例', () => {
      const { error, hasError, setError } = useErrorHandler()
      const err = new Error('Test error')
      setError(err)

      expect(error.value).toBe(err)
      expect(hasError.value).toBe(true)
    })

    it('应该设置非 Error 对象', () => {
      const { error, hasError, setError } = useErrorHandler()
      setError('string error')

      expect(error.value).toBeInstanceOf(Error)
      expect(error.value?.message).toBe('string error')
      expect(hasError.value).toBe(true)
    })

    it('应该提取错误码', () => {
      const { errorCode, setError } = useErrorHandler()
      setError({ code: 'TEST_ERROR', message: 'Test' })

      expect(errorCode.value).toBe('TEST_ERROR')
    })
  })

  describe('clearError', () => {
    it('应该清除所有错误状态', () => {
      const { error, errorCode, errorMessage, hasError, setError, clearError } = useErrorHandler()
      setError(new Error('Test'))
      expect(hasError.value).toBe(true)

      clearError()
      expect(error.value).toBeNull()
      expect(errorCode.value).toBeNull()
      expect(errorMessage.value).toBe('')
      expect(hasError.value).toBe(false)
    })
  })

  describe('handleApiError', () => {
    it('应该处理 401 错误（不设置状态）', () => {
      const { hasError, handleApiError } = useErrorHandler()
      handleApiError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })

      expect(hasError.value).toBe(false)
    })

    it('应该处理 403 错误（设置状态）', () => {
      const { hasError, errorCode, handleApiError } = useErrorHandler()
      handleApiError({ code: 'FORBIDDEN', message: 'Forbidden' })

      expect(hasError.value).toBe(true)
      expect(errorCode.value).toBe('FORBIDDEN')
    })

    it('应该处理 404 错误（设置状态）', () => {
      const { hasError, errorCode, handleApiError } = useErrorHandler()
      handleApiError({ code: 'NOT_FOUND', message: 'Not found' })

      expect(hasError.value).toBe(true)
      expect(errorCode.value).toBe('NOT_FOUND')
    })

    it('应该处理验证错误（不设置全局状态）', () => {
      const { hasError, handleApiError } = useErrorHandler()
      handleApiError({ code: 'VALIDATION_FAILED', message: 'Validation failed' })

      expect(hasError.value).toBe(false)
    })

    it('应该处理其他错误', () => {
      const { hasError, handleApiError } = useErrorHandler()
      handleApiError({ code: 'INTERNAL_ERROR', message: 'Internal error' })

      expect(hasError.value).toBe(true)
    })
  })
})

describe('useAsyncError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该初始化为无数据无错误状态', () => {
    const { data, loading, error } = useAsyncError(async () => 'test')
    expect(data.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('应该成功执行异步函数', async () => {
    const { data, loading, error, execute } = useAsyncError(async () => 'success')

    expect(loading.value).toBe(false)
    await execute()

    expect(data.value).toBe('success')
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('应该处理异步函数错误', async () => {
    const { data, loading, error, execute } = useAsyncError(async () => {
      throw new Error('Async error')
    })

    await execute()

    expect(data.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeInstanceOf(Error)
    expect(error.value?.message).toBe('Async error')
  })

  it('应该处理非 Error 异常', async () => {
    const { error, execute } = useAsyncError(async () => {
      throw 'string error'
    })

    await execute()

    expect(error.value).toBeInstanceOf(Error)
    expect(error.value?.message).toBe('string error')
  })
})
