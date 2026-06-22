<template>
  <div class="notifications-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>通知公告</h2>
          <el-button v-if="hasUnread" size="small" @click="handleMarkAllRead">
            全部标记已读
          </el-button>
        </div>
      </template>
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="notifications.length === 0" class="empty">
        <el-empty description="暂无通知" />
      </div>
      <div v-else class="notification-list">
        <div
          v-for="item in notifications"
          :key="item.id"
          class="notification-item"
          :class="{ unread: !item.is_read }"
          @click="goToNotification(item.id)"
        >
          <div class="item-left">
            <span v-if="!item.is_read" class="unread-dot"></span>
            <span class="item-title">{{ item.title }}</span>
            <el-tag
              v-if="item.notif_category"
              size="small"
              :type="categoryType(item.notif_category)"
              class="item-tag"
            >
              {{ categoryLabel(item.notif_category) }}
            </el-tag>
            <el-tag
              v-if="item.urgency"
              size="small"
              :type="urgencyType(item.urgency)"
              class="item-tag"
            >
              {{ urgencyLabel(item.urgency) }}
            </el-tag>
            <el-tag size="small" :type="targetTypeTag(item.notif_target_type)" class="item-tag">
              {{ targetTypeLabel(item.notif_target_type) }}
            </el-tag>
          </div>
          <div class="item-right">
            <span class="item-date">{{ formatDate(item.published_at || item.created_at) }}</span>
          </div>
        </div>
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
defineOptions({ name: 'NotificationListView' })
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getNotifications, markAllRead } from '@/api/notification'
import { useNotificationStore } from '@/stores/notification'
import type { NotificationItem } from '@/types/notification'
import { formatDate } from '@/utils/format'

const router = useRouter()
const notificationStore = useNotificationStore()

const notifications = ref<NotificationItem[]>([])
const total = ref(0)
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)

const hasUnread = computed(() => notificationStore.hasUnread)

onMounted(() => {
  fetchNotifications()
})

const fetchNotifications = async () => {
  loading.value = true
  try {
    const res = await getNotifications(currentPage.value, pageSize.value)
    if (res.success && res.data) {
      notifications.value = res.data.data || []
      total.value = res.data.pagination?.total || 0
    }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

const handleMarkAllRead = async () => {
  try {
    await markAllRead()
    notificationStore.unreadCount = 0
    ElMessage.success('全部标记已读')
    fetchNotifications()
  } catch {
    // handled by interceptor
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchNotifications()
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

const goToNotification = (id: number) => {
  router.push(`/notifications/${id}`)
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--el-fill-color-light);
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-item.unread:hover {
  background-color: #e6f2ff;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409eff;
  flex-shrink: 0;
}

.item-title {
  font-size: 14px;
  color: var(--color-text-primary);
}

.item-right {
  flex-shrink: 0;
  margin-left: 16px;
}

.item-date {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
