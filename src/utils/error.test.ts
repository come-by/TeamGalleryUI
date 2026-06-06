import { ElMessage } from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type ApiError, ErrorCode } from '@/types'
import {
  getErrorMessage,
  handleApiError,
  handleValidationError,
  isForbidden,
  isNotFound,
  isUnauthorized,
  isValidationError,
} from '@/utils/error'

// Mock ElMessage
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
  },
}))

describe('错误处理工具函数', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getErrorMessage', () => {
    it('应该返回预定义的错误消息', () => {
      const error: ApiError = {
        code: ErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      }
      expect(getErrorMessage(error)).toBe('用户名或密码错误')
    })

    it('应该返回 NOT_FOUND 错误消息', () => {
      const error: ApiError = { code: ErrorCode.ARTICLE_NOT_FOUND, message: 'Article not found' }
      expect(getErrorMessage(error)).toBe('文章不存在')
    })

    it('应该返回未知错误消息当错误码未定义时', () => {
      const error: ApiError = { code: 'UNKNOWN_CODE', message: 'Some error' }
      expect(getErrorMessage(error)).toBe('Some error')
    })

    it('应该返回默认消息当 error 为 undefined 时', () => {
      expect(getErrorMessage(undefined)).toBe('未知错误')
    })

    it('应该返回默认消息当 message 为空时', () => {
      const error: ApiError = { code: 'UNKNOWN_CODE', message: '' }
      expect(getErrorMessage(error)).toBe('操作失败')
    })
  })

  describe('handleApiError', () => {
    it('应该处理 ApiError 类型错误', () => {
      const error: ApiError = { code: ErrorCode.INTERNAL_SERVER_ERROR, message: 'Server error' }
      handleApiError(error)
      expect(ElMessage.error).toHaveBeenCalledWith('服务器错误，请稍后重试')
    })

    it('应该处理 Error 实例', () => {
      const error = new Error('Network error')
      handleApiError(error)
      expect(ElMessage.error).toHaveBeenCalledWith('Network error')
    })

    it('应该处理未知类型错误', () => {
      handleApiError('some string error')
      expect(ElMessage.error).toHaveBeenCalledWith('操作失败')
    })

    it('应该处理 null 错误', () => {
      handleApiError(null)
      expect(ElMessage.error).toHaveBeenCalledWith('操作失败')
    })
  })

  describe('handleValidationError', () => {
    it('应该处理验证错误详情', () => {
      const details = [
        { field: 'username', message: '用户名不能为空' },
        { field: 'email', message: '邮箱格式不正确' },
      ]
      handleValidationError(details)
      expect(ElMessage.error).toHaveBeenCalledWith(
        'username: 用户名不能为空；email: 邮箱格式不正确'
      )
    })

    it('应该忽略空验证详情', () => {
      handleValidationError(undefined)
      expect(ElMessage.error).not.toHaveBeenCalled()

      handleValidationError([])
      expect(ElMessage.error).not.toHaveBeenCalled()
    })
  })

  describe('isUnauthorized', () => {
    it('应该识别 UNAUTHORIZED 错误', () => {
      const error: ApiError = { code: ErrorCode.UNAUTHORIZED, message: 'Unauthorized' }
      expect(isUnauthorized(error)).toBe(true)
    })

    it('应该返回 false 对于其他错误', () => {
      const error: ApiError = { code: ErrorCode.FORBIDDEN, message: 'Forbidden' }
      expect(isUnauthorized(error)).toBe(false)
    })

    it('应该返回 false 对于 undefined', () => {
      expect(isUnauthorized(undefined)).toBe(false)
    })
  })

  describe('isForbidden', () => {
    it('应该识别 FORBIDDEN 错误', () => {
      const error: ApiError = { code: ErrorCode.FORBIDDEN, message: 'Forbidden' }
      expect(isForbidden(error)).toBe(true)
    })

    it('应该返回 false 对于其他错误', () => {
      const error: ApiError = { code: ErrorCode.UNAUTHORIZED, message: 'Unauthorized' }
      expect(isForbidden(error)).toBe(false)
    })
  })

  describe('isNotFound', () => {
    it('应该识别 NOT_FOUND 错误', () => {
      const error: ApiError = { code: ErrorCode.NOT_FOUND, message: 'Not found' }
      expect(isNotFound(error)).toBe(true)
    })

    it('应该识别 USER_NOT_FOUND 错误', () => {
      const error: ApiError = { code: ErrorCode.USER_NOT_FOUND, message: 'User not found' }
      expect(isNotFound(error)).toBe(true)
    })

    it('应该识别 ARTICLE_NOT_FOUND 错误', () => {
      const error: ApiError = { code: ErrorCode.ARTICLE_NOT_FOUND, message: 'Article not found' }
      expect(isNotFound(error)).toBe(true)
    })

    it('应该识别 COMMENT_NOT_FOUND 错误', () => {
      const error: ApiError = { code: ErrorCode.COMMENT_NOT_FOUND, message: 'Comment not found' }
      expect(isNotFound(error)).toBe(true)
    })

    it('应该识别 FILE_NOT_FOUND 错误', () => {
      const error: ApiError = { code: ErrorCode.FILE_NOT_FOUND, message: 'File not found' }
      expect(isNotFound(error)).toBe(true)
    })

    it('应该返回 false 对于其他错误', () => {
      const error: ApiError = { code: ErrorCode.UNAUTHORIZED, message: 'Unauthorized' }
      expect(isNotFound(error)).toBe(false)
    })
  })

  describe('isValidationError', () => {
    it('应该识别 VALIDATION_FAILED 错误', () => {
      const error: ApiError = { code: ErrorCode.VALIDATION_FAILED, message: 'Validation failed' }
      expect(isValidationError(error)).toBe(true)
    })

    it('应该返回 false 对于其他错误', () => {
      const error: ApiError = { code: ErrorCode.BAD_REQUEST, message: 'Bad request' }
      expect(isValidationError(error)).toBe(false)
    })
  })
})
