import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { server } from '@/mocks/server'

// Ensure vi is recognized as used (vi.mock is hoisted)
void vi

const API_BASE = '/api/v1'

// MSW 服务器生命周期管理
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('MSW 集成测试 - 认证模块', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('登录', () => {
    it('应该成功登录并返回 token', async () => {
      const response = await axios.post(`${API_BASE}/login`, {
        username: 'admin',
        password: 'Admin@123',
      })

      expect(response.data.success).toBe(true)
      expect(response.data.data.access_token).toBe('admin-token')
      expect(response.data.data.refresh_token).toBe('refresh-admin-token')
      expect(response.data.data.user.username).toBe('admin')
    })

    it('应该返回错误当用户名不存在', async () => {
      try {
        await axios.post(`${API_BASE}/login`, {
          username: 'nonexistent',
          password: 'test',
        })
      } catch (error: unknown) {
        const err = error as { response: { data: { error: { code: string } }; status: number } }
        expect(err.response.status).toBe(404)
        expect(err.response.data.error.code).toBe('USER_NOT_FOUND')
      }
    })

    it('应该返回错误当密码不正确', async () => {
      try {
        await axios.post(`${API_BASE}/login`, {
          username: 'admin',
          password: 'wrongpassword',
        })
      } catch (error: unknown) {
        const err = error as { response: { data: { error: { code: string } }; status: number } }
        expect(err.response.status).toBe(401)
        expect(err.response.data.error.code).toBe('INVALID_CREDENTIALS')
      }
    })
  })

  describe('注册', () => {
    it('应该成功注册', async () => {
      const response = await axios.post(`${API_BASE}/register`, {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Newpass123',
      })

      expect(response.data.success).toBe(true)
    })

    it('应该返回错误当用户名已存在', async () => {
      try {
        await axios.post(`${API_BASE}/register`, {
          username: 'admin',
          email: 'other@example.com',
          password: 'test123',
        })
      } catch (error: unknown) {
        const err = error as { response: { data: { error: { code: string } }; status: number } }
        expect(err.response.status).toBe(409)
        expect(err.response.data.error.code).toBe('USER_EXISTS')
      }
    })

    it('应该返回错误当密码太短', async () => {
      try {
        await axios.post(`${API_BASE}/register`, {
          username: 'newuser2',
          email: 'new2@example.com',
          password: '123',
        })
      } catch (error: unknown) {
        const err = error as {
          response: { data: { error: { details: Array<{ field: string }> } }; status: number }
        }
        expect(err.response.status).toBe(400)
        expect(err.response.data.error.details[0].field).toBe('password')
      }
    })
  })

  describe('Token 刷新', () => {
    it('应该成功刷新 token', async () => {
      const response = await axios.post(`${API_BASE}/auth/refresh`, {
        refresh_token: 'refresh-test-token',
      })

      expect(response.data.success).toBe(true)
      expect(response.data.data.access_token).toBe('test-token')
    })

    it('应该返回错误当刷新令牌无效', async () => {
      try {
        await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: 'invalid-token' })
      } catch (error: unknown) {
        const err = error as { response: { status: number } }
        expect(err.response.status).toBe(401)
      }
    })
  })
})

