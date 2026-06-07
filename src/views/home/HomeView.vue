<template>
  <div class="home">
    <el-row :gutter="24">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <h2>最新文章</h2>
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
                <span class="author">
                  <el-icon><user /></el-icon>
                  {{ article.user?.nickname || article.user?.username || '未知' }}
                </span>
                <span
                  ><el-icon><view /></el-icon> {{ article.view_count }}</span
                >
                <span
                  ><el-icon><star /></el-icon> {{ article.like_count }}</span
                >
                <span
                  ><el-icon><chat-dot-round /></el-icon> {{ article.comment_count }}</span
                >
                <span class="time">{{
                  formatDate(article.published_at || article.created_at)
                }}</span>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="sidebar-card">
          <template #header>
            <h3>快捷操作</h3>
          </template>
          <el-button
            type="primary"
            @click="$router.push('/articles')"
            style="width: 100%; margin-bottom: 10px"
          >
            浏览全部文章
          </el-button>
          <el-button
            v-if="isLoggedIn"
            @click="$router.push('/articles/create')"
            style="width: 100%"
          >
            写文章
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HomeView' })
import { ChatDotRound, Star, User } from '@element-plus/icons-vue'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useArticleStore } from '@/stores/article'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/format'

const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()

const articles = computed(() => articleStore.articles)
const loading = computed(() => articleStore.loading)
const isLoggedIn = computed(() => userStore.isLoggedIn)

onMounted(async () => {
  await articleStore.fetchLatest(10)
})

const goToArticle = (id: number) => {
  router.push(`/articles/${id}`)
}
</script>

<style scoped>
.home {
  max-width: 1200px;
}

.card-header h2 {
  font-size: 18px;
  color: #333;
}

.sidebar-card h3 {
  font-size: 16px;
  color: #333;
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
  font-size: 16px;
}

.summary {
  color: #666;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
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

.meta .el-icon {
  margin-right: 4px;
}

.loading,
.empty {
  padding: 40px 0;
}
</style>
