import type { ApiResponse, Article, PaginatedResponse } from '@/types'

import request from './request'

/** 搜索参数 */
export interface SearchParams {
  q: string
  page?: number
  page_size?: number
  highlight?: boolean
}

/**
 * 全局搜索文章
 *
 * @param params - 搜索参数
 * @returns 搜索结果分页数据
 */
export const searchArticles = (
  params: SearchParams,
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/search', { params })
}

/**
 * 获取搜索建议
 *
 * @param q - 搜索关键词
 * @param limit - 返回数量，默认 10
 * @returns 搜索建议列表
 */
export const getSuggestions = (q: string, limit = 10): Promise<ApiResponse<string[]>> => {
  return request.get('/search/suggestions', { params: { q, limit } })
}

/**
 * 按标签搜索文章
 *
 * @param tagId - 标签 ID
 * @param params - 分页参数
 * @param params.page - 页码
 * @param params.page_size - 每页数量
 * @returns 文章分页数据
 */
export const searchByTag = (
  tagId: number,
  params: { page?: number; page_size?: number },
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get(`/search/tags/${tagId}`, { params })
}

/**
 * 按分类搜索文章
 *
 * @param categoryId - 分类 ID
 * @param params - 分页参数
 * @param params.page - 页码
 * @param params.page_size - 每页数量
 * @returns 文章分页数据
 */
export const searchByCategory = (
  categoryId: number,
  params: { page?: number; page_size?: number },
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get(`/search/categories/${categoryId}`, { params })
}
