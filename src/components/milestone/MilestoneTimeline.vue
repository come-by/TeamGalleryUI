<template>
  <div class="milestone-timeline" v-loading="loading">
    <!-- 进度概览 -->
    <MilestoneProgress :summary="summary" @filter="handleFilter" />

    <!-- 操作栏 -->
    <div class="timeline-toolbar" v-if="editable">
      <el-button type="primary" size="small" @click="showForm = true">
        <el-icon><Plus /></el-icon>
        添加里程碑
      </el-button>
    </div>

    <!-- 创建/编辑表单 -->
    <el-dialog
      v-model="showForm"
      :title="editingMilestone ? '编辑里程碑' : '创建里程碑'"
      width="500px"
      destroy-on-close
    >
      <MilestoneForm
        :initial-data="editingMilestone"
        :submit-text="editingMilestone ? '保存' : '创建'"
        :loading="formLoading"
        @submit="handleFormSubmit"
        @cancel="showForm = false"
      />
    </el-dialog>

    <!-- 里程碑列表：纵向时间轴 -->
    <div class="timeline-list" v-if="milestones.length > 0">
      <div
        v-for="item in milestones"
        :key="item.id"
        class="timeline-item"
        :class="'status-' + item.display_status"
      >
        <!-- 状态点 + 连线 -->
        <div class="timeline-dot-wrapper">
          <div class="timeline-dot" :style="{ background: getStatusColor(item.display_status) }">
            <el-icon v-if="item.display_status === 'completed'" class="dot-icon"><Check /></el-icon>
            <el-icon v-else-if="item.display_status === 'in_progress'" class="dot-icon"
              ><Loading
            /></el-icon>
            <el-icon v-else-if="item.display_status === 'overdue'" class="dot-icon"
              ><WarningFilled
            /></el-icon>
          </div>
          <div class="timeline-line"></div>
        </div>

        <!-- 内容区 -->
        <div class="timeline-content">
          <div class="content-header">
            <h4 class="milestone-name">{{ item.name }}</h4>
            <el-tag
              :type="getTagType(item.display_status)"
              :effect="item.display_status === 'in_progress' ? 'dark' : 'plain'"
              size="small"
            >
              {{ MILESTONE_STATUS_LABEL[item.display_status] }}
            </el-tag>
          </div>
          <p class="milestone-desc" v-if="item.description">{{ item.description }}</p>
          <div class="content-meta">
            <span class="due-info" v-if="item.due_date">
              <el-icon><Calendar /></el-icon>
              截止: {{ formatDate(item.due_date) }}
            </span>
            <span class="completed-info" v-if="item.completed_at">
              <el-icon><CircleCheck /></el-icon>
              完成: {{ formatDate(item.completed_at) }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="content-actions" v-if="editable">
            <!-- 状态流转按钮 -->
            <template v-if="item.display_status === 'pending'">
              <el-button
                text
                size="small"
                type="primary"
                @click="handleStatusChange(item.id, 'in_progress')"
              >
                开始
              </el-button>
            </template>
            <template
              v-if="item.display_status === 'in_progress' || item.display_status === 'overdue'"
            >
              <el-button
                text
                size="small"
                type="success"
                @click="handleStatusChange(item.id, 'completed')"
              >
                完成
              </el-button>
            </template>
            <template v-if="item.display_status === 'completed'">
              <el-button
                text
                size="small"
                type="warning"
                @click="handleStatusChange(item.id, 'in_progress')"
              >
                重新打开
              </el-button>
            </template>
            <el-button text size="small" @click="handleEdit(item)"> 编辑 </el-button>
            <el-popconfirm title="确定删除该里程碑？" @confirm="handleDelete(item.id)">
              <template #reference>
                <el-button text size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无里程碑" :image-size="80" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MilestoneTimeline' })
import { Calendar, Check, CircleCheck, Loading, Plus, WarningFilled } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'

import { useMilestone } from '@/composables/useMilestone'
import type {
  Milestone,
  MilestoneCreateParams,
  MilestoneStatus,
  MilestoneUpdateParams,
} from '@/types/milestone'
import { MILESTONE_STATUS_COLOR, MILESTONE_STATUS_LABEL } from '@/utils/constants'

import MilestoneForm from './MilestoneForm.vue'
import MilestoneProgress from './MilestoneProgress.vue'

const props = withDefaults(
  defineProps<{
    projectId: number
    editable?: boolean
  }>(),
  {
    editable: false,
  },
)

const {
  milestones,
  summary,
  loading,
  fetchMilestones,
  fetchSummary,
  create,
  update,
  remove,
  updateStatus,
} = useMilestone()

const showForm = ref(false)
const formLoading = ref(false)
const editingMilestone = ref<Milestone | null>(null)
const activeFilter = ref('')

onMounted(() => {
  loadData()
})

function loadData() {
  fetchMilestones(props.projectId, {
    sort_by: 'sort_order',
    status: activeFilter.value || undefined,
  })
  fetchSummary(props.projectId)
}

function handleFilter(status: string) {
  activeFilter.value = activeFilter.value === status ? '' : status
  loadData()
}

async function handleFormSubmit(data: MilestoneCreateParams | MilestoneUpdateParams) {
  formLoading.value = true
  try {
    if (editingMilestone.value) {
      await update(props.projectId, editingMilestone.value.id, data as MilestoneUpdateParams)
    } else {
      await create(props.projectId, data as MilestoneCreateParams)
    }
    showForm.value = false
    editingMilestone.value = null
  } finally {
    formLoading.value = false
  }
}

function handleEdit(item: Milestone) {
  editingMilestone.value = item
  showForm.value = true
}

async function handleStatusChange(id: number, status: MilestoneStatus) {
  await updateStatus(props.projectId, id, status)
}

async function handleDelete(id: number) {
  await remove(props.projectId, id)
}

function getStatusColor(status: string): string {
  // Known status value from MilestoneStatus type, safe bracket access
  // eslint-disable-next-line security/detect-object-injection
  return MILESTONE_STATUS_COLOR[status] || '#909399'
}

function getTagType(status: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'info',
    in_progress: '',
    completed: 'success',
    overdue: 'danger',
  }
  // Known status value from MilestoneStatus type, safe bracket access
  // eslint-disable-next-line security/detect-object-injection
  return map[status] || 'info'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.milestone-timeline {
  padding: 4px 0;
}

.timeline-toolbar {
  margin: 16px 0;
}

.timeline-list {
  margin-top: 8px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}

.timeline-dot-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.dot-icon {
  color: #fff;
  font-size: 14px;
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: var(--el-border-color-light);
  min-height: 20px;
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-content {
  flex: 1;
  padding: 0 0 24px;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.milestone-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.milestone-desc {
  margin: 6px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.content-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  align-items: center;
  flex-wrap: wrap;
}

.due-info,
.completed-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.content-actions {
  margin-top: 8px;
  display: flex;
  gap: 4px;
}
</style>
