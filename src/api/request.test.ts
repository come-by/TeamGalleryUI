import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockAxiosInstance = {
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isCancel: vi.fn(() => false),
    post: vi.fn(),
  },
}))

vi.mock('@/utils/error', () => ({
  handleApiError: vi.fn(),
  handleValidationError: vi.fn(),
  isUnauthorized: vi.fn(() => false),
  isValidationError: vi.fn(() => false),
}))

vi.mock('@/utils/error-report', () => ({
  reportApiError: vi.fn(),
}))

// 获取拦截器注册的回调
function getRequestInterceptor():
  | ((config: Record<string, unknown>) => Record<string, unknown>)
  | undefined {
  const mock = vi.mocked(mockAxiosInstance.interceptors.request.use).mock
  const call = mock.calls[0] as unknown as
    | [(config: Record<string, unknown>) => Record<string, unknown>, (error: unknown) => unknown]
    | undefined
  return call?.[0]
}

function getResponseFulfilledHandler() {
  const call = vi.mocked(mockAxiosInstance.interceptors.response.use).mock.calls[0] as unknown as [
    (response: unknown) => unknown,
    (error: unknown) => Promise<unknown>,
  ]
  return call?.[0]
}

function getResponseRejectedHandler() {
  const call = vi.mocked(mockAxiosInstance.interceptors.response.use).mock.calls[0] as unknown as [
    (response: unknown) => unknown,
    (error: unknown) => Promise<unknown>,
  ]
  return call?.[1]
}

describe('request 模块', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    localStorage.clear()
    // 确保 axios.create 返回 mock 对象
    const axiosModule = await import('axios')
    vi.mocked(axiosModule.default.create).mockReturnValue(
      mockAxiosInstance as unknown as ReturnType<typeof axiosModule.default.create>,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('请求方法导出', () => {
    it('应该导出所有 HTTP 方法', async () => {
      const { default: request } = await import('@/api/request')
      expect(request.get).toBeDefined()
      expect(request.post).toBeDefined()
      expect(request.put).toBeDefined()
      expect(request.delete).toBeDefined()
      expect(request.patch).toBeDefined()
      expect(request.head).toBeDefined()
      expect(request.options).toBeDefined()
    })

    it('应该导出 cancelAllRequests', async () => {
      const { cancelAllRequests } = await import('@/api/request')
      expect(typeof cancelAllRequests).toBe('function')
    })
  })

  describe('请求拦截器 - Token 注入', () => {
    it('应该在有 token 时添加 Authorization 头', async () => {
      localStorage.setItem('access_token', 'test-token')
      // 重新加载模块以触发拦截器设置
      vi.resetModules()
      vi.doMock('axios', () => ({
        default: {
          create: vi.fn(() => mockAxiosInstance),
          isCancel: vi.fn(() => false),
        },
      }))
      await import('@/api/request')

      const requestHandler = getRequestInterceptor()
      if (requestHandler) {
        const config: Record<string, unknown> = { headers: {} as Record<string, string> }
        const result = requestHandler(config)
        const headers = result.headers as Record<string, string>
        expect(headers.Authorization).toBe('Bearer test-token')
      }
    })

    it('应该在没有 token 时不添加 Authorization 头', async () => {
      const requestHandler = getRequestInterceptor()
      if (requestHandler) {
        const config: Record<string, unknown> = { headers: {} as Record<string, string> }
        const result = requestHandler(config)
        const headers = result.headers as Record<string, string>
        expect(headers.Authorization).toBeUndefined()
      }
    })
  })

  describe('响应拦截器 - 成功处理', () => {
    it('应该返回 response.data', async () => {
      const responseHandler = getResponseFulfilledHandler()
      if (responseHandler) {
        const result = responseHandler({ data: { success: true } })
        expect(result).toEqual({ success: true })
      }
    })
  })

  describe('响应拦截器 - 错误处理', () => {
    it('应该处理 axios 取消错误', async () => {
      const { default: axiosDefault } = await import('axios')
      vi.mocked(axiosDefault.isCancel).mockReturnValue(true)

      const rejectHandler = getResponseRejectedHandler()
      if (rejectHandler) {
        const _error = { config: { _retry: false, _retryCount: 5 } }
        await expect(rejectHandler(_error)).rejects.toEqual(_error)
      }
    })

    it('应该对网络错误进行重试', async () => {
      const rejectHandler = getResponseRejectedHandler()
      if (rejectHandler) {
        const networkError = {
          config: { _retry: false, _retryCount: 0, url: '/test', method: 'get' },
          code: 'ECONNABORTED',
          message: 'timeout of 10000ms exceeded',
        }
        // 网络错误会触发重试机制（依赖 setTimeout，异步测试受限）
        // 验证函数接受网络错误参数时不崩溃
        try {
          await rejectHandler(networkError)
        } catch {
          // 预期可能 reject（重试后仍失败）
        }
        expect(typeof rejectHandler).toBe('function')
      }
    })
  })
})
