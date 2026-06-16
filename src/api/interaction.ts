import type {
  ApiResponse,
  Article,
  InteractionListParams,
  InteractionStatus,
  PaginatedResponse,
} from '@/types'

import request from './request'

export type { InteractionListParams, InteractionStatus }

/**
 * 点赞文章
 *
 * @param articleId - 文章 ID
 * @returns 操作结果
 */
export const likeArticle = (articleId: number): Promise<ApiResponse> => {
  return request.post(`/articles/${articleId}/like`)
}

/**
 * 取消点赞文章
 *
 * @param articleId - 文章 ID
 * @returns 操作结果
 */
export const unlikeArticle = (articleId: number): Promise<ApiResponse> => {
  return request.delete(`/articles/${articleId}/like`)
}

/**
 * 收藏文章
 *
 * @param articleId - 文章 ID
 * @returns 操作结果
 */
export const favoriteArticle = (articleId: number): Promise<ApiResponse> => {
  return request.post(`/articles/${articleId}/favorite`)
}

/**
 * 取消收藏文章
 *
 * @param articleId - 文章 ID
 * @returns 操作结果
 */
export const unfavoriteArticle = (articleId: number): Promise<ApiResponse> => {
  return request.delete(`/articles/${articleId}/favorite`)
}

/**
 * 获取收藏列表
 *
 * @param params - 分页参数
 * @param params.page - 页码
 * @param params.page_size - 每页数量
 * @returns 收藏文章分页数据
 */
export const getFavorites = (params: {
  page?: number
  page_size?: number
}): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/favorites', { params })
}

/**
 * 获取点赞列表
 *
 * @param params - 分页参数
 * @param params.page - 页码
 * @param params.page_size - 每页数量
 * @returns 点赞文章分页数据
 */
export const getLikes = (params: {
  page?: number
  page_size?: number
}): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/likes', { params })
}

/**
 * 获取文章互动状态（是否已点赞、已收藏）
 *
 * @param articleId - 文章 ID
 * @returns 互动状态数据
 */
export const getInteractionStatus = (
  articleId: number,
): Promise<ApiResponse<InteractionStatus>> => {
  return request.get(`/articles/${articleId}/interaction/status`)
}
