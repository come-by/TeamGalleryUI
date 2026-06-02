import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getLatestArticles,
} from '@/api/article'
import type { Article, ArticleListParams } from '@/types'

export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>([])
  const currentArticle = ref<Article | null>(null)
  const total = ref(0)
  const loading = ref(false)

  const fetchArticles = async (params: ArticleListParams = {}): Promise<void> => {
    loading.value = true
    try {
      const res = await getArticles(params)
      if (res.success) {
        articles.value = res.data?.list || []
        total.value = res.data?.total || 0
      }
    } catch (error) {
      console.error('获取文章列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchArticle = async (id: number): Promise<void> => {
    loading.value = true
    try {
      const res = await getArticle(id)
      if (res.success) {
        currentArticle.value = res.data || null
      }
    } catch (error) {
      console.error('获取文章详情失败:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchLatest = async (count = 5): Promise<void> => {
    try {
      const res = await getLatestArticles(count)
      if (res.success) {
        articles.value = res.data || []
      }
    } catch (error) {
      console.error('获取最新文章失败:', error)
    }
  }

  const createNewArticle = async (data: Partial<Article>): Promise<Article> => {
    const res = await createArticle(data)
    if (res.success && res.data) {
      return res.data
    }
    throw new Error(res.error?.message || '创建失败')
  }

  const updateExistingArticle = async (id: number, data: Partial<Article>): Promise<Article> => {
    const res = await updateArticle(id, data)
    if (res.success && res.data) {
      return res.data
    }
    throw new Error(res.error?.message || '更新失败')
  }

  const removeArticle = async (id: number): Promise<void> => {
    await deleteArticle(id)
  }

  const clearCurrent = (): void => {
    currentArticle.value = null
  }

  return {
    articles,
    currentArticle,
    total,
    loading,
    fetchArticles,
    fetchArticle,
    fetchLatest,
    createNewArticle,
    updateExistingArticle,
    removeArticle,
    clearCurrent,
  }
})
