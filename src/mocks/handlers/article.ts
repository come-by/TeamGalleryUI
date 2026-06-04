import { http } from 'msw'
import {
  delay,
  successResponse,
  errorResponse,
  getRequestBody,
  getQueryParam,
  paginatedResponse,
  verifyToken,
} from '../utils'

// 模拟文章数据库
const articles = [
  {
    id: 1,
    title: 'Vue 3 组合式 API 最佳实践',
    content: '本文介绍 Vue 3 Composition API 的使用技巧...',
    summary: 'Vue 3 Composition API 的使用技巧',
    author_id: 1,
    author: { id: 1, username: 'admin', nickname: '管理员' },
    category: '前端',
    tags: ['Vue', 'JavaScript'],
    status: 'published',
    views: 100,
    likes: 10,
    is_liked: false,
    is_favorited: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'TypeScript 高级类型技巧',
    content: '深入理解 TypeScript 的类型系统...',
    summary: 'TypeScript 类型系统深入解析',
    author_id: 2,
    author: { id: 2, username: 'testuser', nickname: '测试用户' },
    category: '前端',
    tags: ['TypeScript'],
    status: 'published',
    views: 50,
    likes: 5,
    is_liked: false,
    is_favorited: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    title: 'Node.js 性能优化指南',
    content: '如何优化 Node.js 应用的性能...',
    summary: 'Node.js 性能优化实践',
    author_id: 1,
    author: { id: 1, username: 'admin', nickname: '管理员' },
    category: '后端',
    tags: ['Node.js', '性能'],
    status: 'draft',
    views: 0,
    likes: 0,
    is_liked: false,
    is_favorited: false,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
]

let nextId = 4

// 获取文章列表
export const getArticlesHandler = http.get('/api/v1/articles', async ({ request }) => {
  await delay()

  const page = parseInt(getQueryParam(request, 'page') || '1', 10)
  const pageSize = parseInt(getQueryParam(request, 'page_size') || '10', 10)
  const category = getQueryParam(request, 'category')
  const tag = getQueryParam(request, 'tag')
  const status = getQueryParam(request, 'status')
  const keyword = getQueryParam(request, 'keyword')

  let filtered = articles.filter((a) => a.status === 'published')

  if (category) {
    filtered = filtered.filter((a) => a.category === category)
  }
  if (tag) {
    filtered = filtered.filter((a) => a.tags.includes(tag))
  }
  if (status) {
    filtered = articles.filter((a) => a.status === status)
  }
  if (keyword) {
    const kw = keyword.toLowerCase()
    filtered = filtered.filter(
      (a) => a.title.toLowerCase().includes(kw) || a.content.toLowerCase().includes(kw)
    )
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return paginatedResponse(list, total, page, pageSize)
})

// 获取文章详情
export const getArticleHandler = http.get('/api/v1/articles/:id', async ({ params }) => {
  await delay()

  const id = parseInt(params.id as string, 10)
  const article = articles.find((a) => a.id === id)

  if (!article) {
    return errorResponse('ARTICLE_NOT_FOUND', '文章不存在', 404)
  }

  return successResponse(article)
})

// 创建文章
export const createArticleHandler = http.post('/api/v1/articles', async ({ request }) => {
  await delay()

  if (!verifyToken(request)) {
    return errorResponse('UNAUTHORIZED', '请先登录', 401)
  }

  const body = await getRequestBody(request)
  const title = body.title as string
  const content = (body.content as string) || ''
  const category = (body.category as string) || '其他'
  const tags = (body.tags as string[]) || []
  const status = (body.status as string) || 'draft'

  if (!title) {
    return errorResponse('VALIDATION_FAILED', '标题不能为空', 400, [
      { field: 'title', message: '标题不能为空' },
    ])
  }

  const newArticle = {
    id: nextId++,
    title,
    content,
    summary: content.slice(0, 100),
    author_id: 1,
    author: { id: 1, username: 'admin', nickname: '管理员' },
    category,
    tags,
    status,
    views: 0,
    likes: 0,
    is_liked: false,
    is_favorited: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  articles.push(newArticle)
  return successResponse(newArticle)
})

// 更新文章
export const updateArticleHandler = http.put(
  '/api/v1/articles/:id',
  async ({ params, request }) => {
    await delay()

    if (!verifyToken(request)) {
      return errorResponse('UNAUTHORIZED', '请先登录', 401)
    }

    const id = parseInt(params.id as string, 10)
    const index = articles.findIndex((a) => a.id === id)

    if (index === -1) {
      return errorResponse('ARTICLE_NOT_FOUND', '文章不存在', 404)
    }

    const body = await getRequestBody(request)
    articles[index] = { ...articles[index], ...body, updated_at: new Date().toISOString() }

    return successResponse(articles[index])
  }
)

// 删除文章
export const deleteArticleHandler = http.delete(
  '/api/v1/articles/:id',
  async ({ params, request }) => {
    await delay()

    if (!verifyToken(request)) {
      return errorResponse('UNAUTHORIZED', '请先登录', 401)
    }

    const id = parseInt(params.id as string, 10)
    const index = articles.findIndex((a) => a.id === id)

    if (index === -1) {
      return errorResponse('ARTICLE_NOT_FOUND', '文章不存在', 404)
    }

    articles.splice(index, 1)
    return successResponse({ message: '删除成功' })
  }
)

// 点赞文章
export const likeArticleHandler = http.post(
  '/api/v1/articles/:id/like',
  async ({ params, request }) => {
    await delay()

    if (!verifyToken(request)) {
      return errorResponse('UNAUTHORIZED', '请先登录', 401)
    }

    const id = parseInt(params.id as string, 10)
    const article = articles.find((a) => a.id === id)

    if (!article) {
      return errorResponse('ARTICLE_NOT_FOUND', '文章不存在', 404)
    }

    if (article.is_liked) {
      article.likes -= 1
      article.is_liked = false
    } else {
      article.likes += 1
      article.is_liked = true
    }

    return successResponse({ likes: article.likes, is_liked: article.is_liked })
  }
)

// 收藏文章
export const favoriteArticleHandler = http.post(
  '/api/v1/articles/:id/favorite',
  async ({ params, request }) => {
    await delay()

    if (!verifyToken(request)) {
      return errorResponse('UNAUTHORIZED', '请先登录', 401)
    }

    const id = parseInt(params.id as string, 10)
    const article = articles.find((a) => a.id === id)

    if (!article) {
      return errorResponse('ARTICLE_NOT_FOUND', '文章不存在', 404)
    }

    article.is_favorited = !article.is_favorited
    return successResponse({ is_favorited: article.is_favorited })
  }
)

export const articleHandlers = [
  getArticlesHandler,
  getArticleHandler,
  createArticleHandler,
  updateArticleHandler,
  deleteArticleHandler,
  likeArticleHandler,
  favoriteArticleHandler,
]
