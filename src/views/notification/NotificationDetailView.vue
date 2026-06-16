<template>
  <div class="notification-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>
    <el-card v-else-if="notification" class="detail-card">
      <template #header>
        <div class="detail-header">
          <h1>{{ notification.title }}</h1>
          <div class="meta">
            <span class="author">
              <el-icon><user /></el-icon>
              {{ notification.user?.nickname || notification.user?.username || '未知' }}
            </span>
            <span>
              <el-icon><calendar /></el-icon>
              {{ formatDate(notification.published_at || notification.created_at) }}
            </span>
          </div>
        </div>
      </template>
      <div class="content" v-html="renderContent(notification.content)"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NotificationDetailView' })
import { Calendar, User } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { getNotificationDetail } from '@/api/notification'
import { useNotificationStore } from '@/stores/notification'
import type { NotificationItem } from '@/types/notification'
import { formatDate } from '@/utils/format'
import { sanitizeHtml } from '@/utils/sanitize'

const route = useRoute()
const notificationStore = useNotificationStore()

const notification = ref<NotificationItem | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const res = await getNotificationDetail(id)
    if (res.success && res.data) {
      notification.value = res.data
      // 打开即标记已读，更新未读计数
      if (!res.data.is_read) {
        notificationStore.fetchUnreadCount()
      }
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
  max-width: 900px;
  margin: 0 auto;
}

.detail-header h1 {
  margin: 0 0 12px;
  font-size: 22px;
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
</style>
