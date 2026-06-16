import type { ApiResponse, Article, ArticleListParams, PaginatedResponse } from '@/types'

import request from './request'

export type { Article, ArticleListParams }

/**
 * 获取文章列表
 *
 * @param params - 查询参数（支持分页、筛选和 type 参数）
 * @returns 文章分页数据
 */
export const getArticles = (
  params: ArticleListParams & { type?: string },
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/articles', { params })
}

/**
 * 获取单篇文章详情
 *
 * @param id - 文章 ID
 * @returns 文章数据
 */
export const getArticle = (id: number): Promise<ApiResponse<Article>> => {
  return request.get(`/articles/${id}`)
}

/**
 * 创建文章
 *
 * @param data - 文章创建参数
 * @returns 创建的文章数据
 */
export const createArticle = (data: Partial<Article>): Promise<ApiResponse<Article>> => {
  return request.post('/articles', data)
}

/**
 * 更新文章
 *
 * @param id - 文章 ID
 * @param data - 文章更新参数
 * @returns 更新后的文章数据
 */
export const updateArticle = (
  id: number,
  data: Partial<Article>,
): Promise<ApiResponse<Article>> => {
  return request.put(`/articles/${id}`, data)
}

/**
 * 删除文章
 *
 * @param id - 文章 ID
 * @returns 操作结果
 */
export const deleteArticle = (id: number): Promise<ApiResponse> => {
  return request.delete(`/articles/${id}`)
}

/**
 * 获取最新文章列表
 *
 * @param count - 获取数量，默认 5
 * @returns 最新文章数组
 */
export const getLatestArticles = (count = 5): Promise<ApiResponse<Article[]>> => {
  return request.get('/articles/latest', { params: { count } })
}

/**
 * 获取指定用户的文章列表
 *
 * @param userId - 用户 ID
 * @param params - 分页参数
 * @returns 用户文章分页数据
 */
export const getUserArticles = (
  userId: number,
  params: ArticleListParams,
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get(`/users/${userId}/articles`, { params })
}
