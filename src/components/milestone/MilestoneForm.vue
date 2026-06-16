<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
    <el-form-item label="名称" prop="name">
      <el-input
        v-model="form.name"
        placeholder="请输入里程碑名称"
        maxlength="100"
        show-word-limit
      />
    </el-form-item>
    <el-form-item label="描述" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        placeholder="请输入里程碑描述（可选）"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>
    <el-form-item label="截止日期" prop="due_date">
      <el-date-picker
        v-model="form.due_date"
        type="date"
        placeholder="选择截止日期（可选）"
        value-format="YYYY-MM-DD"
        style="width: 100%"
      />
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
defineOptions({ name: 'MilestoneForm' })
import type { FormInstance, FormRules } from 'element-plus'
import { reactive, ref } from 'vue'

import type { Milestone, MilestoneCreateParams, MilestoneUpdateParams } from '@/types/milestone'

const props = withDefaults(
  defineProps<{
    initialData?: Milestone | null
    loading?: boolean
    submitText?: string
  }>(),
  {
    loading: false,
    submitText: '创建',
  },
)

const emit = defineEmits<{
  submit: [data: MilestoneCreateParams | MilestoneUpdateParams]
  cancel: []
}>()

const formRef = ref<FormInstance>()

const form = reactive({
  name: props.initialData?.name || '',
  description: props.initialData?.description || '',
  due_date: props.initialData?.due_date || (null as string | null),
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入里程碑名称', trigger: 'blur' }],
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    emit('submit', {
      name: form.name,
      description: form.description || undefined,
      due_date: form.due_date || undefined,
    })
  })
}
</script>
