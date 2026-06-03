// MSW 通用类型和工具
import { http, HttpResponse } from 'msw'
import type { ApiResponse, PaginatedResponse } from '@/types'

// 模拟延迟
export const delay = (ms: number = 200) => new Promise((resolve) => setTimeout(resolve, ms))

// 成功响应
export const successResponse = <T>(data: T): HttpResponse => {
  const response: ApiResponse<T> = { success: true, data }
  return HttpResponse.json(response)
}

// 错误响应
export const errorResponse = (code: string, message: string, status: number = 400, details?: Array<{ field: string; message: string }>): HttpResponse => {
  const response: ApiResponse<never> = {
    success: false,
    error: { code, message, details },
  }
  return HttpResponse.json(response, { status })
}

// 分页响应
export const paginatedResponse = <T>(list: T[], total: number, page: number = 1, pageSize: number = 10): HttpResponse => {
  const data: PaginatedResponse<T> = { list, total, page, page_size: pageSize }
  return successResponse(data)
}

// 从请求中获取 JSON body
export const getRequestBody = async (request: Request): Promise<Record<string, unknown>> => {
  try {
    return (await request.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

// 从请求中获取 query 参数
export const getQueryParam = (request: Request, param: string): string | null => {
  const url = new URL(request.url)
  return url.searchParams.get(param)
}

// 验证 token
export const verifyToken = (request: Request): boolean => {
  const authHeader = request.headers.get('Authorization')
  return !!authHeader && authHeader.startsWith('Bearer ')
}

// 获取 token 中的用户信息（简化版）
export const getTokenUser = (request: Request): { id: number; role: string } | null => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  // 简化：从 localStorage 模拟的 token 推断
  const token = authHeader.replace('Bearer ', '')
  if (token === 'admin-token') return { id: 1, role: 'admin' }
  if (token === 'test-token') return { id: 1, role: 'user' }
  return null
}
