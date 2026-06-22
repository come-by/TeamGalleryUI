<template>
  <el-dialog
    :model-value="visible"
    :title="'通知预览'"
    width="900px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-alert type="warning" :closable="false" show-icon class="preview-alert">
      预览模式 — 此通知尚未发布，以下为发布后的展示效果
    </el-alert>

    <el-alert v-if="scheduledAt" type="info" :closable="false" show-icon class="preview-alert">
      将于 {{ formatDateTime(scheduledAt) }} 自动发布
    </el-alert>

    <el-card class="detail-card">
      <template #header>
        <div class="detail-header">
          <h1>{{ title }}</h1>
          <div class="meta">
            <span class="author">
              <el-icon><User /></el-icon>
              {{ authorName }}
            </span>
            <span>
              <el-icon><Calendar /></el-icon>
              {{ displayTime }}
            </span>
            <el-tag v-if="category" size="small" :type="categoryTagType">
              {{ categoryLabelText }}
            </el-tag>
            <el-tag v-if="urgency" size="small" :type="urgencyTagType">
              {{ urgencyLabelText }}
            </el-tag>
          </div>
        </div>
      </template>

      <blockquote v-if="summary" class="summary-block">
        {{ summary }}
      </blockquote>

      <div class="content" v-html="sanitizeHtml(content)"></div>
    </el-card>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-info">
          <el-icon><InfoFilled /></el-icon>
          此通知将根据目标设置向指定范围内的用户可见
        </div>
        <div class="footer-actions">
          <el-button @click="$emit('update:visible', false)">继续编辑</el-button>
          <el-button type="primary" @click="$emit('confirm-publish')">确认发布</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'NotificationPreview' })
import { Calendar, InfoFilled, User } from '@element-plus/icons-vue'
import { computed } from 'vue'

import { formatDateTime } from '@/utils/format'
import { sanitizeHtml } from '@/utils/sanitize'

const props = defineProps<{
  title: string
  content: string
  summary?: string
  category?: 'system' | 'project' | 'announcement'
  urgency?: 'normal' | 'important' | 'urgent'
  authorName: string
  scheduledAt?: string
  visible: boolean
}>()

defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm-publish'): void
}>()

const displayTime = computed(() =>
  props.scheduledAt ? `将于 ${formatDateTime(props.scheduledAt)} 自动发布` : '立即发布',
)

const categoryTagType = computed(() => {
  const map: Record<string, string> = {
    system: 'info',
    project: 'success',
    announcement: 'warning',
  }
  return props.category && Object.hasOwn(map, props.category) ? map[props.category] : 'info'
})

const urgencyTagType = computed(() => {
  const map: Record<string, string> = { normal: 'info', important: 'warning', urgent: 'danger' }
  return props.urgency && Object.hasOwn(map, props.urgency) ? map[props.urgency] : 'info'
})

const categoryLabelText = computed(() => {
  const map: Record<string, string> = { system: '系统', project: '项目', announcement: '公告' }
  return props.category && Object.hasOwn(map, props.category) ? map[props.category] : props.category
})

const urgencyLabelText = computed(() => {
  const map: Record<string, string> = { normal: '普通', important: '重要', urgent: '紧急' }
  return props.urgency && Object.hasOwn(map, props.urgency) ? map[props.urgency] : props.urgency
})
</script>

<style scoped>
.preview-alert {
  margin-bottom: 16px;
}

.detail-card {
  max-width: 100%;
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

.summary-block {
  margin: 0 0 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-left: 4px solid #409eff;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.content {
  line-height: 1.8;
  font-size: 15px;
}

.content :deep(blockquote) {
  margin: 8px 0;
  padding: 8px 16px;
  border-left: 4px solid #ddd;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
}

.footer-actions {
  display: flex;
  gap: 8px;
}
</style>
