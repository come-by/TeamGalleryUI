<template>
  <div class="milestone-progress" v-if="summary">
    <div class="progress-header">
      <span class="progress-label">项目进度</span>
      <span class="progress-rate">{{ completionRateText }}</span>
    </div>
    <el-progress
      :percentage="Math.round(summary.completion_rate)"
      :color="progressColor"
      :stroke-width="8"
    />
    <div class="progress-stats">
      <el-tag
        v-for="stat in statusStats"
        :key="stat.type"
        :type="stat.tagType"
        :effect="stat.active ? 'dark' : 'plain'"
        size="small"
        class="stat-tag"
        @click="$emit('filter', stat.status)"
      >
        {{ stat.label }} {{ stat.count }}
      </el-tag>
    </div>
    <div class="next-due" v-if="summary.next_due">
      <el-icon><Timer /></el-icon>
      <span>下一个截止：{{ summary.next_due.name }}</span>
      <span class="due-date">{{ formatDate(summary.next_due.due_date) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MilestoneProgress' })
import { Timer } from '@element-plus/icons-vue'
import { computed } from 'vue'

import type { MilestoneSummary } from '@/types/milestone'
import { MILESTONE_STATUS_COLOR, MILESTONE_STATUS_LABEL } from '@/utils/constants'

const props = defineProps<{
  summary: MilestoneSummary | null
}>()

defineEmits<{
  filter: [status: string]
}>()

const completionRateText = computed(() => {
  if (!props.summary) return ''
  return `${Math.round(props.summary.completion_rate)}%`
})

const progressColor = computed(() => {
  if (!props.summary) return undefined
  const rate = props.summary.completion_rate
  if (rate >= 80) return '#67C23A'
  if (rate >= 40) return '#409EFF'
  return '#E6A23C'
})

const statusStats = computed(() => {
  if (!props.summary) return []
  return [
    {
      status: 'pending',
      type: 'pending',
      label: MILESTONE_STATUS_LABEL.pending,
      count: props.summary.pending,
      tagType: 'info' as const,
      active: false,
      color: MILESTONE_STATUS_COLOR.pending,
    },
    {
      status: 'in_progress',
      type: 'in_progress',
      label: MILESTONE_STATUS_LABEL.in_progress,
      count: props.summary.in_progress,
      tagType: '' as const,
      active: true,
      color: MILESTONE_STATUS_COLOR.in_progress,
    },
    {
      status: 'completed',
      type: 'completed',
      label: MILESTONE_STATUS_LABEL.completed,
      count: props.summary.completed,
      tagType: 'success' as const,
      active: false,
      color: MILESTONE_STATUS_COLOR.completed,
    },
    {
      status: 'overdue',
      type: 'overdue',
      label: MILESTONE_STATUS_LABEL.overdue,
      count: props.summary.overdue,
      tagType: 'danger' as const,
      active: false,
      color: MILESTONE_STATUS_COLOR.overdue,
    },
  ]
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '未设置'
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.milestone-progress {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.progress-rate {
  font-weight: 700;
  color: var(--el-color-primary);
}

.progress-stats {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.stat-tag {
  cursor: pointer;
}

.next-due {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.due-date {
  font-weight: 600;
  color: var(--el-color-warning);
}
</style>
