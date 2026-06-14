<template>
  <div class="search-page">
    <el-card>
      <template #header>
        <h2>搜索结果: "{{ keyword }}"</h2>
      </template>
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="articles.length === 0" class="empty">
        <el-empty description="未找到相关文章" />
      </div>
      <div v-else class="article-list">
        <el-card
          v-for="article in articles"
          :key="article.id"
          class="article-item"
          shadow="hover"
          @click="$router.push(`/articles/${article.id}`)"
        >
          <h3 v-html="highlightKeyword(article.title)"></h3>
          <p class="summary" v-html="highlightKeyword(article.summary || '暂无摘要')"></p>
          <div class="meta">
            <span>作者: {{ article.user?.nickname || article.user?.username || '未知' }}</span>
            <span>浏览: {{ article.view_count }}</span>
            <span>点赞: {{ article.like_count }}</span>
          </div>
        </el-card>
      </div>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SearchView' })
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { searchArticles } from '@/api/search'
import type { Article } from '@/types'
import { sanitizeHtml } from '@/utils/sanitize'

const route = useRoute()
const articles = ref<Article[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref((route.query.q as string) || '')

onMounted(async () => {
  await fetchResults()
})

const fetchResults = async () => {
  loading.value = true
  try {
    const res = await searchArticles({
      q: keyword.value,
      page: currentPage.value,
      page_size: pageSize.value,
      highlight: true,
    })
    if (res.success) {
      articles.value = res.data?.data || []
      total.value = res.data?.pagination?.total || 0
    }
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchResults()
}

const highlightKeyword = (text: string): string => {
  if (!keyword.value || !text) return text
  const escaped = keyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Input already escaped above, safe to construct regex for text highlighting
  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = new RegExp(`(${escaped})`, 'gi')
  const highlighted = text.replace(regex, '<span class="highlight">$1</span>')
  return sanitizeHtml(highlighted)
}
</script>

<style scoped>
.search-page h2 {
  font-size: 18px;
  color: var(--color-text-primary);
}

.article-item {
  margin-bottom: 12px;
  cursor: pointer;
}

.article-item h3 {
  margin-bottom: 8px;
  color: var(--color-primary);
}

.summary {
  color: var(--color-text-regular);
  margin-bottom: 12px;
  font-size: 14px;
}

.highlight {
  color: #f56c6c;
  font-weight: bold;
}

.meta {
  display: flex;
  gap: 16px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.loading,
.empty {
  padding: 40px 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
