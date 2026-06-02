import request from './request'
import type {
  ApiResponse,
  PaginatedResponse,
  Comment,
  CreateCommentParams,
  CommentListParams,
} from '@/types'

export type { Comment, CreateCommentParams, CommentListParams }

export const getComments = (
  articleId: number,
  params: { page?: number; page_size?: number }
): Promise<ApiResponse<PaginatedResponse<Comment>>> => {
  return request.get(`/articles/${articleId}/comments`, { params })
}

export const createComment = (
  articleId: number,
  data: CreateCommentParams
): Promise<ApiResponse<Comment>> => {
  return request.post(`/articles/${articleId}/comments`, data)
}

export const deleteComment = (commentId: number): Promise<ApiResponse> => {
  return request.delete(`/comments/${commentId}`)
}

export const likeComment = (commentId: number): Promise<ApiResponse> => {
  return request.post(`/comments/${commentId}/like`)
}

export const reportComment = (commentId: number): Promise<ApiResponse> => {
  return request.post(`/comments/${commentId}/report`)
}

export const getCommentStatistics = (articleId: number): Promise<ApiResponse> => {
  return request.get(`/articles/${articleId}/comments/statistics`)
}

export const getUserComments = (
  userId: number,
  params: { page?: number; page_size?: number }
): Promise<ApiResponse<PaginatedResponse<Comment>>> => {
  return request.get(`/users/${userId}/comments`, { params })
}

export const getPendingComments = (params: {
  page?: number
  page_size?: number
}): Promise<ApiResponse<PaginatedResponse<Comment>>> => {
  return request.get('/admin/comments/pending', { params })
}

export const approveComment = (commentId: number): Promise<ApiResponse> => {
  return request.put(`/admin/comments/${commentId}/approve`)
}

export const rejectComment = (commentId: number): Promise<ApiResponse> => {
  return request.put(`/admin/comments/${commentId}/reject`)
}
