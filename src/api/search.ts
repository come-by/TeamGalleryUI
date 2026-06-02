import request, { type ApiResponse, type PaginatedResponse } from './request'
import type { Article } from './article'

export interface SearchParams {
  q: string
  page?: number
  page_size?: number
  highlight?: boolean
}

export const searchArticles = (
  params: SearchParams
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/search', { params })
}

export const getSuggestions = (q: string, limit = 10): Promise<ApiResponse<string[]>> => {
  return request.get('/search/suggestions', { params: { q, limit } })
}

export const searchByTag = (
  tagId: number,
  params: { page?: number; page_size?: number }
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get(`/search/tags/${tagId}`, { params })
}

export const searchByCategory = (
  categoryId: number,
  params: { page?: number; page_size?: number }
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get(`/search/categories/${categoryId}`, { params })
}
