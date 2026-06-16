import type { ApiResponse, PaginatedResponse } from '@/types'
import type {
  ProjectComment,
  ProjectCommentCreateParams,
  ProjectCommentListParams,
} from '@/types/project'

import request from './request'

/**
 * 获取项目评论列表（树形结构）
 *
 * @param projectId - 项目 ID
 * @param params - 查询参数
 * @returns 项目评论分页数据
 */
export const getProjectComments = (
  projectId: number,
  params: ProjectCommentListParams = {},
): Promise<ApiResponse<PaginatedResponse<ProjectComment>>> => {
  return request.get(`/projects/${projectId}/comments`, { params })
}

/**
 * 获取项目评论统计
 *
 * @param projectId - 项目 ID
 * @returns 评论统计数据
 */
export const getProjectCommentStatistics = (
  projectId: number,
): Promise<ApiResponse<{ total: number; approved: number; pending: number; rejected: number }>> => {
  return request.get(`/projects/${projectId}/comments/statistics`)
}

/**
 * 创建项目评论
 *
 * @param projectId - 项目 ID
 * @param data - 创建参数
 * @returns 创建的评论数据
 */
export const createProjectComment = (
  projectId: number,
  data: ProjectCommentCreateParams,
): Promise<ApiResponse<ProjectComment>> => {
  return request.post(`/projects/${projectId}/comments`, data)
}

/**
 * 删除项目评论
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const deleteProjectComment = (commentId: number): Promise<ApiResponse> => {
  return request.delete(`/project-comments/${commentId}`)
}

/**
 * 点赞项目评论
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const likeProjectComment = (commentId: number): Promise<ApiResponse> => {
  return request.post(`/project-comments/${commentId}/like`)
}

/**
 * 举报项目评论
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const reportProjectComment = (commentId: number): Promise<ApiResponse> => {
  return request.post(`/project-comments/${commentId}/report`)
}

/**
 * 获取用户的项目评论列表
 *
 * @param userId - 用户 ID
 * @param params - 查询参数
 * @returns 用户项目评论分页数据
 */
export const getUserProjectComments = (
  userId: number,
  params: ProjectCommentListParams = {},
): Promise<ApiResponse<PaginatedResponse<ProjectComment>>> => {
  return request.get(`/users/${userId}/project-comments`, { params })
}

/**
 * 管理员：获取待审核项目评论
 *
 * @param params - 查询参数
 * @returns 待审核评论分页数据
 */
export const getPendingProjectComments = (
  params: ProjectCommentListParams = {},
): Promise<ApiResponse<PaginatedResponse<ProjectComment>>> => {
  return request.get('/admin/project-comments/pending', { params })
}

/**
 * 管理员：审核通过项目评论
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const approveProjectComment = (commentId: number): Promise<ApiResponse> => {
  return request.put(`/admin/project-comments/${commentId}/approve`)
}

/**
 * 管理员：拒绝项目评论
 *
 * @param commentId - 评论 ID
 * @returns 操作结果
 */
export const rejectProjectComment = (commentId: number): Promise<ApiResponse> => {
  return request.put(`/admin/project-comments/${commentId}/reject`)
}
