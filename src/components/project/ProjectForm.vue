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
import { reactive, ref } from 'vue'

import type { Project, ProjectCreateParams, ProjectUpdateParams } from '@/types/project'

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

const formRef = ref<FormInstance>()

const form = reactive<{
  name: string
  description: string
  cover_image: string
  status: 'active' | 'archived'
}>({
  name: props.initialData?.name || '',
  description: props.initialData?.description || '',
  cover_image: props.initialData?.cover_image || '',
  status: props.initialData?.status || 'active',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
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

  emit('submit', data)
}
</script>

<style scoped>
.el-form {
  max-width: 600px;
}
</style>
