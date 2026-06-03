import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { handleApiError } from '@/utils/error'
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
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
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
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      loading.value = false
    }
  }

  const fetchLatest = async (count = 5): Promise<void> => {
    try {
      const res = await getLatestArticles(count)
      if (res.success) {
        articles.value = res.data || []
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
    }
  }

  const createNewArticle = async (data: Partial<Article>): Promise<Article> => {
    try {
      const res = await createArticle(data)
      if (res.success && res.data) {
        ElMessage.success('创建文章成功')
        return res.data
      }
      handleApiError(res.error)
      throw new Error(res.error?.message || '创建失败')
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  const updateExistingArticle = async (id: number, data: Partial<Article>): Promise<Article> => {
    try {
      const res = await updateArticle(id, data)
      if (res.success && res.data) {
        ElMessage.success('更新文章成功')
        return res.data
      }
      handleApiError(res.error)
      throw new Error(res.error?.message || '更新失败')
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  const removeArticle = async (id: number): Promise<void> => {
    try {
      const res = await deleteArticle(id)
      if (res.success) {
        ElMessage.success('删除文章成功')
      } else {
        handleApiError(res.error)
        throw new Error(res.error?.message || '删除失败')
      }
    } catch (error) {
      handleApiError(error)
      throw error
    }
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
