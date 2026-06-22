<template>
  <div class="create-notification">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>发布通知</h2>
          <el-button link type="primary" @click="showTemplatePicker = !showTemplatePicker">
            {{ showTemplatePicker ? '收起模板' : '从模板创建' }}
          </el-button>
        </div>
      </template>

      <!-- 模板选择区 -->
      <el-collapse-transition>
        <div v-show="showTemplatePicker" class="template-picker">
          <p class="picker-tip">选择一个模板，快速填充通知内容：</p>
          <el-select
            v-model="selectedTemplateId"
            placeholder="选择通知模板"
            clearable
            filterable
            class="tpl-select"
            @change="applyTemplate"
          >
            <el-option-group
              v-for="group in templateGroups"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="tpl in group.templates"
                :key="tpl.id"
                :label="tpl.name"
                :value="tpl.id"
              >
                <span>{{ tpl.name }}</span>
                <el-tag size="small" :style="{ marginLeft: '8px' }">{{ tpl.category }}</el-tag>
              </el-option>
            </el-option-group>
          </el-select>
          <el-button
            type="primary"
            text
            size="small"
            class="manage-link"
            @click="$router.push('/notifications/templates')"
          >
            管理模板
          </el-button>
        </div>
      </el-collapse-transition>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入通知标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="通知分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择通知分类" clearable>
            <el-option label="系统通知" value="system" />
            <el-option label="项目通知" value="project" />
            <el-option label="公告" value="announcement" />
          </el-select>
        </el-form-item>
        <el-form-item label="紧急程度" prop="urgency">
          <el-radio-group v-model="form.urgency">
            <el-radio value="normal">普通</el-radio>
            <el-radio value="important">重要</el-radio>
            <el-radio value="urgent">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="定时发布" prop="scheduled_at">
          <el-date-picker
            v-model="form.scheduled_at"
            type="datetime"
            placeholder="选择定时发布时间（留空则立即发布）"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :disabled-date="disabledDate"
            clearable
            style="width: 100%"
          />
          <div class="schedule-tip">留空则立即发布，设置为未来时间将定时自动发布</div>
        </el-form-item>
        <el-form-item label="通知摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="2"
            placeholder="请输入通知摘要（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="12"
            placeholder="请输入通知内容（支持 Markdown）"
          />
        </el-form-item>

        <el-divider content-position="left">目标用户（可选）</el-divider>

        <div class="target-section">
          <el-radio-group v-model="targetType">
            <el-radio value="all">所有人（默认）</el-radio>
            <el-radio value="specific_users">指定用户</el-radio>
            <el-radio value="by_role">按角色</el-radio>
            <el-radio value="by_project">按项目</el-radio>
            <el-radio value="by_team">按团队</el-radio>
          </el-radio-group>

          <div v-if="targetType !== 'all'" class="target-selector-wrapper">
            <UserSelector v-if="targetType === 'specific_users'" v-model="selectedUserIDs" />
            <RoleSelector v-if="targetType === 'by_role'" v-model="selectedRoles" />
            <ProjectSelector v-if="targetType === 'by_project'" v-model="selectedProjectIDs" />
            <TeamSelector v-if="targetType === 'by_team'" v-model="selectedTeamIDs" />

            <div class="resolve-info">
              <el-tag type="info"> 将向所选目标范围内的用户发送此通知 </el-tag>
            </div>
          </div>
        </div>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">发布通知</el-button>
          <el-button type="warning" plain @click="showPreview = true" :disabled="!isFormValid">
            <el-icon><View /></el-icon> 预览
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <NotificationPreview
      v-model:visible="showPreview"
      :title="form.title"
      :content="form.content"
      :summary="form.summary"
      :category="form.category"
      :urgency="form.urgency"
      :author-name="currentUserName"
      :scheduled-at="form.scheduled_at"
      @confirm-publish="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CreateNotificationView' })
import { View } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { createBatchNotification, createNotification, getTemplates } from '@/api/notification'
import ProjectSelector from '@/components/notification/ProjectSelector.vue'
import RoleSelector from '@/components/notification/RoleSelector.vue'
import TeamSelector from '@/components/notification/TeamSelector.vue'
import UserSelector from '@/components/notification/UserSelector.vue'
import { useUserStore } from '@/stores/user'
import type {
  BatchNotificationCreateParams,
  BatchTarget,
  NotificationCreateParams,
  NotificationTemplate,
} from '@/types/notification'

