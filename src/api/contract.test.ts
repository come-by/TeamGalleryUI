/**
 * 契约客户端运行时行为测试
 *
 * 覆盖 contract.get/post/put/delete/patch 的路径参数替换、
 * 查询参数传递、请求体传递、config 透传、错误透传、边界条件。
 *
 * 注意：此文件需要在 gen:api 之后才能通过编译，
 * 因为 import type { paths } 依赖生成的 schemas.ts。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mock 底层 request 模块
// ---------------------------------------------------------------------------
const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()
const mockPatch = vi.fn()

vi.mock('./request', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}))

// ---------------------------------------------------------------------------
// 测试套件
// ---------------------------------------------------------------------------
describe('contract 契约客户端', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contract: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('./contract')
    contract = mod.contract
  })

  afterEach(() => {
    vi.resetModules()
  })

  // ======================== GET ========================
  describe('contract.get', () => {
    it('应该用正确的路径和查询参数调用底层 request.get', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] })

      await contract.get('/articles', {
        params: { query: { page: 1, page_size: 10 } },
      })

      expect(mockGet).toHaveBeenCalledWith('/articles', { page: 1, page_size: 10 }, undefined)
    })

    it('应该替换路径中的 {param} 占位符', async () => {
      mockGet.mockResolvedValue({ success: true, data: {} })

      await contract.get('/articles/{id}', {
        params: { path: { id: 42 } },
      })

      expect(mockGet).toHaveBeenCalledWith('/articles/42', undefined, undefined)
    })

    it('应该同时处理路径参数和查询参数', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] })

      await contract.get('/users/{user_id}/articles', {
        params: { path: { user_id: 99 }, query: { page: 2, page_size: 5 } },
      })

      expect(mockGet).toHaveBeenCalledWith(
        '/users/99/articles',
        { page: 2, page_size: 5 },
        undefined,
      )
    })

    it('应该处理多个路径占位符', async () => {
      mockGet.mockResolvedValue({ success: true, data: {} })

      await contract.get('/projects/{project_id}/members/{member_id}', {
        params: { path: { project_id: 1, member_id: 2 } },
      })

      expect(mockGet).toHaveBeenCalledWith('/projects/1/members/2', undefined, undefined)
    })

    it('应该透传 config 参数', async () => {
      mockGet.mockResolvedValue({ success: true, data: {} })

      await contract.get('/health', {
        config: { timeout: 5000 },
      })

      expect(mockGet).toHaveBeenCalledWith('/health', undefined, { timeout: 5000 })
    })

    it('无查询参数和 config 时应该正确调用', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] })

      await contract.get('/articles')

      expect(mockGet).toHaveBeenCalledWith('/articles', undefined, undefined)
    })

    it('路径中没有占位符时保持原路径不变', async () => {
      mockGet.mockResolvedValue({ success: true, data: {} })

      await contract.get('/health', {
        params: { query: { format: 'json' } },
      })

      expect(mockGet).toHaveBeenCalledWith('/health', { format: 'json' }, undefined)
    })

    it('底层 request 返回错误时应该透传', async () => {
      const error = new Error('Network Error')
      mockGet.mockRejectedValue(error)

      await expect(contract.get('/articles')).rejects.toThrow('Network Error')
    })
  })

  // ======================== POST ========================
  describe('contract.post', () => {
    it('应该传递 body 和查询参数', async () => {
      mockPost.mockResolvedValue({ success: true, data: {} })

      await contract.post('/login', {
        body: { username: 'admin', password: 'password123' },
      })

      expect(mockPost).toHaveBeenCalledWith(
        '/login',
        { username: 'admin', password: 'password123' },
        { params: undefined },
      )
    })

    it('应该替换路径参数后传递 body', async () => {
      mockPost.mockResolvedValue({ success: true })

      await contract.post('/comments/{id}/approve', {
        params: { path: { id: 5 } },
      })

      expect(mockPost).toHaveBeenCalledWith('/comments/5/approve', undefined, { params: undefined })
    })

    it('body 为 undefined 时应该正常调用', async () => {
      mockPost.mockResolvedValue({ success: true })

      await contract.post('/articles')

      expect(mockPost).toHaveBeenCalledWith('/articles', undefined, { params: undefined })
    })
  })

  // ======================== PUT ========================
  describe('contract.put', () => {
    it('应该同时传递 path params 和 body', async () => {
      mockPut.mockResolvedValue({ success: true, data: {} })

      await contract.put('/articles/{id}', {
        params: { path: { id: 1 } },
        body: { title: 'Updated' },
      })

      expect(mockPut).toHaveBeenCalledWith(
        '/articles/1',
        { title: 'Updated' },
        { params: undefined },
      )
    })
  })

  // ======================== DELETE ========================
  describe('contract.delete', () => {
    it('应该调用底层 request.delete', async () => {
      mockDelete.mockResolvedValue({ success: true })

      await contract.delete('/articles/{id}', {
        params: { path: { id: 1 } },
      })

      expect(mockDelete).toHaveBeenCalledWith('/articles/1', undefined, undefined)
    })

    it('无 path params 时应该直接使用原始路径', async () => {
      mockDelete.mockResolvedValue({ success: true })

      await contract.delete('/articles/{id}')

      expect(mockDelete).toHaveBeenCalledWith('/articles/{id}', undefined, undefined)
    })
  })

  // ======================== PATCH ========================
  describe('contract.patch', () => {
    it('应该调用底层 request.patch 并传递 body', async () => {
      mockPatch.mockResolvedValue({ success: true, data: {} })

      await contract.patch('/projects/{id}', {
        params: { path: { id: 1 } },
        body: { status: 'archived' },
      })

      expect(mockPatch).toHaveBeenCalledWith(
        '/projects/1',
        { status: 'archived' },
        { params: undefined },
      )
    })
  })
})
