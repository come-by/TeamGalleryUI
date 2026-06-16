import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useArticleStore } from '@/stores/article'
import type { Article } from '@/types'

// Mock article API
vi.mock('@/api/article', () => ({
  getArticles: vi.fn(),
  getArticle: vi.fn(),
  createArticle: vi.fn(),
  updateArticle: vi.fn(),
  deleteArticle: vi.fn(),
  getLatestArticles: vi.fn(),
}))

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 1,
  title: 'Test',
  content: 'Test content',
  type: 'article',
  status: 'published',
  user_id: 1,
  view_count: 0,
  like_count: 0,
  comment_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('useArticleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始化状态', () => {
    it('应该初始化为空状态', () => {
      const store = useArticleStore()
      expect(store.articles).toEqual([])
      expect(store.currentArticle).toBeNull()
      expect(store.total).toBe(0)
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchArticles', () => {
    it('应该成功获取文章列表', async () => {
      const { getArticles } = await import('@/api/article')
      const mockArticles: Article[] = [makeArticle({ id: 1 }), makeArticle({ id: 2 })]
      vi.mocked(getArticles).mockResolvedValue({
        success: true,
        data: {
          data: mockArticles,
          pagination: { total: 2, page: 1, page_size: 10, total_pages: 1 },
        },
      })

      const store = useArticleStore()
      await store.fetchArticles()

      expect(store.articles).toHaveLength(2)
      expect(store.total).toBe(2)
      expect(store.loading).toBe(false)
    })
  })

  describe('createNewArticle', () => {
    it('应该成功创建文章', async () => {
      const { createArticle } = await import('@/api/article')
      const newArticle = makeArticle({ status: 'draft' })
      vi.mocked(createArticle).mockResolvedValue({
        success: true,
        data: newArticle,
      })

      const store = useArticleStore()
      const result = await store.createNewArticle({ title: 'New', content: 'New content' })

      expect(result).toEqual(newArticle)
    })

    it('应该处理创建失败', async () => {
      const { createArticle } = await import('@/api/article')
      vi.mocked(createArticle).mockResolvedValue({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: '数据验证失败' },
      })

      const store = useArticleStore()
      await expect(store.createNewArticle({ title: '' })).rejects.toThrow()
    })
  })

  describe('clearCurrent', () => {
    it('应该清除当前文章引用', () => {
      const store = useArticleStore()
      store.currentArticle = makeArticle()
      store.clearCurrent()
      expect(store.currentArticle).toBeNull()
    })
  })
})
