import type { ApiResponse } from '@/types'
import type {
  ConversationDetail,
  ConversationListResponse,
  ConversationSetting,
  CreateConversationParams,
  MessageItem,
  MessageListResponse,
  SendMessageParams,
  UpdateSettingsParams,
} from '@/types/chat'

import request from './request'

/**
 * 获取会话列表
 *
 * @param page - 页码，默认 1
 * @param pageSize - 每页数量，默认 20
 * @returns 会话列表响应
 */
export const getConversations = (
  page = 1,
  pageSize = 20,
): Promise<ApiResponse<ConversationListResponse>> => {
  return request.get('/conversations', { params: { page, page_size: pageSize } })
}

/**
 * 创建或获取与目标用户的私聊会话
 *
 * @param params - 目标用户 ID
 * @returns 会话详情
 */
export const getOrCreateConversation = (
  params: CreateConversationParams,
): Promise<ApiResponse<ConversationDetail>> => {
  return request.post('/conversations', params)
}

/**
 * 获取会话详情
 *
 * @param id - 会话 ID
 * @returns 会话详情
 */
export const getConversationDetail = (id: number): Promise<ApiResponse<ConversationDetail>> => {
  return request.get(`/conversations/${id}`)
}

/**
 * 标记会话全部消息为已读
 *
 * @param conversationId - 会话 ID
 * @returns 操作结果
 */
export const markConversationRead = (conversationId: number): Promise<ApiResponse> => {
  return request.put(`/conversations/${conversationId}/read-all`)
}

/**
 * 获取消息列表（倒序，最新在前）
 *
 * @param conversationId - 会话 ID
 * @param page - 页码，默认 1
 * @param pageSize - 每页数量，默认 30
 * @returns 消息列表响应
 */
export const getMessages = (
  conversationId: number,
  page = 1,
  pageSize = 30,
): Promise<ApiResponse<MessageListResponse>> => {
  return request.get(`/conversations/${conversationId}/messages`, {
    params: { page, page_size: pageSize },
  })
}

/**
 * 发送消息
 *
 * @param conversationId - 会话 ID
 * @param params - 消息内容
 * @returns 发送的消息
 */
export const sendMessage = (
  conversationId: number,
  params: SendMessageParams,
): Promise<ApiResponse<MessageItem>> => {
  return request.post(`/conversations/${conversationId}/messages`, params)
}

/**
 * 撤回消息（仅限 5 分钟内发送者本人）
 *
 * @param messageId - 消息 ID
 * @returns 操作结果
 */
export const recallMessage = (messageId: number): Promise<ApiResponse> => {
  return request.put(`/messages/${messageId}/recall`)
}

/**
 * 删除本地消息记录（不影响对方）
 *
 * @param messageId - 消息 ID
 * @returns 操作结果
 */
export const deleteMessage = (messageId: number): Promise<ApiResponse> => {
  return request.delete(`/messages/${messageId}`)
}

/**
 * 获取会话个人设置
 *
 * @param conversationId - 会话 ID
 * @returns 会话设置
 */
export const getConversationSettings = (
  conversationId: number,
): Promise<ApiResponse<ConversationSetting>> => {
  return request.get(`/conversations/${conversationId}/settings`)
}

/**
 * 更新会话个人设置（置顶/免打扰）
 *
 * @param conversationId - 会话 ID
 * @param params - 设置参数
 * @returns 更新后的设置
 */
export const updateConversationSettings = (
  conversationId: number,
  params: UpdateSettingsParams,
): Promise<ApiResponse<ConversationSetting>> => {
  return request.put(`/conversations/${conversationId}/settings`, params)
}
