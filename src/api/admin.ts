import request from './request'
import type { ApiResponse, User, PaginatedResponse } from './request'

export interface AdminUserParams {
  page?: number
  page_size?: number
}

export const getUsers = (
  params: AdminUserParams
): Promise<ApiResponse<PaginatedResponse<User>>> => {
  return request.get('/admin/users', { params })
}