import NotificationPreview from './NotificationPreview.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const showTemplatePicker = ref(false)
const showPreview = ref(false)
const selectedTemplateId = ref<number | ''>('')
const templates = ref<NotificationTemplate[]>([])

const form = reactive<NotificationCreateParams>({
  title: '',
  content: '',
  summary: '',
  category: 'system',
  urgency: 'normal',
  scheduled_at: undefined,
})

// 目标选择相关状态
const targetType = ref<string>('all')
const selectedUserIDs = ref<number[]>([])
const selectedRoles = ref<string[]>([])
const selectedProjectIDs = ref<number[]>([])
const selectedTeamIDs = ref<number[]>([])

const rules = {
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
}

// 按分类分组模板
const templateGroups = computed(() => {
  const groups: Record<string, NotificationTemplate[]> = {
    system: [],
    project: [],
    announcement: [],
  }
  for (const tpl of templates.value) {
    if (groups[tpl.category]) {
      groups[tpl.category].push(tpl)
    }
  }
  const labels: Record<string, string> = {
    system: '系统通知模板',
    project: '项目通知模板',
    announcement: '公告模板',
  }
  return Object.entries(groups)
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => {
      // eslint-disable-next-line security/detect-object-injection
      return { label: labels[k] || k, templates: v }
    })
})

const applyTemplate = (id: number | '') => {
  if (!id) return
  const tpl = templates.value.find((t) => t.id === id)
  if (!tpl) return

  form.title = tpl.title
  form.content = tpl.content
  form.summary = tpl.summary || ''
  if (tpl.category) form.category = tpl.category as NotificationCreateParams['category']
  if (tpl.urgency) form.urgency = tpl.urgency as NotificationCreateParams['urgency']
}

// 禁用今天之前的日期（定时发布不能选过去的时间）
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 允许选今天
}

const currentUserName = computed(() => userStore.nickname || userStore.username || '未知')

const isFormValid = computed(() => !!form.title.trim() && !!form.content.trim())

const buildTargets = (): BatchTarget => {
  switch (targetType.value) {
    case 'specific_users':
      return { type: 'specific_users', user_ids: selectedUserIDs.value }
    case 'by_role':
      return { type: 'by_role', roles: selectedRoles.value }
    case 'by_project':
      return { type: 'by_project', project_ids: selectedProjectIDs.value }
    case 'by_team':
      return { type: 'by_team', team_ids: selectedTeamIDs.value }
    default:
      return { type: 'all' }
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (targetType.value === 'all') {
      // 原有接口：全员可见
      await createNotification(form)
      ElMessage.success('通知发布成功')
    } else {
      // 新接口：定向批量
      const batchData: BatchNotificationCreateParams = {
        ...form,
        targets: buildTargets(),
      }
      const result = await createBatchNotification(batchData)
      if (result.success && result.data) {
        ElMessage.success(`批量通知发布成功！已覆盖 ${result.data.resolved_count} 位用户`)
      }
    }
    router.push('/notifications')
  } catch (error: unknown) {
    const err = error as { message?: string }
    ElMessage.error(err.message || '发布失败')
  } finally {
    loading.value = false
  }
}

// 加载模板列表；如果从模板管理页跳转过来则自动选中
const init = async () => {
  try {
    const res = await getTemplates()
    if (res.success && res.data) {
      templates.value = res.data
    }
  } catch {
    // 静默处理，模板只是辅助功能
  }

  const tid = route.query.templateId
  if (tid && typeof tid === 'string') {
    const id = Number(tid)
    if (!isNaN(id)) {
      showTemplatePicker.value = true
      selectedTemplateId.value = id
      applyTemplate(id)
    }
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.create-notification {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-notification h2 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.template-picker {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.picker-tip {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.tpl-select {
  width: 280px;
}

.manage-link {
  margin-left: auto;
}

.schedule-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.target-section {
  margin-bottom: 20px;
}

.target-selector-wrapper {
  margin-top: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.resolve-info {
  margin-top: 12px;
}
</style>
