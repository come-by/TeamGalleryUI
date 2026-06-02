<template>
  <div class="favorites">
    <el-card>
      <template #header>
        <h2>我的收藏</h2>
      </template>
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="articles.length === 0" class="empty">
        <el-empty description="暂无收藏" />
      </div>
      <div v-else class="article-list">
        <el-card
          v-for="article in articles"
          :key="article.id"
          class="article-item"
          shadow="hover"
          @click="$router.push(`/articles/${article.id}`)"
        >
          <h3>{{ article.title }}</h3>
          <p class="summary">{{ article.summary || '暂无摘要' }}</p>
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
import { ref, onMounted } from 'vue'
import { getFavorites } from '@/api/interaction'
import type { Article } from '@/types'

const articles = ref<Article[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

onMounted(async () => {
  await fetchFavorites()
})

const fetchFavorites = async () => {
  loading.value = true
  try {
    const res = await getFavorites({
      page: currentPage.value,
      page_size: pageSize.value,
    })
    if (res.success) {
      articles.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchFavorites()
}
</script>

<style scoped>
.favorites h2 {
  font-size: 18px;
  color: #333;
}

.article-item {
  margin-bottom: 12px;
  cursor: pointer;
}

.article-item h3 {
  margin-bottom: 8px;
  color: #409eff;
}

.summary {
  color: #666;
  margin-bottom: 12px;
  font-size: 14px;
}

.meta {
  display: flex;
  gap: 16px;
  color: #999;
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
