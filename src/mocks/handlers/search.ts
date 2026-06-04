import { http } from 'msw'
import { delay, successResponse, getQueryParam, paginatedResponse } from '../utils'

// 模拟文章数据
const articles = [
  {
    id: 1,
    title: 'Vue 3 组合式 API 最佳实践',
    summary: 'Vue 3 Composition API 的使用技巧',
    category: '前端',
    tags: ['Vue', 'JavaScript'],
  },
  {
    id: 2,
    title: 'TypeScript 高级类型技巧',
    summary: '深入理解 TypeScript 的类型系统',
    category: '前端',
    tags: ['TypeScript'],
  },
  {
    id: 3,
    title: 'Node.js 性能优化指南',
    summary: '如何优化 Node.js 应用的性能',
    category: '后端',
    tags: ['Node.js', '性能'],
  },
  {
    id: 4,
    title: 'React 18 新特性解析',
    summary: 'React 18 带来了哪些新特性',
    category: '前端',
    tags: ['React'],
  },
  {
    id: 5,
    title: 'Docker 容器化部署实践',
    summary: '使用 Docker 进行应用部署',
    category: '运维',
    tags: ['Docker', 'DevOps'],
  },
]

// 搜索文章
export const searchArticlesHandler = http.get('/api/v1/search', async ({ request }) => {
  await delay()

  const q = getQueryParam(request, 'q')?.toLowerCase() || ''
  const page = parseInt(getQueryParam(request, 'page') || '1', 10)
  const pageSize = parseInt(getQueryParam(request, 'page_size') || '10', 10)

  if (!q) {
    return paginatedResponse([], 0, page, pageSize)
  }

  const results = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
  )

  const total = results.length
  const start = (page - 1) * pageSize
  const list = results.slice(start, start + pageSize).map((a) => ({
    ...a,
    user: { id: 1, nickname: '管理员', username: 'admin' },
    view_count: Math.floor(Math.random() * 100),
    like_count: Math.floor(Math.random() * 20),
    created_at: '2024-01-01T00:00:00Z',
  }))

  return paginatedResponse(list, total, page, pageSize)
})

// 搜索建议
export const searchSuggestionsHandler = http.get(
  '/api/v1/search/suggestions',
  async ({ request }) => {
    await delay()

    const q = getQueryParam(request, 'q')?.toLowerCase() || ''
    const limit = parseInt(getQueryParam(request, 'limit') || '10', 10)

    if (q.length < 2) {
      return successResponse([])
    }

    const suggestions = [
      'Vue 3 组合式 API',
      'Vue 3 入门教程',
      'Vue 3 与 TypeScript',
      'TypeScript 高级类型',
      'TypeScript 入门',
      'Node.js 性能优化',
      'Node.js 最佳实践',
      'React 18 新特性',
      'Docker 容器化',
      'Docker 部署',
    ]
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, limit)

    return successResponse(suggestions)
  }
)

export const searchHandlers = [searchArticlesHandler, searchSuggestionsHandler]
