<template>
  <div class="articles-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>文章列表</h2>
          <div class="actions">
            <el-input
              v-model="keyword"
              placeholder="搜索文章"
              style="width: 200px; margin-right: 10px"
              @keyup.enter="handleSearch"
            />
            <el-button @click="handleSearch">搜索</el-button>
            <el-button v-if="isLoggedIn" type="primary" @click="$router.push('/articles/create')">
              写文章
            </el-button>
          </div>
        </div>
      </template>
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="articles.length === 0" class="empty">
        <el-empty description="暂无文章" />
      </div>
      <div v-else class="article-list">
        <el-card
          v-for="article in articles"
          :key="article.id"
          class="article-item"
          shadow="hover"
          @click="goToArticle(article.id)"
        >
          <h3>{{ article.title }}</h3>
          <p class="summary">{{ article.summary || '暂无摘要' }}</p>
          <div class="meta">
            <span>作者: {{ article.user?.nickname || article.user?.username || '未知' }}</span>
            <span
              ><el-icon><view /></el-icon> {{ article.view_count }}</span
            >
            <span
              ><el-icon><star /></el-icon> {{ article.like_count }}</span
            >
            <span
              ><el-icon><chat-dot-round /></el-icon> {{ article.comment_count }}</span
            >
            <span>{{ formatDate(article.published_at || article.created_at) }}</span>
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
import { ChatDotRound, Star } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useArticleStore } from '@/stores/article'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/format'

const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()

const currentPage = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const articles = computed(() => articleStore.articles)
const total = computed(() => articleStore.total)
const loading = computed(() => articleStore.loading)
const isLoggedIn = computed(() => userStore.isLoggedIn)

onMounted(async () => {
  await fetchArticles()
})

const fetchArticles = async () => {
  await articleStore.fetchArticles({
    page: currentPage.value,
    page_size: pageSize.value,
    keyword: keyword.value || undefined,
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchArticles()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchArticles()
}

const goToArticle = (id: number) => {
  router.push(`/articles/${id}`)
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  font-size: 18px;
  color: #333;
}

.actions {
  display: flex;
  align-items: center;
}

.article-item {
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.article-item:hover {
  transform: translateY(-2px);
}

.article-item h3 {
  margin-bottom: 8px;
  color: #409eff;
}

.summary {
  color: #666;
  margin-bottom: 12px;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 12px;
  align-items: center;
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
