import type { ApiResponse, PaginatedResponse, User } from './request'
import request from './request'

export interface AdminUserParams {
  page?: number
  page_size?: number
}

export const getUsers = (
  params: AdminUserParams
): Promise<ApiResponse<PaginatedResponse<User>>> => {
  return request.get('/admin/users', { params })
}
