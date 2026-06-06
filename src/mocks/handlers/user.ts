import { http } from 'msw'

import {
  delay,
  errorResponse,
  getQueryParam,
  getRequestBody,
  paginatedResponse,
  successResponse,
  verifyToken,
} from '../utils'

// 模拟用户列表（与 auth 模块共享数据结构）
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    nickname: '管理员',
    avatar: 'https://example.com/avatar1.jpg',
    bio: '全栈开发者',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'testuser',
    email: 'test@example.com',
    nickname: '测试用户',
    avatar: 'https://example.com/avatar2.jpg',
    bio: '前端爱好者',
    role: 'user',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
  },
]

// 模拟收藏列表
const favorites = [1, 2]

// 模拟点赞列表
const likes = [1]

// 获取用户列表
export const getUsersHandler = http.get('/api/v1/users', async ({ request }) => {
  await delay()

  if (!verifyToken(request)) {
    return errorResponse('UNAUTHORIZED', '请先登录', 401)
  }

  const page = parseInt(getQueryParam(request, 'page') || '1', 10)
  const pageSize = parseInt(getQueryParam(request, 'page_size') || '10', 10)
  const keyword = getQueryParam(request, 'keyword')

  let filtered = users

  if (keyword) {
    const kw = keyword.toLowerCase()
    filtered = users.filter(
      (u) => u.username.toLowerCase().includes(kw) || u.nickname.toLowerCase().includes(kw)
    )
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return paginatedResponse(list, total, page, pageSize)
})

// 获取用户详情
export const getUserHandler = http.get('/api/v1/users/:id', async ({ params }) => {
  await delay()

  const id = parseInt(params.id as string, 10)
  const user = users.find((u) => u.id === id)

  if (!user) {
    return errorResponse('USER_NOT_FOUND', '用户不存在', 404)
  }

  return successResponse(user)
})

// 更新用户资料
export const updateProfileHandler = http.put('/api/v1/profile', async ({ request }) => {
  await delay()

  if (!verifyToken(request)) {
    return errorResponse('UNAUTHORIZED', '请先登录', 401)
  }

  const body = await getRequestBody(request)
  const nickname = body.nickname as string | undefined
  const avatar = body.avatar as string | undefined
  const bio = body.bio as string | undefined

  // 更新第一个用户（模拟当前登录用户）
  if (nickname) users[0].nickname = nickname
  if (avatar) users[0].avatar = avatar
  if (bio !== undefined) users[0].bio = bio

  return successResponse(users[0])
})

// 获取我的收藏列表
export const getFavoritesHandler = http.get('/api/v1/favorites', async ({ request }) => {
  await delay()

  if (!verifyToken(request)) {
    return errorResponse('UNAUTHORIZED', '请先登录', 401)
  }

  const page = parseInt(getQueryParam(request, 'page') || '1', 10)
  const pageSize = parseInt(getQueryParam(request, 'page_size') || '10', 10)

  const total = favorites.length
  const start = (page - 1) * pageSize
  const list = favorites.slice(start, start + pageSize).map((id) => ({ article_id: id }))

  return paginatedResponse(list, total, page, pageSize)
})

// 获取我的点赞列表
export const getLikesHandler = http.get('/api/v1/likes', async ({ request }) => {
  await delay()

  if (!verifyToken(request)) {
    return errorResponse('UNAUTHORIZED', '请先登录', 401)
  }

  const page = parseInt(getQueryParam(request, 'page') || '1', 10)
  const pageSize = parseInt(getQueryParam(request, 'page_size') || '10', 10)

  const total = likes.length
  const start = (page - 1) * pageSize
  const list = likes.slice(start, start + pageSize).map((id) => ({ article_id: id }))

  return paginatedResponse(list, total, page, pageSize)
})

export const userHandlers = [
  getUsersHandler,
  getUserHandler,
  updateProfileHandler,
  getFavoritesHandler,
  getLikesHandler,
]
