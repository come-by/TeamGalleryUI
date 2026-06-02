export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
  }
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export interface PaginationParams {
  page?: number
  page_size?: number
}
