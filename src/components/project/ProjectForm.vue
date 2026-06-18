<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
    <el-form-item label="项目名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入项目名称" maxlength="100" show-word-limit />
    </el-form-item>
    <el-form-item label="项目描述" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="4"
        placeholder="请输入项目描述（可选）"
        maxlength="2000"
        show-word-limit
      />
    </el-form-item>
    <el-form-item label="封面图片" prop="cover_image">
      <el-input v-model="form.cover_image" placeholder="请输入封面图片 URL（可选）" />
    </el-form-item>
    <el-form-item v-if="showStatus" label="项目状态" prop="status">
      <el-radio-group v-model="form.status">
        <el-radio value="active">进行中</el-radio>
        <el-radio value="archived">已归档</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 添加成员（仅创建模式） -->
    <el-collapse v-if="isCreateMode" class="members-collapse">
      <el-collapse-item title="添加成员（可选）" name="members">
        <div class="member-section">
          <div v-for="(member, index) in form.members" :key="index" class="member-row">
            <el-input-number
              v-model="member.user_id"
              :min="1"
              placeholder="用户ID"
              controls-position="right"
              style="width: 160px"
            />
            <el-select v-model="member.role" style="width: 120px; margin-left: 8px">
              <el-option label="成员" value="member" />
              <el-option label="管理员" value="admin" />
            </el-select>
            <el-button type="danger" size="small" @click="removeMember(index)">移除</el-button>
          </div>
          <el-button type="primary" text @click="addMember">+ 添加成员</el-button>
          <p class="member-hint">输入用户ID添加项目成员，可在项目创建后继续管理成员。</p>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ submitText }}
      </el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
defineOptions({ name: 'ProjectForm' })
import type { FormInstance, FormRules } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import type {
  MemberInput,
  Project,
  ProjectCreateParams,
  ProjectUpdateParams,
} from '@/types/project'

const props = withDefaults(
  defineProps<{
    initialData?: Project | null
    loading?: boolean
    showStatus?: boolean
    submitText?: string
  }>(),
  {
    loading: false,
    showStatus: false,
    submitText: '提交',
  },
)

const emit = defineEmits<{
  submit: [data: ProjectCreateParams | ProjectUpdateParams]
  cancel: []
}>()

/** 是否为创建模式（无初始数据时为创建） */
const isCreateMode = computed(() => !props.initialData)

const formRef = ref<FormInstance>()

const form = reactive<{
  name: string
  description: string
  cover_image: string
  status: 'active' | 'archived'
  members: MemberInput[]
}>({
  name: props.initialData?.name || '',
  description: props.initialData?.description || '',
  cover_image: props.initialData?.cover_image || '',
  status: props.initialData?.status || 'active',
  members: [],
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
}

const addMember = () => {
  form.members.push({ user_id: 0, role: 'member' })
}

const removeMember = (index: number) => {
  form.members.splice(index, 1)
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const data: ProjectCreateParams | ProjectUpdateParams = {
    name: form.name,
    description: form.description || undefined,
    cover_image: form.cover_image || undefined,
  }

  if (props.showStatus) {
    ;(data as ProjectUpdateParams).status = form.status
  }

  // 创建模式：附带成员列表（过滤掉 user_id 为 0 的无效行）
  if (isCreateMode.value) {
    const validMembers = form.members.filter((m) => m.user_id > 0)
    if (validMembers.length > 0) {
      ;(data as ProjectCreateParams).members = validMembers
    }
  }

  emit('submit', data)
}
</script>

<style scoped>
.el-form {
  max-width: 600px;
}

.members-collapse {
  margin-bottom: 18px;
  max-width: 600px;
}

.member-section {
  padding: 8px 0;
}

.member-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.member-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
</style>