describe('MSW 集成测试 - 文章模块', () => {
  describe('获取文章列表', () => {
    it('应该返回已发布的文章列表', async () => {
      const response = await axios.get(`${API_BASE}/articles`)

      expect(response.data.success).toBe(true)
      expect(response.data.data.data.length).toBeGreaterThan(0)
      expect(response.data.data.pagination.total).toBeGreaterThan(0)
      // 只返回 published 状态的文章
      expect(
        response.data.data.data.every((a: { status: string }) => a.status === 'published'),
      ).toBe(true)
    })

    it('应该支持分页', async () => {
      const response = await axios.get(`${API_BASE}/articles`, {
        params: { page: 1, page_size: 1 },
      })

      expect(response.data.data.data.length).toBe(1)
      expect(response.data.data.pagination.page).toBe(1)
      expect(response.data.data.pagination.page_size).toBe(1)
    })

    it('应该支持按分类筛选', async () => {
      const response = await axios.get(`${API_BASE}/articles`, {
        params: { category: '前端' },
      })

      expect(
        response.data.data.data.every((a: { category: string }) => a.category === '前端'),
      ).toBe(true)
    })

    it('应该支持按标签筛选', async () => {
      const response = await axios.get(`${API_BASE}/articles`, {
        params: { tag: 'Vue' },
      })

      expect(response.data.data.data.every((a: { tags: string[] }) => a.tags.includes('Vue'))).toBe(
        true,
      )
    })

    it('应该支持关键词搜索', async () => {
      const response = await axios.get(`${API_BASE}/articles`, {
        params: { keyword: 'Vue' },
      })

      expect(response.data.data.data.length).toBeGreaterThan(0)
    })
  })

  describe('获取文章详情', () => {
    it('应该返回文章详情', async () => {
      const response = await axios.get(`${API_BASE}/articles/1`)

      expect(response.data.success).toBe(true)
      expect(response.data.data.id).toBe(1)
      expect(response.data.data.title).toBeDefined()
    })

    it('应该返回 404 当文章不存在', async () => {
      try {
        await axios.get(`${API_BASE}/articles/999`)
      } catch (error: unknown) {
        const err = error as { response: { status: number; data: { error: { code: string } } } }
        expect(err.response.status).toBe(404)
        expect(err.response.data.error.code).toBe('ARTICLE_NOT_FOUND')
      }
    })
  })

  describe('创建文章', () => {
    it('应该成功创建文章', async () => {
      const response = await axios.post(
        `${API_BASE}/articles`,
        {
          title: '测试文章',
          content: '这是测试内容',
          category: '测试',
          tags: ['test'],
          status: 'draft',
        },
        {
          headers: { Authorization: 'Bearer test-token' },
        },
      )

      expect(response.data.success).toBe(true)
      expect(response.data.data.title).toBe('测试文章')
    })

    it('应该返回 401 当未登录', async () => {
      try {
        await axios.post(`${API_BASE}/articles`, { title: '测试' })
      } catch (error: unknown) {
        const err = error as { response: { status: number } }
        expect(err.response.status).toBe(401)
      }
    })

    it('应该返回验证错误当标题为空', async () => {
      try {
        await axios.post(
          `${API_BASE}/articles`,
          { content: '内容' },
          { headers: { Authorization: 'Bearer test-token' } },
        )
      } catch (error: unknown) {
        const err = error as {
          response: { data: { error: { details: Array<{ field: string }> } } }
        }
        expect(err.response.data.error.details[0].field).toBe('title')
      }
    })
  })

  describe('更新文章', () => {
    it('应该成功更新文章', async () => {
      const response = await axios.put(
        `${API_BASE}/articles/1`,
        { title: '更新后的标题' },
        { headers: { Authorization: 'Bearer test-token' } },
      )

      expect(response.data.success).toBe(true)
      expect(response.data.data.title).toBe('更新后的标题')
    })
  })

  describe('删除文章', () => {
    it('应该成功删除文章', async () => {
      const response = await axios.delete(`${API_BASE}/articles/1`, {
        headers: { Authorization: 'Bearer test-token' },
      })

      expect(response.data.success).toBe(true)
    })
  })

  describe('点赞文章', () => {
    it('应该切换点赞状态', async () => {
      // 第一次点赞
      const response1 = await axios.post(
        `${API_BASE}/articles/2/like`,
        {},
        { headers: { Authorization: 'Bearer test-token' } },
      )
      expect(response1.data.data.is_liked).toBe(true)
      expect(response1.data.data.likes).toBe(6)

      // 取消点赞
      const response2 = await axios.post(
        `${API_BASE}/articles/2/like`,
        {},
        { headers: { Authorization: 'Bearer test-token' } },
      )
      expect(response2.data.data.is_liked).toBe(false)
      expect(response2.data.data.likes).toBe(5)
    })
  })

  describe('收藏文章', () => {
    it('应该切换收藏状态', async () => {
      const response = await axios.post(
        `${API_BASE}/articles/2/favorite`,
        {},
        { headers: { Authorization: 'Bearer test-token' } },
      )

      expect(response.data.success).toBe(true)
      expect(response.data.data.is_favorited).toBeDefined()
    })
  })
})

describe('MSW 集成测试 - 用户模块', () => {
  describe('获取用户资料', () => {
    it('应该返回用户资料', async () => {
      const response = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: 'Bearer test-token' },
      })

      expect(response.data.success).toBe(true)
      expect(response.data.data.username).toBe('testuser')
    })

    it('应该返回 401 当未登录', async () => {
      try {
        await axios.get(`${API_BASE}/profile`)
      } catch (error: unknown) {
        const err = error as { response: { status: number } }
        expect(err.response.status).toBe(401)
      }
    })
  })

  describe('更新用户资料', () => {
    it('应该成功更新资料', async () => {
      const response = await axios.put(
        `${API_BASE}/profile`,
        { nickname: '新昵称', bio: '新简介' },
        { headers: { Authorization: 'Bearer test-token' } },
      )

      expect(response.data.success).toBe(true)
      expect(response.data.data.nickname).toBe('新昵称')
    })
  })

  describe('获取收藏列表', () => {
    it('应该返回收藏列表', async () => {
      const response = await axios.get(`${API_BASE}/favorites`, {
        headers: { Authorization: 'Bearer test-token' },
      })

      expect(response.data.success).toBe(true)
      expect(response.data.data.data.length).toBeGreaterThan(0)
    })
  })

  describe('获取点赞列表', () => {
    it('应该返回点赞列表', async () => {
      const response = await axios.get(`${API_BASE}/likes`, {
        headers: { Authorization: 'Bearer test-token' },
      })

      expect(response.data.success).toBe(true)
      expect(response.data.data.data.length).toBeGreaterThan(0)
    })
  })
})

