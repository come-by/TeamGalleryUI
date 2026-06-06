import * as Sentry from '@sentry/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'

import { ErrorCategory } from '@/utils/error-report'

// Mock Vue App type
const createMockApp = (): App => ({ config: { globalProperties: {} } }) as unknown as App

// Mock Sentry
vi.mock('@sentry/vue', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  browserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
}))

describe('错误上报工具', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 重置模块状态
    vi.resetModules()
  })

  describe('initErrorReport', () => {
    it('开发环境应该禁用上报', async () => {
      const { initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: 'https://test@sentry.io/123',
        environment: 'development',
        app: mockApp,
      })

      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('没有 DSN 应该禁用上报', async () => {
      const { initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: '',
        environment: 'production',
        app: mockApp,
      })

      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('生产环境有 DSN 应该初始化 Sentry', async () => {
      const { initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        app: mockApp,
      })

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          environment: 'production',
        })
      )
    })

    it('多次调用应该只初始化一次', async () => {
      const { initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        app: mockApp,
      })
      initErrorReport({
        dsn: 'https://test2@sentry.io/456',
        environment: 'production',
        app: mockApp,
      })

      expect(Sentry.init).toHaveBeenCalledTimes(1)
    })
  })

  describe('reportError', () => {
    it('应该上报错误', async () => {
      const { reportError, initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        app: mockApp,
      })

      const error = new Error('Test error')
      reportError(error, { context: 'test' })

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: { context: 'test' },
      })
    })

    it('未初始化时应该输出警告', async () => {
      vi.resetModules()
      const { reportError } = await import('@/utils/error-report')

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      reportError(new Error('Test'))

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('未初始化'),
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  describe('reportApiError', () => {
    it('应该上报 API 错误', async () => {
      const { reportApiError, initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        app: mockApp,
      })

      reportApiError(
        { code: 'ARTICLE_NOT_FOUND', message: '文章不存在', status: 404 },
        { url: '/api/articles/1', method: 'get' }
      )

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'API Error: ARTICLE_NOT_FOUND',
        expect.objectContaining({
          level: 'error',
          tags: {
            'api.error_code': 'ARTICLE_NOT_FOUND',
            'api.status': '404',
          },
        })
      )
    })

    it('未初始化时不应该上报', async () => {
      vi.resetModules()
      const { reportApiError } = await import('@/utils/error-report')

      reportApiError({ code: 'ERROR', message: 'Test' })
      expect(Sentry.captureMessage).not.toHaveBeenCalled()
    })
  })

  describe('setUserContext', () => {
    it('应该设置用户上下文', async () => {
      const { setUserContext, initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        app: mockApp,
      })

      setUserContext({ id: '1', email: 'test@example.com', username: 'testuser' })

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      })
    })
  })

  describe('clearUserContext', () => {
    it('应该清除用户上下文', async () => {
      const { clearUserContext, initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        app: mockApp,
      })

      clearUserContext()
      expect(Sentry.setUser).toHaveBeenCalledWith(null)
    })
  })

  describe('addBreadcrumb', () => {
    it('应该添加面包屑', async () => {
      const { addBreadcrumb, initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        app: mockApp,
      })

      addBreadcrumb('User clicked button', 'ui', 'info')

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User clicked button',
          category: 'ui',
          level: 'info',
        })
      )
    })
  })

  describe('ErrorCategory', () => {
    it('应该包含所有错误分类', () => {
      expect(ErrorCategory.RENDER).toBe('render')
      expect(ErrorCategory.API).toBe('api')
      expect(ErrorCategory.ROUTE).toBe('route')
      expect(ErrorCategory.VALIDATION).toBe('validation')
      expect(ErrorCategory.AUTH).toBe('auth')
      expect(ErrorCategory.NETWORK).toBe('network')
      expect(ErrorCategory.UNKNOWN).toBe('unknown')
    })
  })

  describe('reportCategorizedError', () => {
    it('应该根据分类设置不同级别', async () => {
      const { reportCategorizedError, initErrorReport } = await import('@/utils/error-report')
      const mockApp = createMockApp()

      initErrorReport({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        app: mockApp,
      })

      // 验证错误应该是 warning 级别
      reportCategorizedError(new Error('Validation failed'), ErrorCategory.VALIDATION)
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          level: 'warning',
          tags: { 'error.category': 'validation' },
        })
      )

      // 路由错误应该是 info 级别
      reportCategorizedError(new Error('Route not found'), ErrorCategory.ROUTE)
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          level: 'info',
          tags: { 'error.category': 'route' },
        })
      )

      // API 错误应该是 error 级别
      reportCategorizedError(new Error('API failed'), ErrorCategory.API)
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          level: 'error',
          tags: { 'error.category': 'api' },
        })
      )
    })
  })
})
