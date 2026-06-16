import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  createArticle,
  deleteArticle,
  getArticle,
  getArticles,
  getLatestArticles,
  updateArticle,
} from '@/api/article'
import type { Article, ArticleListParams } from '@/types'
import { handleApiError } from '@/utils/error'

/**
 * 文章状态管理 Store
 * 管理文章列表、详情、CRUD 操作和加载状态
 */
export const useArticleStore = defineStore('article', () => {
  /** 文章列表 */
  const articles = ref<Article[]>([])
  /** 当前选中的文章 */
  const currentArticle = ref<Article | null>(null)
  /** 文章总数 */
  const total = ref(0)
  /** 加载状态 */
  const loading = ref(false)

  /**
   * 获取文章列表
   *
   * @param params - 查询参数
   */
  const fetchArticles = async (params: ArticleListParams = {}): Promise<void> => {
    loading.value = true
    try {
      const res = await getArticles(params)
      if (res.success) {
        articles.value = res.data?.data || []
        total.value = res.data?.pagination?.total || 0
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取单篇文章详情
   *
   * @param id - 文章 ID
   */
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

  /**
   * 获取最新文章
   *
   * @param count - 获取数量，默认 5
   */
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

  /**
   * 创建新文章
   *
   * @param data - 文章创建数据
   * @returns 创建的文章
   * @throws {Error} 创建失败时抛出错误
   */
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

  /**
   * 更新现有文章
   *
   * @param id - 文章 ID
   * @param data - 更新数据
   * @returns 更新后的文章
   * @throws {Error} 更新失败时抛出错误
   */
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

  /**
   * 删除文章
   *
   * @param id - 文章 ID
   * @throws {Error} 删除失败时抛出错误
   */
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

  /** 清除当前选中的文章引用 */
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
