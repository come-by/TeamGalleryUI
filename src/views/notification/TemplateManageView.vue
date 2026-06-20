<template>
  <div class="template-manage">
    <div class="page-header">
      <h2>通知模板管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">创建模板</el-button>
    </div>

    <!-- 模板卡片列表 -->
    <el-row :gutter="16" v-loading="loading">
      <el-col v-for="tpl in templates" :key="tpl.id" :xs="24" :sm="12" :lg="8" class="tpl-col">
        <el-card class="tpl-card" :class="{ 'is-system': tpl.is_system }" shadow="hover">
          <template #header>
            <div class="tpl-header">
              <span class="tpl-name">
                <el-tag v-if="tpl.is_system" type="info" size="small" class="sys-tag">系统</el-tag>
                {{ tpl.name }}
              </span>
              <div class="tpl-actions">
                <el-tag :type="categoryTagType(tpl.category)" size="small">
                  {{ categoryLabel(tpl.category) }}
                </el-tag>
              </div>
            </div>
          </template>
          <div class="tpl-body">
            <p class="tpl-title-text">{{ tpl.title }}</p>
            <p class="tpl-content-text">{{ tpl.content }}</p>
            <p v-if="tpl.summary" class="tpl-summary-text">{{ tpl.summary }}</p>
          </div>
          <div class="tpl-footer">
            <span class="urgency-tag">
              <el-tag :type="urgencyTagType(tpl.urgency)" size="small">
                {{ urgencyLabel(tpl.urgency) }}
              </el-tag>
            </span>
            <div class="tpl-btns">
              <el-button size="small" @click="handleUse(tpl)">使用</el-button>
              <el-button
                size="small"
                type="primary"
                :disabled="tpl.is_system"
                @click="openEdit(tpl)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="确定删除该模板吗？"
                confirm-button-text="删除"
                cancel-button-text="取消"
                @confirm="handleDelete(tpl.id)"
              >
                <template #reference>
                  <el-button size="small" type="danger" :disabled="tpl.is_system">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <el-empty v-if="!loading && templates.length === 0" description="暂无模板" />

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingTpl ? '编辑模板' : '创建模板'"
      width="640px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="如：系统维护通知" maxlength="100" />
        </el-form-item>
        <el-form-item label="模板分类" prop="category">
          <el-select v-model="form.category" placeholder="选择分类">
            <el-option label="系统通知" value="system" />
            <el-option label="项目通知" value="project" />
            <el-option label="公告" value="announcement" />
          </el-select>
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-radio-group v-model="form.urgency">
            <el-radio value="normal">普通</el-radio>
            <el-radio value="important">重要</el-radio>
            <el-radio value="urgent">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板标题" prop="title">
          <el-input v-model="form.title" placeholder="标题支持 {变量名} 占位符" maxlength="200" />
          <div class="form-tip">支持占位符，如：{project_name}、{feature_name}</div>
        </el-form-item>
        <el-form-item label="模板摘要">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="2"
            placeholder="模板用途简介"
            maxlength="500"
          />
        </el-form-item>
        <el-form-item label="模板内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="内容支持 Markdown 和 {变量名} 占位符"
          />
          <div class="form-tip">支持 Markdown 格式和 {变量名} 占位符</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ editingTpl ? '保存修改' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'TemplateManageView' })

import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from '@/api/notification'
import type { NotificationTemplate, NotificationTemplateCreateParams } from '@/types/notification'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingTpl = ref<NotificationTemplate | null>(null)
const templates = ref<NotificationTemplate[]>([])
const formRef = ref<FormInstance>()

const form = reactive<NotificationTemplateCreateParams & { id?: number }>({
  name: '',
  title: '',
  content: '',
  summary: '',
  category: 'system',
  urgency: 'normal',
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  title: [{ required: true, message: '请输入模板标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }],
}

const categoryLabel = (cat: string) => {
  const map: Record<string, string> = { system: '系统', project: '项目', announcement: '公告' }
  // eslint-disable-next-line security/detect-object-injection
  return map[cat] || cat
}

const categoryTagType = (cat: string) => {
  const map: Record<string, string> = { system: '', project: 'success', announcement: 'warning' }
  // eslint-disable-next-line security/detect-object-injection
  return map[cat] || ''
}

const urgencyLabel = (u: string) => {
  const map: Record<string, string> = { normal: '普通', important: '重要', urgent: '紧急' }
  // eslint-disable-next-line security/detect-object-injection
  return map[u] || u
}

const urgencyTagType = (u: string) => {
  const map: Record<string, string> = { normal: 'info', important: 'warning', urgent: 'danger' }
  // eslint-disable-next-line security/detect-object-injection
  return map[u] || 'info'
}

const fetchTemplates = async () => {
  loading.value = true
  try {
    const res = await getTemplates()
    if (res.success && res.data) {
      templates.value = res.data
    }
  } catch {
    ElMessage.error('加载模板列表失败')
  } finally {
    loading.value = false
  }
}

const openEdit = (tpl: NotificationTemplate) => {
  editingTpl.value = tpl
  form.id = tpl.id
  form.name = tpl.name
  form.title = tpl.title
  form.content = tpl.content
  form.summary = tpl.summary
  form.category = tpl.category
  form.urgency = tpl.urgency
  showCreateDialog.value = true
}

const resetForm = () => {
  editingTpl.value = null
  form.id = undefined
  form.name = ''
  form.title = ''
  form.content = ''
  form.summary = ''
  form.category = 'system'
  form.urgency = 'normal'
  formRef.value?.resetFields()
}

const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (editingTpl.value) {
      await updateTemplate(form.id!, {
        name: form.name,
        title: form.title,
        content: form.content,
        summary: form.summary,
        category: form.category,
        urgency: form.urgency,
      })
      ElMessage.success('模板更新成功')
    } else {
      await createTemplate({
        name: form.name,
        title: form.title,
        content: form.content,
        summary: form.summary,
        category: form.category,
        urgency: form.urgency,
      })
      ElMessage.success('模板创建成功')
    }
    showCreateDialog.value = false
    await fetchTemplates()
  } catch (err: unknown) {
    const e = err as { message?: string }
    ElMessage.error(e.message || '操作失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteTemplate(id)
    ElMessage.success('模板已删除')
    await fetchTemplates()
  } catch (err: unknown) {
    const e = err as { message?: string }
    ElMessage.error(e.message || '删除失败')
  }
}

const handleUse = (tpl: NotificationTemplate) => {
  // 跳转到通知创建页面，并通过 query 传递模板数据
  router.push({
    path: '/notifications/create',
    query: {
      templateId: tpl.id.toString(),
    },
  })
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.template-manage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.tpl-col {
  margin-bottom: 16px;
}

.tpl-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tpl-card.is-system {
  border-left: 3px solid var(--el-color-info);
}

.tpl-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tpl-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sys-tag {
  font-size: 11px;
}

.tpl-body {
  flex: 1;
  min-height: 120px;
}

.tpl-title-text {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.tpl-content-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
  margin-bottom: 8px;
}

.tpl-summary-text {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.tpl-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.tpl-btns {
  display: flex;
  gap: 6px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
