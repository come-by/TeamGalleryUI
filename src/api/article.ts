import type { ApiResponse, PaginatedResponse } from '@/types'
import type { Article, ArticleListParams } from '@/types'

import request from './request'

export type { Article, ArticleListParams }

export const getArticles = (
  params: ArticleListParams
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/articles', { params })
}

export const getArticle = (id: number): Promise<ApiResponse<Article>> => {
  return request.get(`/articles/${id}`)
}

export const createArticle = (data: Partial<Article>): Promise<ApiResponse<Article>> => {
  return request.post('/articles', data)
}

export const updateArticle = (
  id: number,
  data: Partial<Article>
): Promise<ApiResponse<Article>> => {
  return request.put(`/articles/${id}`, data)
}

export const deleteArticle = (id: number): Promise<ApiResponse> => {
  return request.delete(`/articles/${id}`)
}

export const getLatestArticles = (count = 5): Promise<ApiResponse<Article[]>> => {
  return request.get('/articles/latest', { params: { count } })
}

export const getUserArticles = (
  userId: number,
  params: ArticleListParams
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get(`/users/${userId}/articles`, { params })
}
