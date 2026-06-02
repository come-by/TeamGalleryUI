import request from './request'
import type {
  ApiResponse,
  PaginatedResponse,
  Article,
  InteractionStatus,
  InteractionListParams,
} from '@/types'

export type { InteractionStatus, InteractionListParams }

export const likeArticle = (articleId: number): Promise<ApiResponse> => {
  return request.post(`/articles/${articleId}/like`)
}

export const unlikeArticle = (articleId: number): Promise<ApiResponse> => {
  return request.delete(`/articles/${articleId}/like`)
}

export const favoriteArticle = (articleId: number): Promise<ApiResponse> => {
  return request.post(`/articles/${articleId}/favorite`)
}

export const unfavoriteArticle = (articleId: number): Promise<ApiResponse> => {
  return request.delete(`/articles/${articleId}/favorite`)
}

export const getFavorites = (params: {
  page?: number
  page_size?: number
}): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/favorites', { params })
}

export const getLikes = (params: {
  page?: number
  page_size?: number
}): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/likes', { params })
}

export const getInteractionStatus = (
  articleId: number
): Promise<ApiResponse<InteractionStatus>> => {
  return request.get(`/articles/${articleId}/interaction/status`)
}
