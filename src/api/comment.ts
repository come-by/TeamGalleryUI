import type {
  ApiResponse,
  Comment,
  CommentListParams,
  CreateCommentParams,
  PaginatedResponse,
} from '@/types'

import request from './request'

export type { Comment, CommentListParams, CreateCommentParams }

/**
 * 获取文章评论列表
 *
 * @param articleId - 文章 ID
 * @param params - 分页参数
 * @param params.page - 页码
 * @param params.page_size - 每页数量
 * @returns 评论分页数据
 */
export const getComments = (
  articleId: number,
  params: { page?: number; page_size?: number },
): Promise<ApiResponse<PaginatedResponse<Comment>>> => {
  return request.get(`/articles/${articleId}/comments`, { params })
}

/**
 * 创建评论
 *
 * @param articleId - 文章 ID
 * @param data - 评论创建参数
 * @returns 创建的评论数据
 */
export const createComment = (
  articleId: number,
  data: CreateCommentParams,
): Promise<ApiResponse<Comment>> => {
  return request.post(`/articles/${articleId}/comments`, data)
}

/**
 * 删除评论
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const deleteComment = (commentId: number): Promise<ApiResponse> => {
  return request.delete(`/comments/${commentId}`)
}

/**
 * 点赞评论
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const likeComment = (commentId: number): Promise<ApiResponse> => {
  return request.post(`/comments/${commentId}/like`)
}

/**
 * 举报评论
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const reportComment = (commentId: number): Promise<ApiResponse> => {
  return request.post(`/comments/${commentId}/report`)
}

/**
 * 获取文章评论统计
 *
 * @param articleId - 文章 ID
 * @returns 评论统计数据
 */
export const getCommentStatistics = (articleId: number): Promise<ApiResponse> => {
  return request.get(`/articles/${articleId}/comments/statistics`)
}

/**
 * 获取用户评论列表
 *
 * @param userId - 用户 ID
 * @param params - 分页参数
 * @param params.page - 页码
 * @param params.page_size - 每页数量
 * @returns 用户评论分页数据
 */
export const getUserComments = (
  userId: number,
  params: { page?: number; page_size?: number },
): Promise<ApiResponse<PaginatedResponse<Comment>>> => {
  return request.get(`/users/${userId}/comments`, { params })
}

/**
 * 获取待审核评论列表（管理员）
 *
 * @param params - 分页参数
 * @param params.page - 页码
 * @param params.page_size - 每页数量
 * @returns 待审核评论分页数据
 */
export const getPendingComments = (params: {
  page?: number
  page_size?: number
}): Promise<ApiResponse<PaginatedResponse<Comment>>> => {
  return request.get('/admin/comments/pending', { params })
}

/**
 * 审核通过评论（管理员）
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const approveComment = (commentId: number): Promise<ApiResponse> => {
  return request.put(`/admin/comments/${commentId}/approve`)
}

/**
 * 拒绝评论（管理员）
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const rejectComment = (commentId: number): Promise<ApiResponse> => {
  return request.put(`/admin/comments/${commentId}/reject`)
}
