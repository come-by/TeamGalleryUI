import { http } from 'msw'

import { delay, errorResponse, getRequestBody, successResponse } from '../utils'

// 模拟用户数据库
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    nickname: '管理员',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'testuser',
    email: 'test@example.com',
    nickname: '测试用户',
    password: 'test123',
    role: 'user',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
  },
]

// 登录
export const loginHandler = http.post('/api/v1/login', async ({ request }) => {
  await delay()

  const body = await getRequestBody(request)
  const { username, password } = body

  const user = users.find((u) => u.username === username || u.email === username)

  if (!user) {
    return errorResponse('USER_NOT_FOUND', '用户不存在', 404)
  }

  if (user.password !== password) {
    return errorResponse('INVALID_CREDENTIALS', '用户名或密码错误', 401)
  }

  const { password: _, ...userWithoutPassword } = user
  const token = user.role === 'admin' ? 'admin-token' : 'test-token'

  return successResponse({
    access_token: token,
    refresh_token: `refresh-${token}`,
    expires_in: 3600,
    user: userWithoutPassword,
  })
})

// 注册
export const registerHandler = http.post('/api/v1/register', async ({ request }) => {
  await delay()

  const body = await getRequestBody(request)
  const { username, email, password } = body

  // 检查用户名是否已存在
  if (users.some((u) => u.username === username)) {
    return errorResponse('USER_EXISTS', '用户名已存在', 409)
  }

  // 检查邮箱是否已存在
  if (users.some((u) => u.email === email)) {
    return errorResponse('USER_EXISTS', '邮箱已存在', 409)
  }

  // 验证密码强度
  if (!password || (password as string).length < 8) {
    return errorResponse('VALIDATION_FAILED', '密码长度不能少于8位', 400, [
      { field: 'password', message: '密码长度不能少于8位' },
    ])
  }

  // 验证密码复杂度
  const pwd = password as string
  if (!/[A-Z]/.test(pwd)) {
    return errorResponse('VALIDATION_FAILED', '密码必须包含至少一个大写字母', 400, [
      { field: 'password', message: '密码必须包含至少一个大写字母' },
    ])
  }
  if (!/[a-z]/.test(pwd)) {
    return errorResponse('VALIDATION_FAILED', '密码必须包含至少一个小写字母', 400, [
      { field: 'password', message: '密码必须包含至少一个小写字母' },
    ])
  }
  if (!/[0-9]/.test(pwd)) {
    return errorResponse('VALIDATION_FAILED', '密码必须包含至少一个数字', 400, [
      { field: 'password', message: '密码必须包含至少一个数字' },
    ])
  }

  return successResponse({ message: '注册成功' })
})

// 获取用户资料
export const getProfileHandler = http.get('/api/v1/profile', async ({ request }) => {
  await delay()

  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('UNAUTHORIZED', '未登录', 401)
  }

  const token = authHeader.replace('Bearer ', '')
  const user = users.find((u) => {
    const expectedToken = u.role === 'admin' ? 'admin-token' : 'test-token'
    return token === expectedToken
  })

  if (!user) {
    return errorResponse('USER_NOT_FOUND', '用户不存在', 404)
  }

  const { password: _, ...userWithoutPassword } = user
  return successResponse(userWithoutPassword)
})

// 刷新 Token
export const refreshTokenHandler = http.post('/api/v1/token/refresh', async ({ request }) => {
  await delay()

  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('UNAUTHORIZED', '无效的刷新令牌', 401)
  }

  const refreshToken = authHeader.replace('Bearer ', '')

  // 验证刷新令牌
  if (!refreshToken.startsWith('refresh-')) {
    return errorResponse('UNAUTHORIZED', '刷新令牌已过期', 401)
  }

  const originalToken = refreshToken.replace('refresh-', '')
  return successResponse({
    access_token: originalToken,
    refresh_token: refreshToken,
    expires_in: 3600,
  })
})

export const authHandlers = [loginHandler, registerHandler, getProfileHandler, refreshTokenHandler]
