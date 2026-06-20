import type { ApiResponse, PaginatedResponse } from '@/types'
import type {
  NotificationCreateParams,
  NotificationItem,
  NotificationTemplate,
  NotificationTemplateCreateParams,
  NotificationTemplateUpdateParams,
  UnreadCountResponse,
} from '@/types/notification'

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

/**
 * 创建通知
 *
 * @param data - 通知创建参数
 * @returns 创建的通知数据
 */
export const createNotification = (
  data: NotificationCreateParams,
): Promise<ApiResponse<NotificationItem>> => {
  return request.post('/notifications', data)
}

// ============================
//  通知模板 API
// ============================

/**
 * 获取通知模板列表
 *
 * @returns 模板列表数据
 */
export const getTemplates = (): Promise<ApiResponse<NotificationTemplate[]>> => {
  return request.get('/notification-templates')
}

/**
 * 获取单个模板详情
 *
 * @param id - 模板 ID
 * @returns 模板详情数据
 */
export const getTemplateDetail = (id: number): Promise<ApiResponse<NotificationTemplate>> => {
  return request.get(`/notification-templates/${id}`)
}

/**
 * 创建通知模板
 *
 * @param data - 模板创建参数
 * @returns 创建的模板数据
 */
export const createTemplate = (
  data: NotificationTemplateCreateParams,
): Promise<ApiResponse<NotificationTemplate>> => {
  return request.post('/notification-templates', data)
}

/**
 * 更新通知模板
 *
 * @param id - 模板 ID
 * @param data - 模板更新参数
 * @returns 更新后的模板数据
 */
export const updateTemplate = (
  id: number,
  data: NotificationTemplateUpdateParams,
): Promise<ApiResponse<NotificationTemplate>> => {
  return request.put(`/notification-templates/${id}`, data)
}

/**
 * 删除通知模板
 *
 * @param id - 模板 ID
 * @returns 操作结果
 */
export const deleteTemplate = (id: number): Promise<ApiResponse> => {
  return request.delete(`/notification-templates/${id}`)
}
