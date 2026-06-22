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
            <el-tag
              v-if="notification.notif_category"
              size="small"
              :type="categoryType(notification.notif_category)"
            >
              {{ categoryLabel(notification.notif_category) }}
            </el-tag>
            <el-tag
              v-if="notification.urgency"
              size="small"
              :type="urgencyType(notification.urgency)"
            >
              {{ urgencyLabel(notification.urgency) }}
            </el-tag>
            <el-tag size="small" :type="targetTypeTag(notification.notif_target_type)">
              {{ targetTypeLabel(notification.notif_target_type) }}
            </el-tag>
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

const categoryType = (cat: string): string => {
  const map: Record<string, string> = {
    system: 'info',
    project: 'success',
    announcement: 'warning',
  }
  // eslint-disable-next-line security/detect-object-injection -- safe literal key lookup
  return Object.hasOwn(map, cat) ? map[cat] : 'info'
}

const categoryLabel = (cat: string): string => {
  const map: Record<string, string> = { system: '系统', project: '项目', announcement: '公告' }
  // eslint-disable-next-line security/detect-object-injection -- safe literal key lookup
  return Object.hasOwn(map, cat) ? map[cat] : cat
}

const urgencyType = (urg: string): string => {
  const map: Record<string, string> = { normal: 'info', important: 'warning', urgent: 'danger' }
  // eslint-disable-next-line security/detect-object-injection -- safe literal key lookup
  return Object.hasOwn(map, urg) ? map[urg] : 'info'
}

const urgencyLabel = (urg: string): string => {
  const map: Record<string, string> = { normal: '普通', important: '重要', urgent: '紧急' }
  // eslint-disable-next-line security/detect-object-injection -- safe literal key lookup
  return Object.hasOwn(map, urg) ? map[urg] : urg
}

const targetTypeLabel = (t: string | undefined): string => {
  const map: Record<string, string> = {
    specific_users: '指定用户',
    by_role: '指定角色',
    by_project: '项目成员',
    by_team: '团队成员',
    all: '全员可见',
  }
  // eslint-disable-next-line security/detect-object-injection -- safe literal key lookup
  return t && Object.hasOwn(map, t) ? map[t] : '全员可见'
}

const targetTypeTag = (t: string | undefined): string => {
  if (!t || t === 'all') return ''
  if (t === 'by_project' || t === 'by_team') return 'success'
  return 'info'
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
