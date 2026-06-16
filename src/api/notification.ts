import type { ApiResponse, PaginatedResponse } from '@/types'
import type { NotificationItem, UnreadCountResponse } from '@/types/notification'

import request from './request'

/**
 * 获取通知列表
 *
 * @param page - 页码，默认 1
 * @param pageSize - 每页数量，默认 10
 * @returns 通知分页数据
 */
export const getNotifications = (
  page = 1,
  pageSize = 10,
): Promise<ApiResponse<PaginatedResponse<NotificationItem>>> => {
  return request.get('/notifications', { params: { page, page_size: pageSize } })
}

/**
 * 获取通知详情
 *
 * @param id - 通知 ID
 * @returns 通知详情数据
 */
export const getNotificationDetail = (id: number): Promise<ApiResponse<NotificationItem>> => {
  return request.get(`/notifications/${id}`)
}

/**
 * 获取未读通知数量
 *
 * @returns 未读数量响应
 */
export const getUnreadCount = (): Promise<ApiResponse<UnreadCountResponse>> => {
  return request.get('/notifications/unread-count')
}

/**
 * 标记单条通知为已读
 *
 * @param id - 通知 ID
 * @returns 操作结果
 */
export const markRead = (id: number): Promise<ApiResponse> => {
  return request.post(`/notifications/${id}/read`)
}

/**
 * 标记全部通知为已读
 *
 * @returns 操作结果
 */
export const markAllRead = (): Promise<ApiResponse> => {
  return request.post('/notifications/read-all')
}
