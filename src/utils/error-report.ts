import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'

// 敏感字段列表，上报时会被过滤
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'authorization',
]

// 错误上报是否已初始化
let isInitialized = false

export interface SentryConfig {
  dsn: string
  environment: string
  app: App
  router?: Router
}

/**
 * 初始化 Sentry 错误上报
 * 仅在 DSN 配置且非开发环境时启用
 *
 * @param config - Sentry 配置对象，包含 DSN、环境、Vue 应用实例和路由
 */
export const initErrorReport = (config: SentryConfig): void => {
  if (isInitialized) return

  const { dsn, environment, app, router } = config

  // 开发环境不上报，仅 console 输出
  if (environment === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Sentry] 开发模式，错误上报已禁用')
    return
  }

  if (!dsn) {
    console.warn('[Sentry] DSN 未配置，错误上报已禁用')
    return
  }

  Sentry.init({
    app,
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // 性能监控采样率
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    // Session Replay 采样率
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // 忽略某些错误
    ignoreErrors: [
      // 忽略浏览器扩展错误
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
    // 发送前过滤敏感信息
    beforeSend: (event) => {
      return filterSensitiveData(event)
    },
  })

  isInitialized = true
  // eslint-disable-next-line no-console
  console.log('[Sentry] 错误上报已初始化')
}

/**
 * 过滤事件中的敏感数据
 *
 * @param event
 */

const filterSensitiveData = (event: Sentry.ErrorEvent): Sentry.ErrorEvent => {
  // 过滤 request 中的敏感头
  const headers = event.request?.headers
  if (headers) {
    Object.keys(headers).forEach((key) => {
      if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field))) {
        // Iterating known Object.keys, safe bracket access
        // eslint-disable-next-line security/detect-object-injection
        headers[key] = '[Filtered]'
      }
    })
  }

  // 过滤 breadcrumb 中的敏感数据
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      const data = breadcrumb.data
      if (data) {
        Object.keys(data).forEach((key) => {
          if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field))) {
            // Iterating known Object.keys, safe bracket access
            // eslint-disable-next-line security/detect-object-injection
            data[key] = '[Filtered]'
          }
        })
      }
      return breadcrumb
    })
  }

  return event
}

/**
 * 手动上报错误
 *
 * @param error - 错误对象或错误信息
 * @param context - 可选的上下文信息，用于追踪错误来源
 */
export const reportError = (error: unknown, context?: Record<string, unknown>): void => {
  if (!isInitialized) {
    console.error('[Sentry] 未初始化，无法上报错误:', error)
    return
  }

  Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * 上报 API 错误
 *
 * @param error - API 错误对象
 * @param error.code - 错误码
 * @param error.message - 错误消息
 * @param error.status - HTTP 状态码
 * @param context - 请求上下文
 * @param context.url - 请求 URL
 * @param context.method - 请求方法
 * @param context.params - 请求参数
 * @param context.status - 响应状态码
 */
export const reportApiError = (
  error: { code?: string; message?: string; status?: number },
  context?: { url?: string; method?: string; params?: unknown; status?: number }
): void => {
  if (!isInitialized) return

  Sentry.captureMessage(`API Error: ${error.code || error.message || 'Unknown'}`, {
    level: 'error',
    tags: {
      'api.error_code': error.code,
      'api.status': error.status?.toString(),
    },
    extra: {
      ...context,
      error,
    },
  })
}

/**
 * 设置用户上下文
 *
 * @param user - 用户信息对象
 * @param user.id - 用户 ID
 * @param user.email - 用户邮箱
 * @param user.username - 用户名
 */
export const setUserContext = (user: { id?: string; email?: string; username?: string }): void => {
  if (!isInitialized) return

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

/**
 * 清除用户上下文
 */
export const clearUserContext = (): void => {
  if (!isInitialized) return

  Sentry.setUser(null)
}

/**
 * 添加面包屑（操作日志）
 *
 * @param message - 日志消息
 * @param category - 日志分类
 * @param level - 日志级别，默认 info
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void => {
  if (!isInitialized) return

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  })
}

/**
 * 错误分类
 */
export enum ErrorCategory {
  RENDER = 'render', // 组件渲染错误
  API = 'api', // API 请求错误
  ROUTE = 'route', // 路由错误
  VALIDATION = 'validation', // 表单验证错误
  AUTH = 'auth', // 认证/授权错误
  NETWORK = 'network', // 网络错误
  UNKNOWN = 'unknown', // 未知错误
}

/**
 * 根据错误类型分类上报
 *
 * @param error - 错误对象或错误信息
 * @param category - 错误分类
 * @param context - 可选的上下文信息
 */
export const reportCategorizedError = (
  error: unknown,
  category: ErrorCategory,
  context?: Record<string, unknown>
): void => {
  if (!isInitialized) return

  const tags: Record<string, string> = {
    'error.category': category,
  }

  // 根据分类设置不同级别
  let level: 'error' | 'warning' | 'info' = 'error'
  if (category === ErrorCategory.VALIDATION) {
    level = 'warning'
  } else if (category === ErrorCategory.ROUTE) {
    level = 'info'
  }

  Sentry.captureException(error, {
    level,
    tags,
    extra: context,
  })
}