describe('MSW 动态 Handler 测试', () => {
  it('应该支持运行时覆盖 handler', async () => {
    // 覆盖登录 handler 返回错误
    server.use(
      http.post('/api/v1/login', async () => {
        return HttpResponse.json(
          { success: false, error: { code: 'SERVER_ERROR', message: '服务器维护中' } },
          { status: 503 },
        )
      }),
    )

    try {
      await axios.post(`${API_BASE}/login`, {
        username: 'admin',
        password: 'Admin@123',
      })
    } catch (error: unknown) {
      const err = error as { response: { status: number; data: { error: { code: string } } } }
      expect(err.response.status).toBe(503)
      expect(err.response.data.error.code).toBe('SERVER_ERROR')
    }
  })

  it('重置后应该恢复原始 handler', async () => {
    server.resetHandlers()

    const response = await axios.post(`${API_BASE}/login`, {
      username: 'admin',
      password: 'Admin@123',
    })

    expect(response.data.success).toBe(true)
  })
})

describe('MSW 集成测试 - 搜索模块', () => {
  it('应该搜索文章并返回结果', async () => {
    const response = await axios.get(`${API_BASE}/search`, {
      params: { q: 'Vue' },
    })

    expect(response.data.success).toBe(true)
    expect(response.data.data.data.length).toBeGreaterThan(0)
    const titles = response.data.data.data.map((a: { title: string }) => a.title)
    expect(titles.some((t: string) => t.includes('Vue'))).toBe(true)
  })

  it('空查询应该返回空结果', async () => {
    const response = await axios.get(`${API_BASE}/search`, {
      params: { q: '' },
    })

    expect(response.data.success).toBe(true)
    expect(response.data.data.data.length).toBe(0)
    expect(response.data.data.pagination.total).toBe(0)
  })

  it('无匹配查询应该返回空结果', async () => {
    const response = await axios.get(`${API_BASE}/search`, {
      params: { q: 'xxxxxxNotFound' },
    })

    expect(response.data.success).toBe(true)
    expect(response.data.data.data.length).toBe(0)
  })

  it('应该返回搜索建议', async () => {
    const response = await axios.get(`${API_BASE}/search/suggestions`, {
      params: { q: 'Vue' },
    })

    expect(response.data.success).toBe(true)
    expect(response.data.data.length).toBeGreaterThan(0)
    expect(response.data.data.every((s: string) => s.includes('Vue'))).toBe(true)
  })

  it('查询少于2个字符应该返回空建议', async () => {
    const response = await axios.get(`${API_BASE}/search/suggestions`, {
      params: { q: 'V' },
    })

    expect(response.data.success).toBe(true)
    expect(response.data.data).toEqual([])
  })
})

describe('MSW 集成测试 - 上传模块', () => {
  it('应该上传文件成功', async () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)

    // 先登录获取 token
    const loginRes = await axios.post(`${API_BASE}/login`, {
      username: 'admin',
      password: 'Admin@123',
    })
    const token = loginRes.data.data.access_token
    localStorage.setItem('access_token', token)

    const response = await axios.post(`${API_BASE}/upload/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })

    expect(response.data.success).toBe(true)
    expect(response.data.data.url).toBeTruthy()
    expect(response.data.data.filename).toBe('test.jpg')
  })

  it('未登录上传应该返回 401', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post(`${API_BASE}/upload/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      expect.fail('应该抛出错误')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { status: number; data: { error: { code: string } } }
        }
        expect(axiosError.response.status).toBe(401)
        expect(axiosError.response.data.error.code).toBe('UNAUTHORIZED')
      } else {
        expect.fail('应该返回 AxiosError')
      }
    }
  })

  it('上传不允许的文件类型应该返回 400', async () => {
    const loginRes = await axios.post(`${API_BASE}/login`, {
      username: 'admin',
      password: 'Admin@123',
    })
    const token = loginRes.data.data.access_token

    const file = new File(['test'], 'malware.exe', { type: 'application/x-msdownload' })
    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post(`${API_BASE}/upload/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      expect.fail('应该抛出错误')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { status: number; data: { error: { code: string } } }
        }
        expect(axiosError.response.status).toBe(400)
        expect(axiosError.response.data.error.code).toBe('FILE_TYPE_NOT_ALLOWED')
      } else {
        expect.fail('应该返回 AxiosError')
      }
    }
  })

  it('上传超过大小限制的文件应该返回 400', async () => {
    const loginRes = await axios.post(`${API_BASE}/login`, {
      username: 'admin',
      password: 'Admin@123',
    })
    const token = loginRes.data.data.access_token

    // 11MB 文件
    const bigFile = new File(['x'.repeat(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', bigFile)

    try {
      await axios.post(`${API_BASE}/upload/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      expect.fail('应该抛出错误')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { status: number; data: { error: { code: string } } }
        }
        expect(axiosError.response.status).toBe(400)
        expect(axiosError.response.data.error.code).toBe('FILE_TOO_LARGE')
      } else {
        expect.fail('应该返回 AxiosError')
      }
    }
  })
})
