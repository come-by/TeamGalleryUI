<template>
  <div class="manual-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>
    <el-card v-else-if="manual" class="detail-card">
      <template #header>
        <div class="manual-header">
          <h1>{{ manual.title }}</h1>
          <div class="meta">
            <span class="author">
              <el-icon><user /></el-icon>
              {{ manual.user?.nickname || manual.user?.username || '未知' }}
            </span>
            <span>
              <el-icon><calendar /></el-icon>
              {{ formatDate(manual.published_at || manual.created_at) }}
            </span>
            <span>
              <el-icon><view /></el-icon> {{ manual.view_count }}
            </span>
          </div>
        </div>
      </template>
      <div class="content" v-html="renderContent(manual.content)"></div>
    </el-card>
    <el-card v-if="!loading && manual" class="comments-section">
      <template #header>
        <h3>评论 ({{ manual.comment_count }})</h3>
      </template>
      <CommentSection :article-id="manual.id" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ManualDetailView' })
import { Calendar, User } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { getManualDetail } from '@/api/manual'
import CommentSection from '@/components/comment/CommentSection.vue'
import type { Article } from '@/types'
import { formatDate } from '@/utils/format'
import { sanitizeHtml } from '@/utils/sanitize'

const route = useRoute()

const manual = ref<Article | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const res = await getManualDetail(id)
    if (res.success && res.data) {
      manual.value = res.data
    }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
})

const renderContent = (content: string): string => {
  return sanitizeHtml(content)
}
</script>

<style scoped>
.detail-card {
  margin-bottom: 20px;
}

.manual-header h1 {
  margin: 0 0 12px;
  font-size: 24px;
}

.meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.content {
  line-height: 1.8;
  font-size: 15px;
}

.comments-section {
  margin-top: 20px;
}
</style>
