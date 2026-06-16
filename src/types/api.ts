export enum ErrorCode {
  OK = 'OK',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  USER_EXISTS = 'USER_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ARTICLE_NOT_FOUND = 'ARTICLE_NOT_FOUND',
  ARTICLE_PERMISSION = 'ARTICLE_PERMISSION',
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  COMMENT_PERMISSION = 'COMMENT_PERMISSION',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED = 'FILE_TYPE_NOT_ALLOWED',
  MILESTONE_NOT_FOUND = 'MILESTONE_NOT_FOUND',
  MILESTONE_PERMISSION = 'MILESTONE_PERMISSION',
  MILESTONE_LIMIT_REACHED = 'MILESTONE_LIMIT_REACHED',
  MILESTONE_INVALID_STATUS = 'MILESTONE_INVALID_STATUS',
  DATABASE_ERROR = 'DATABASE_ERROR',
  LOGIN_LOCKED = 'LOGIN_LOCKED',
  LOGIN_DELAY = 'LOGIN_DELAY',
}

export interface ErrorDetail {
  field: string
  message: string
}

export interface ApiError {
  code: ErrorCode | string
  message: string
  details?: ErrorDetail[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface PaginationParams {
  page?: number
  page_size?: number
}
