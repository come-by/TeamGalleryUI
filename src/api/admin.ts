import type { ApiResponse, PaginatedResponse, User } from '@/types'

import request from './request'

/** 管理员用户查询参数 */
export interface AdminUserParams {
  page?: number
  page_size?: number
}

/**
 * 获取用户列表（管理员）
 *
 * @param params - 分页参数
 * @returns 用户分页数据
 */
export const getUsers = (
  params: AdminUserParams,
): Promise<ApiResponse<PaginatedResponse<User>>> => {
  return request.get('/admin/users', { params })
}
