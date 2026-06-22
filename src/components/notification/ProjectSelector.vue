<template>
  <div class="project-selector">
    <el-select
      :model-value="modelValue"
      multiple
      filterable
      placeholder="选择项目"
      :loading="loading"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <el-option
        v-for="project in projects"
        :key="project.id"
        :label="project.name"
        :value="project.id"
      >
        <span>{{ project.name }}</span>
        <span class="member-count">{{ project.members?.length || 0 }} 人</span>
      </el-option>
    </el-select>
    <div v-if="selectedProjects.length > 0" class="selected-tags">
      <el-tag
        v-for="project in selectedProjects"
        :key="project.id"
        closable
        class="project-tag"
        @close="removeProject(project.id)"
      >
        {{ project.name }}
      </el-tag>
    </div>
    <div v-if="modelValue.length > 0" class="count-info">已选择 {{ modelValue.length }} 个项目</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ProjectSelector' })
import { computed, onMounted, ref } from 'vue'

import { getProjects } from '@/api/project'
import type { Project } from '@/types/project'

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const projects = ref<Project[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getProjects({ page_size: 100 })
    if (res.success && res.data) {
      projects.value = res.data.data || []
    }
  } catch {
    // 静默处理
  } finally {
    loading.value = false
  }
})

const selectedProjects = computed(() => {
  return projects.value.filter((p) => props.modelValue.includes(p.id))
})

const removeProject = (id: number) => {
  emit(
    'update:modelValue',
    props.modelValue.filter((pid) => pid !== id),
  )
}
</script>

<style scoped>
.project-selector {
  width: 100%;
}

.project-selector .el-select {
  width: 100%;
}

.member-count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-left: 8px;
}

.selected-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.project-tag {
  cursor: pointer;
}

.count-info {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
