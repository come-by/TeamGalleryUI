import type { ApiResponse, PaginatedResponse } from '@/types'
import type { Article } from '@/types/article'

import request from './request'

export const getManuals = (
  page = 1,
  pageSize = 10,
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/manuals', {
    params: { page, page_size: pageSize, type: 'manual', status: 'published' },
  })
}

export const getManualDetail = (id: number): Promise<ApiResponse<Article>> => {
  return request.get(`/manuals/${id}`)
}
