import { ElMessage } from 'element-plus'
import { ErrorCode, type ApiError, type ErrorDetail } from '@/types'

const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCode.NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.UNAUTHORIZED]: '登录已过期，请重新登录',
  [ErrorCode.FORBIDDEN]: '没有权限执行此操作',
  [ErrorCode.BAD_REQUEST]: '请求参数有误',
  [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器错误，请稍后重试',
  [ErrorCode.DUPLICATE_ENTRY]: '数据已存在',
  [ErrorCode.VALIDATION_FAILED]: '数据验证失败',
  [ErrorCode.USER_EXISTS]: '用户名或邮箱已存在',
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.INVALID_CREDENTIALS]: '用户名或密码错误',
  [ErrorCode.ARTICLE_NOT_FOUND]: '文章不存在',
  [ErrorCode.ARTICLE_PERMISSION]: '没有权限操作此文章',
  [ErrorCode.COMMENT_NOT_FOUND]: '评论不存在',
  [ErrorCode.COMMENT_PERMISSION]: '没有权限操作此评论',
  [ErrorCode.FILE_UPLOAD_FAILED]: '文件上传失败',
  [ErrorCode.FILE_NOT_FOUND]: '文件不存在',
  [ErrorCode.FILE_TOO_LARGE]: '文件过大',
  [ErrorCode.FILE_TYPE_NOT_ALLOWED]: '文件类型不支持',
  [ErrorCode.DATABASE_ERROR]: '数据库操作失败',
  [ErrorCode.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后重试',
}

export const getErrorMessage = (error: ApiError | undefined): string => {
  if (!error) return '未知错误'
  return ERROR_MESSAGES[error.code] || error.message || '操作失败'
}

export const handleApiError = (error: unknown): void => {
  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiError
    const message = getErrorMessage(apiError)
    ElMessage.error(message)
  } else if (error instanceof Error) {
    ElMessage.error(error.message)
  } else {
    ElMessage.error('操作失败')
  }
}

export const handleValidationError = (details: ErrorDetail[] | undefined): void => {
  if (!details || details.length === 0) return

  const messages = details.map((d) => `${d.field}: ${d.message}`).join('；')
  ElMessage.error(messages)
}

export const isUnauthorized = (error: ApiError | undefined): boolean => {
  return error?.code === ErrorCode.UNAUTHORIZED
}

export const isForbidden = (error: ApiError | undefined): boolean => {
  return error?.code === ErrorCode.FORBIDDEN
}

export const isValidationError = (error: ApiError | undefined): boolean => {
  return error?.code === ErrorCode.VALIDATION_FAILED
}
