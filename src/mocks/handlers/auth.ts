import { http, HttpResponse } from 'msw'

import { delay, errorResponse, getRequestBody } from '../utils'

// 模拟用户数据库
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    nickname: '管理员',
    phone: '13800000001',
    password: 'Admin@123',
    bio: '全栈开发者',
    website: 'https://admin.dev',
    github: 'admin-dev',
    twitter: 'admin_dev',
    location: '北京',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'testuser',
    email: 'test@example.com',
    nickname: '测试用户',
    phone: '13800000002',
    password: 'test123',
    bio: '前端爱好者',
    website: 'https://test.dev',
    github: 'test-user',
    twitter: 'test_user',
    location: '上海',
    role: 'user',
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

  // refresh_token 通过 HttpOnly Cookie 下发，不出现在 JSON body
  const cookieValue = `refresh_token=refresh-${token}`

  return HttpResponse.json(
    {
      success: true,
      data: {
        access_token: token,
        token_type: 'Bearer',
        expires_in: 900,
        user: userWithoutPassword,
      },
    },
    {
      headers: {
        'Set-Cookie': `${cookieValue}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=604800`,
      },
    },
  )
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

  return HttpResponse.json({ success: true, data: { message: '注册成功' } })
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
  return HttpResponse.json({ success: true, data: userWithoutPassword })
})

// 刷新 Token
// RefreshToken 通过 HttpOnly Cookie 携带，不再从请求体读取
export const refreshTokenHandler = http.post('/api/v1/auth/refresh', async ({ request }) => {
  await delay()

  // 从 Cookie 头读取 refresh_token
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/refresh_token=([^;]+)/)
  const refreshTokenCookie = match ? match[1] : ''

  // 验证刷新令牌
  if (!refreshTokenCookie || !refreshTokenCookie.startsWith('refresh-')) {
    return errorResponse('UNAUTHORIZED', '刷新令牌已过期', 401)
  }

  const originalToken = refreshTokenCookie.replace('refresh-', '')

  return HttpResponse.json(
    {
      success: true,
      data: {
        access_token: originalToken,
        token_type: 'Bearer',
        expires_in: 900,
      },
    },
    {
      headers: {
        'Set-Cookie': `refresh_token=${refreshTokenCookie}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=604800`,
      },
    },
  )
})

// 登出
// Cookie 自动携带，无需请求体传参。响应清除 Cookie。
export const logoutHandler = http.post('/api/v1/auth/logout', async ({ request }) => {
  await delay()

  const cookieHeader = request.headers.get('cookie') || ''
  const hasRefreshToken = cookieHeader.includes('refresh_token=')

  if (!hasRefreshToken) {
    return errorResponse('UNAUTHORIZED', '未提供 Refresh Token', 401)
  }

  return HttpResponse.json(
    { success: true, data: null },
    {
      headers: {
        'Set-Cookie': 'refresh_token=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0',
      },
    },
  )
})

export const authHandlers = [
  loginHandler,
  registerHandler,
  getProfileHandler,
  refreshTokenHandler,
  logoutHandler,
]
